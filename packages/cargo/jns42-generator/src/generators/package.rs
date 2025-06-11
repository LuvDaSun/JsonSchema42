use crate::models::Specification;
use jns42_core::utilities::NodeLocation;
use std::{error::Error, fs, path};

pub struct PackageConfiguration<'s> {
  pub package_name: &'s str,
  pub package_version: &'s str,
  pub package_directory: &'s path::PathBuf,
  pub entry_location: &'s NodeLocation,
}

pub fn generate_package(
  configuration: PackageConfiguration<'_>,
  specification: &Specification,
) -> Result<(), Box<dyn Error>> {
  let PackageConfiguration {
    package_name,
    package_version,
    package_directory,
    entry_location,
  } = configuration;

  let root_path = package_directory;
  let src_path = &package_directory.join("src");

  fs::create_dir_all(root_path)?;
  fs::create_dir_all(src_path)?;

  let content = super::cargo_toml::generate_file_content(package_name, package_version)?;
  fs::write(root_path.join("Cargo.toml"), content)?;

  let tokens = super::lib_rs::generate_file_token_stream(specification)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("lib.rs"), content)?;

  let tokens = super::main_rs::generate_file_token_stream(specification, entry_location)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("main.rs"), content)?;

  let tokens = super::errors_rs::generate_file_token_stream(specification)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("errors.rs"), content)?;

  let tokens = super::types_rs::generate_file_token_stream(specification)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("types.rs"), content)?;

  let tokens = super::interiors_rs::generate_file_token_stream(specification)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("interiors.rs"), content)?;

  let tokens = super::examples_test_rs::generate_file_token_stream(specification)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("examples_test.rs"), content)?;

  let tokens = super::mocks_test_rs::generate_file_token_stream(specification)?;
  let content = super::file::generate_file_content(tokens)?;
  fs::write(src_path.join("mocks_test.rs"), content)?;

  Ok(())
}
