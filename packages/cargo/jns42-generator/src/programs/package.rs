use crate::generators::package::{generate_package, PackageConfiguration};
use clap::Parser;
use jns42_core::documents;
use jns42_core::documents::DocumentContext;
use jns42_core::models::Specification;
use jns42_core::utils::node_location::NodeLocation;
use std::error::Error;
use std::path::PathBuf;

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

  let mut context = DocumentContext::new();
  context.register_well_known_factories().unwrap();

  context
    .load_from_location(
      &schema_location,
      &schema_location,
      None,
      &default_meta_schema_id,
    )
    .await
    .unwrap();

  let root_url = context
    .resolve_document_retrieval_location(&schema_location)
    .unwrap();

  let schema_nodes = context.get_schema_nodes();

  let specification = Specification::new(root_url, schema_nodes);
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
