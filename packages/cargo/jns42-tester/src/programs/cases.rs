use clap::{Parser, ValueEnum};
use std::error::Error;
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

  // generate packages

  // prepare workspace

  // install

  // build

  // assert valid

  // assert invalid

  Ok(())
}
