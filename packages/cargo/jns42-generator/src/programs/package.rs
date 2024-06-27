use crate::generators::package::{generate_package, PackageConfiguration};
use crate::models::Specification;
use clap::Parser;
use jns42_core::documents;
use jns42_core::documents::DocumentContext;
use jns42_core::utils::NodeLocation;
use std::collections::HashSet;
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

  #[arg(long)]
  pub generate_test: bool,

  #[arg(long, default_value_t = 0)]
  pub unique_name_seed: usize,
}

pub async fn run_command(options: CommandOptions) -> Result<(), Box<dyn Error>> {
  let CommandOptions {
    schema_location,
    default_meta_schema_id,
    package_directory,
    package_name,
    package_version,
    ..
  } = options;

  let mut context = Rc::new(DocumentContext::default());
  context.register_well_known_factories().unwrap();

  let mut roots = HashSet::new();

  roots.insert(schema_location.clone());
  context
    .load_from_location(
      schema_location.clone(),
      schema_location.clone(),
      None,
      &default_meta_schema_id,
    )
    .await
    .unwrap();

  let specification = Specification::new(&context, roots);
  generate_package(
    PackageConfiguration {
      package_name: package_name.as_str(),
      package_version: package_version.as_str(),
      package_directory: &package_directory,
    },
    &specification,
  )
  .await?;

  Ok(())
}
