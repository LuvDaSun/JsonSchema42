use clap::{Parser, ValueEnum};
use jns42_core::naming::Sentence;
use std::error::Error;
use std::fs;
use std::path::PathBuf;

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
  pub specifications_directory: PathBuf,

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
    specifications_directory,
    output_directory,
    package_version,
    default_type_name,
    transform_maximum_iterations,
  } = options;

  // read specifications directory
  let mut specification_infos = Vec::new();
  for entry in specifications_directory.read_dir()? {
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

    let Some(name) = path.file_stem() else {
      continue;
    };

    let Some(name) = name.to_str() else {
      continue;
    };

    let name = name.to_string();
    let name_sentence = Sentence::new(&name);

    specification_infos.push(SpecificationInfo {
      name,
      name_sentence,
      path,
    });
  }

  // generate packages
  for specification_info in &specification_infos {
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

  // prepare workspace
  match r#type {
    PackageType::Cargo => {
      let members: Vec<_> = specification_infos
        .iter()
        .map(|specification_info| specification_info.name.as_str())
        .collect();

      let manifest = toml::toml! {
        [workspace]
        resolver = "2"
        members = members
      };

      let contents = toml::ser::to_string_pretty(&manifest)?;
      fs::write(output_directory.join("Cargo.toml"), contents)?;
    }
    PackageType::Npm => {
      let members: Vec<_> = specification_infos
        .iter()
        .map(|specification_info| specification_info.name.as_str())
        .collect();

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

  // test
  {
    let mut child = match r#type {
      PackageType::Cargo => std::process::Command::new("cargo")
        .current_dir(&output_directory)
        .arg("test")
        .spawn(),
      PackageType::Npm => std::process::Command::new("npm")
        .current_dir(&output_directory)
        .arg("test")
        .arg("--workspaces")
        .spawn(),
    }?;
    let status = child.wait()?;
    assert!(status.success());
  }

  Ok(())
}
