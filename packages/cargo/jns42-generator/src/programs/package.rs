use std::error::Error;
use std::rc::Rc;

use crate::documents::document_context::DocumentContext;
use crate::documents::meta::MetaSchemaId;
use crate::documents::{draft_04, draft_06, draft_07, draft_2019_09, draft_2020_12};
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

    context.register_factory(
        &MetaSchemaId::Draft202012,
        Box::new(|initializer| {
            Rc::new(draft_2020_12::document::Document::new(
                initializer.given_url.clone(),
                initializer.antecedent_url.cloned(),
                initializer.document_node.clone(),
            ))
        }),
    );
    context.register_factory(
        &MetaSchemaId::Draft201909,
        Box::new(|initializer| {
            Rc::new(draft_2019_09::document::Document::new(
                initializer.given_url.clone(),
                initializer.antecedent_url.cloned(),
                initializer.document_node.clone(),
            ))
        }),
    );
    context.register_factory(
        &MetaSchemaId::Draft07,
        Box::new(|initializer| {
            Rc::new(draft_07::document::Document::new(
                initializer.given_url.clone(),
                initializer.antecedent_url.cloned(),
                initializer.document_node.clone(),
            ))
        }),
    );
    context.register_factory(
        &MetaSchemaId::Draft06,
        Box::new(|initializer| {
            Rc::new(draft_06::document::Document::new(
                initializer.given_url.clone(),
                initializer.antecedent_url.cloned(),
                initializer.document_node.clone(),
            ))
        }),
    );
    context.register_factory(
        &MetaSchemaId::Draft04,
        Box::new(|initializer| {
            Rc::new(draft_04::document::Document::new(
                initializer.given_url.clone(),
                initializer.antecedent_url.cloned(),
                initializer.document_node.clone(),
            ))
        }),
    );

    context
        .load_from_url(&schema_url, &schema_url, None, &default_meta_schema_url)
        .await;

    Ok(())
}
