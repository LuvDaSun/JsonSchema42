use jns42_core::models::specification::Specification;
use std::{error::Error, path::PathBuf};
use tokio::fs;

pub struct PackageConfiguration<'s> {
  pub package_name: &'s str,
  pub package_version: &'s str,
  pub package_directory: &'s PathBuf,
}

pub async fn generate_package(
  configuration: PackageConfiguration<'_>,
  specification: &Specification,
) -> Result<(), Box<dyn Error>> {
  let PackageConfiguration {
    package_name,
    package_version,
    package_directory,
  } = configuration;

  let root_path = package_directory;
  let src_path = &package_directory.join("src");

  fs::create_dir_all(root_path).await?;
  fs::create_dir_all(src_path).await?;

  let content = super::cargo_toml::generate_file_content(package_name, package_version)?;
  fs::write(root_path.join("Cargo.toml"), content).await?;

  let tokens = super::lib_rs::generate_file_token_stream(specification)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("lib.rs"), content).await?;

  let tokens = super::errors_rs::generate_file_token_stream(specification)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("errors.rs"), content).await?;

  let tokens = super::types_rs::generate_file_token_stream(specification, true)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("types.rs"), content).await?;

  let tokens = super::interiors_rs::generate_file_token_stream(specification, true)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("interiors.rs"), content).await?;

  let tokens = super::types_rs::generate_file_token_stream(specification, false)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("types_secondary.rs"), content).await?;

  let tokens = super::interiors_rs::generate_file_token_stream(specification, false)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("interiors_secondary.rs"), content).await?;

  Ok(())
}
