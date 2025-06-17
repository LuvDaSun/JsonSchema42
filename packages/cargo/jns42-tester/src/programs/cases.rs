use clap::{Parser, ValueEnum};
use jns42_core::naming::Sentence;
use std::error::Error;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, serde::Deserialize)]
struct CaseConfiguration {
  #[serde(default)]
  parse: bool,
  #[serde(default)]
  schemas: Vec<PathBuf>,
  #[serde(default)]
  valid: Vec<serde_yaml::Value>,
  #[serde(default)]
  invalid: Vec<serde_yaml::Value>,
}

struct CaseInfo {
  parse: bool,
  specifications: Vec<SpecificationInfo>,
  valid_values: Vec<serde_json::Value>,
  invalid_values: Vec<serde_json::Value>,
}

struct SpecificationInfo {
  path: PathBuf,
  name: String,
  name_sentence: Sentence,
}

#[derive(Debug, Clone, ValueEnum)]
pub enum PackageType {
  Cargo,
  Npm,
}

#[derive(Parser, Debug)]
pub struct CommandOptions {
  #[arg(long)]
  pub r#type: PackageType,

  #[arg(long)]
  pub cases_directory: PathBuf,

  #[arg(long)]
  pub output_directory: PathBuf,

  #[arg(long, default_value = "0.1.0")]
  pub package_version: String,

  #[arg(long, default_value = "schema-document")]
  pub default_type_name: String,

  #[arg(long, default_value = "100")]
  pub transform_maximum_iterations: usize,
}

pub fn run_command(options: CommandOptions) -> Result<(), Box<dyn Error>> {
  let CommandOptions {
    r#type,
    cases_directory,
    output_directory,
    package_version,
    default_type_name,
    transform_maximum_iterations,
  } = options;

  // read cases directory
  let mut case_infos = Vec::new();
  for entry in cases_directory.read_dir()? {
    let entry = entry?;
    let path = entry.path();
    let extension = path.extension().unwrap_or_default();
    let extension = extension.to_ascii_lowercase();

    if !(extension == "json" || extension == "yaml" || extension == "yml") {
      continue;
    }

    if entry.file_type()?.is_dir() {
      continue;
    }

    let file = fs::File::open(&path)?;
    let configuration: CaseConfiguration = serde_yaml::from_reader(file)?;

    let mut specifications = Vec::new();
    for schema in configuration.schemas {
      let path = path
        .parent()
        .map(std::path::Path::to_path_buf)
        .unwrap_or_default()
        .join(schema);

      let Some(name) = path.file_stem() else {
        continue;
      };

      let Some(name) = name.to_str() else {
        continue;
      };

      let name = name.to_string();
      let name_sentence = Sentence::new(&name);

      specifications.push(SpecificationInfo {
        name,
        name_sentence,
        path,
      });
    }

    let parse = configuration.parse;
    let valid_values = configuration
      .valid
      .iter()
      .map(serde_json::to_value)
      .collect::<Result<Vec<_>, _>>()?;
    let invalid_values = configuration
      .invalid
      .iter()
      .map(serde_json::to_value)
      .collect::<Result<Vec<_>, _>>()?;

    case_infos.push(CaseInfo {
      parse,
      specifications,
      valid_values,
      invalid_values,
    });
  }

  // generate packages
  for case_info in &case_infos {
    for specification_info in &case_info.specifications {
      let package_directory = output_directory.join(&specification_info.name);

      let mut child = match r#type {
        PackageType::Cargo => std::process::Command::new("cargo")
          .arg("run")
          .arg("--package")
          .arg("jns42-generator")
          .arg("--")
          .arg("package")
          .arg("--package-directory")
          .arg(&package_directory)
          .arg("--package-name")
          .arg(specification_info.name_sentence.to_snake_case())
          .arg("--package-version")
          .arg(&package_version)
          .arg("--default-type-name")
          .arg(&default_type_name)
          .arg("--transform-maximum-iterations")
          .arg(transform_maximum_iterations.to_string())
          .arg(&specification_info.path)
          .spawn(),

        PackageType::Npm => std::process::Command::new("npx")
          .arg("jns42-generator")
          .arg("package")
          .arg("--package-directory")
          .arg(&package_directory)
          .arg("--package-name")
          .arg(specification_info.name_sentence.to_snake_case())
          .arg("--package-version")
          .arg(&package_version)
          .arg("--default-type-name")
          .arg(&default_type_name)
          .arg("--transform-maximum-iterations")
          .arg(transform_maximum_iterations.to_string())
          .arg(&specification_info.path)
          .spawn(),
      }?;
      let status = child.wait()?;
      assert!(status.success());
    }
  }

  // prepare workspace
  {
    let members: Vec<_> = case_infos
      .iter()
      .flat_map(|case_info| {
        case_info
          .specifications
          .iter()
          .map(|specification_info| specification_info.name.as_str())
      })
      .collect();

    match r#type {
      PackageType::Cargo => {
        let manifest = toml::toml! {
          [workspace]
          resolver = "2"
          members = members
        };

        let contents = toml::ser::to_string_pretty(&manifest)?;
        fs::write(output_directory.join("Cargo.toml"), contents)?;
      }
      PackageType::Npm => {
        let manifest = serde_json::json! {
          {
          "private": true,
          "workspaces": members,
          }
        };

        let contents = serde_json::to_string_pretty(&manifest)?;
        fs::write(output_directory.join("package.json"), contents)?;
      }
    }
  }

  // install
  {
    let mut child = match r#type {
      PackageType::Cargo => std::process::Command::new("cargo")
        .current_dir(&output_directory)
        .arg("fetch")
        .spawn(),
      PackageType::Npm => std::process::Command::new("npm")
        .current_dir(&output_directory)
        .arg("install")
        .spawn(),
    }?;
    let status = child.wait()?;
    assert!(status.success());
  }

  // build
  {
    let mut child = match r#type {
      PackageType::Cargo => std::process::Command::new("cargo")
        .current_dir(&output_directory)
        .arg("build")
        .spawn(),
      PackageType::Npm => std::process::Command::new("npm")
        .current_dir(&output_directory)
        .arg("run")
        .arg("build")
        .arg("--workspaces")
        .spawn(),
    }?;
    let status = child.wait()?;
    assert!(status.success());
  }

  // assert
  for case_info in &case_infos {
    for specification_info in &case_info.specifications {
      println!("{}", specification_info.name);

      for valid_value in &case_info.valid_values {
        let mut child = match r#type {
          PackageType::Cargo => std::process::Command::new("cargo")
            .current_dir(&output_directory)
            .arg("run")
            .arg("--package")
            .arg(specification_info.name_sentence.to_snake_case())
            .arg("--")
            .arg("assert")
            .args(if case_info.parse {
              vec!["--parse"]
            } else {
              vec![]
            })
            .stdin(std::process::Stdio::piped())
            .spawn(),

          PackageType::Npm => std::process::Command::new("npx")
            .current_dir(&output_directory)
            .arg(specification_info.name_sentence.to_snake_case())
            .arg("assert")
            .args(if case_info.parse {
              vec!["--parse"]
            } else {
              vec![]
            })
            .stdin(std::process::Stdio::piped())
            .spawn(),
        }?;

        if let Some(stdin) = child.stdin.as_mut() {
          serde_json::to_writer(stdin, valid_value)?
        }

        let status = child.wait()?;
        assert!(status.success());
      }

      for invalid_value in &case_info.invalid_values {
        let mut child = match r#type {
          PackageType::Cargo => std::process::Command::new("cargo")
            .current_dir(&output_directory)
            .arg("run")
            .arg("--package")
            .arg(specification_info.name_sentence.to_snake_case())
            .arg("--")
            .arg("assert")
            .arg("--quiet")
            .args(if case_info.parse {
              vec!["--parse"]
            } else {
              vec![]
            })
            .stdin(std::process::Stdio::piped())
            .spawn(),
          PackageType::Npm => std::process::Command::new("npx")
            .current_dir(&output_directory)
            .arg("--package")
            .arg(specification_info.name_sentence.to_snake_case())
            .arg(specification_info.name_sentence.to_snake_case())
            .arg("assert")
            .arg("--quiet")
            .args(if case_info.parse {
              vec!["--parse"]
            } else {
              vec![]
            })
            .stdin(std::process::Stdio::piped())
            .spawn(),
        }?;

        if let Some(stdin) = child.stdin.as_mut() {
          serde_json::to_writer(stdin, invalid_value)?
        }

        let status = child.wait()?;
        assert!(!status.success()); // we expect no success!
      }
    }
  }

  Ok(())
}
