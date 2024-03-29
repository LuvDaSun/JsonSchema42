use crate::documents::{draft_04, draft_06, draft_07, draft_2019_09, draft_2020_12};
use crate::documents::{DocumentContext, MetaSchemaId};
use crate::generators::package::{generate_package, PackageConfiguration};
use clap::Parser;
use jns42_core::models::specification::Specification;
use std::error::Error;
use std::path::PathBuf;
use std::rc::Rc;
use url::Url;

#[derive(Parser, Debug)]
pub struct CommandOptions {
  pub schema_url: Url,

  #[arg(long, default_value_t = MetaSchemaId::Draft202012)]
  pub default_meta_schema_url: MetaSchemaId,

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
    schema_url,
    default_meta_schema_url,
    package_directory,
    package_name,
    package_version,
    ..
  } = options;

  let mut context = DocumentContext::new();

  context.register_factory(
    &MetaSchemaId::Draft202012,
    Box::new(move |context, initializer| {
      Rc::new(draft_2020_12::Document::new(
        context,
        initializer.retrieval_url,
        initializer.given_url,
        initializer.antecedent_url,
        initializer.document_node.into(),
      ))
    }),
  );
  context.register_factory(
    &MetaSchemaId::Draft201909,
    Box::new(move |_context, _initializer| Rc::new(draft_2019_09::Document::new())),
  );
  context.register_factory(
    &MetaSchemaId::Draft07,
    Box::new(move |_context, _initializer| Rc::new(draft_07::Document::new())),
  );
  context.register_factory(
    &MetaSchemaId::Draft06,
    Box::new(move |_context, _initializer| Rc::new(draft_06::Document::new())),
  );
  context.register_factory(
    &MetaSchemaId::Draft04,
    Box::new(move |_context, _initializer| Rc::new(draft_04::Document::new())),
  );

  let schema_url = schema_url.clone().into();
  let context = Rc::new(context);
  context
    .load_from_url(&schema_url, &schema_url, None, &default_meta_schema_url)
    .await;

  let root_url = context.resolve_retrieval_url(&schema_url).unwrap();

  let intermediate_document = context.get_intermediate_document();

  let specification = Specification::new(root_url, intermediate_document);

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
