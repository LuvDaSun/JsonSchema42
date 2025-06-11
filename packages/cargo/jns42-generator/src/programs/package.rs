use crate::generators::package::{PackageConfiguration, generate_package};
use crate::models::{Specification, SpecificationConfiguration};
use clap::Parser;
use jns42_core::documents;
use jns42_core::documents::DocumentContext;
use jns42_core::utilities::NodeLocation;
use std::error::Error;
use std::path::PathBuf;
use std::rc::Rc;

#[derive(Parser, Debug)]
pub struct CommandOptions {
  pub schema_location: NodeLocation,

  #[arg(long, default_value = documents::draft_2020_12::META_SCHEMA_ID)]
  pub default_meta_schema_id: String,

  #[arg(long)]
  pub package_directory: PathBuf,

  #[arg(long)]
  pub package_name: String,

  #[arg(long)]
  pub package_version: String,

  #[arg(long, default_value = "schema-document")]
  pub default_type_name: String,

  #[arg(long, default_value = "100")]
  pub transform_maximum_iterations: usize,
}

pub async fn run_command(options: CommandOptions) -> Result<(), Box<dyn Error>> {
  let CommandOptions {
    schema_location,
    default_meta_schema_id,
    package_directory,
    package_name,
    package_version,
    default_type_name,
    transform_maximum_iterations,
    ..
  } = options;

  let mut context = Rc::new(DocumentContext::default());
  context.register_well_known_factories().unwrap();

  context
    .load_from_location(
      schema_location.clone(),
      schema_location.clone(),
      None,
      &default_meta_schema_id,
    )
    .await
    .unwrap();

  let specification = Specification::new(
    &context,
    SpecificationConfiguration {
      default_type_name,
      transform_maximum_iterations,
    },
  );
  generate_package(
    PackageConfiguration {
      package_name: package_name.as_str(),
      package_version: package_version.as_str(),
      package_directory: &package_directory,
      entry_location: &schema_location,
    },
    &specification,
  )
  .await?;

  Ok(())
}
