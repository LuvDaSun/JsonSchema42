use std::error::Error;

use crate::documents::document_context::DocumentContext;
use crate::documents::meta::MetaSchemaId;
use clap::Parser;
use url::Url;

#[derive(Parser, Debug)]
pub struct CommandOptions {
    pub schema_url: Url,

    #[arg(long, default_value_t = MetaSchemaId::Draft202012)]
    pub default_meta_schema_url: MetaSchemaId,

    #[arg(long)]
    pub package_directory: String,

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
        schema_url,
        default_meta_schema_url,
        ..
    } = options;

    let mut context = DocumentContext::new();

    context
        .load_from_url(&schema_url, &schema_url, None, &default_meta_schema_url)
        .await;

    Ok(())
}
