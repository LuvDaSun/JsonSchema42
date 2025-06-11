use clap::{Parser, ValueEnum};
use jns42_core::naming::Sentence;
use std::error::Error;
use std::fs;
use std::path::PathBuf;

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
  let schema_paths: Vec<_> = specifications_directory
    .read_dir()?
    .filter_map(|entry| {
      let entry = entry.ok()?;
      let path = entry.path();
      let extension = path.extension()?;
      let extension = extension.to_ascii_lowercase();

      if !(extension == "json" || extension == "yaml" || extension == "yml") {
        return None;
      }

      let is_dir = entry.file_type().ok()?.is_dir();
      if is_dir {
        return None;
      }

      Some(path)
    })
    .collect();

  // generate packages
  for schema_path in &schema_paths {
    let Some(schema_file_name) = schema_path.file_stem() else {
      continue;
    };
    let Some(schema_file_name) = schema_file_name.to_str() else {
      continue;
    };
    let package_directory = output_directory.join(schema_file_name);
    let package_name = Sentence::new(schema_file_name);
    match r#type {
      PackageType::Cargo => {
        let mut child = std::process::Command::new("cargo")
          .arg("run")
          .arg("--package")
          .arg("jns42-generator")
          .arg("--")
          .arg("package")
          .arg("--package-directory")
          .arg(&package_directory)
          .arg("--package-name")
          .arg(package_name.to_snake_case())
          .arg("--package-version")
          .arg(&package_version)
          .arg("--default-type-name")
          .arg(&default_type_name)
          .arg("--transform-maximum-iterations")
          .arg(transform_maximum_iterations.to_string())
          .arg(schema_path)
          .spawn()?;
        let status = child.wait()?;
        assert!(status.success());
      }
      PackageType::Npm => {
        let mut child = std::process::Command::new("npx")
          .arg("jns42-generator")
          .arg("package")
          .arg("--package-directory")
          .arg(&package_directory)
          .arg("--package-name")
          .arg(package_name.to_snake_case())
          .arg("--package-version")
          .arg(&package_version)
          .arg("--default-type-name")
          .arg(&default_type_name)
          .arg("--transform-maximum-iterations")
          .arg(transform_maximum_iterations.to_string())
          .arg(schema_path)
          .spawn()?;
        let status = child.wait()?;
        assert!(status.success());
      }
    }
  }

  // prepare workspace
  match r#type {
    PackageType::Cargo => {
      let members: Vec<_> = schema_paths
        .iter()
        .filter_map(|schema_path| {
          let schema_file_name = schema_path.file_stem()?;
          let schema_file_name = schema_file_name.to_str()?;
          Some(schema_file_name)
        })
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
      let members: Vec<_> = schema_paths
        .iter()
        .filter_map(|schema_path| {
          let schema_file_name = schema_path.file_stem()?;
          let schema_file_name = schema_file_name.to_str()?;
          Some(schema_file_name)
        })
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
  match r#type {
    PackageType::Cargo => {
      let mut child = std::process::Command::new("cargo")
        .current_dir(&output_directory)
        .arg("fetch")
        .spawn()?;
      let status = child.wait()?;
      assert!(status.success());
    }
    PackageType::Npm => {
      let mut child = std::process::Command::new("npm")
        .current_dir(&output_directory)
        .arg("install")
        .spawn()?;
      let status = child.wait()?;
      assert!(status.success());
    }
  }

  // build
  match r#type {
    PackageType::Cargo => {
      let mut child = std::process::Command::new("cargo")
        .current_dir(&output_directory)
        .arg("build")
        .spawn()?;
      let status = child.wait()?;
      assert!(status.success());
    }
    PackageType::Npm => {
      let mut child = std::process::Command::new("npm")
        .current_dir(&output_directory)
        .arg("run")
        .arg("build")
        .arg("--workspaces")
        .spawn()?;
      let status = child.wait()?;
      assert!(status.success());
    }
  }

  // test
  match r#type {
    PackageType::Cargo => {
      let mut child = std::process::Command::new("cargo")
        .current_dir(&output_directory)
        .arg("test")
        .spawn()?;
      let status = child.wait()?;
      assert!(status.success());
    }
    PackageType::Npm => {
      let mut child = std::process::Command::new("npm")
        .current_dir(&output_directory)
        .arg("test")
        .arg("--workspaces")
        .spawn()?;
      let status = child.wait()?;
      assert!(status.success());
    }
  }

  Ok(())
}
