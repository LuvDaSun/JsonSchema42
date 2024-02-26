use crate::documents::{draft_04, draft_06, draft_07, draft_2019_09, draft_2020_12};
use crate::documents::{DocumentContext, MetaSchemaId};
use crate::generators::package::{generate_package, PackageConfiguration};
use crate::models::arena::Arena;
use crate::models::schema::SchemaNode;
use crate::utils::names::optimize_names;
use crate::utils::url::UrlWithPointer;
use clap::Parser;
use im::HashMap;
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

    let context = Rc::new(context);
    context
        .load_from_url(
            &schema_url.clone().into(),
            &schema_url.clone().into(),
            None,
            &default_meta_schema_url,
        )
        .await;

    let intermediate_document = context.get_intermediate_document();

    let urls: Vec<_> = intermediate_document
        .schemas
        .keys()
        .map(|key| UrlWithPointer::parse(key).unwrap())
        .collect();

    let original_names = urls.iter().map(|url| {
        let name: Vec<_> = url
            .get_pointer()
            .as_ref()
            .iter()
            .map(|part| part.as_str())
            .collect();
        (url, name)
    });

    let _optimized_names: Vec<_> = optimize_names(original_names, 5).collect();

    let mut key_map = HashMap::new();
    let mut arena = Arena::new();
    for id in intermediate_document.schemas.keys() {
        let item = SchemaNode {
            id: Some(id.clone()),
            ..Default::default()
        };

        let key = arena.add_item(item);
        key_map.insert(id, key);
    }

    let transformer = |arena: &mut Arena<SchemaNode>, key: usize| {
        let item = arena.get_item(key).clone();
        if let Some(id) = &item.id {
            let schema = intermediate_document.schemas.get(id).unwrap();

            let item = SchemaNode {
                id: Some(id.clone()),
                title: schema.title.clone(),
                description: schema.description.clone(),
                // examples: schema.examples,
                deprecated: item.deprecated,

                minimum_inclusive: item.minimum_inclusive,
                minimum_exclusive: item.minimum_exclusive,
                maximum_inclusive: item.maximum_inclusive,
                maximum_exclusive: item.maximum_exclusive,
                multiple_of: item.multiple_of,

                minimum_length: item.minimum_length,
                maximum_length: item.maximum_length,
                value_pattern: item.value_pattern,
                value_format: item.value_format,

                maximum_items: item.maximum_items,
                minimum_items: item.minimum_items,
                unique_items: item.unique_items,

                minimum_properties: item.minimum_properties,
                maximum_properties: item.maximum_properties,
                required: item.required,

                ..Default::default()
            };

            arena.set_item(key, item);
        }
    };

    while arena.apply_transform(transformer) > 0 {
        //
    }

    for (key, item) in arena.iter() {
        println!("{} / {:?}", key, item);
    }

    generate_package(PackageConfiguration {
        package_name: package_name.as_str(),
        package_version: package_version.as_str(),
        package_directory: &package_directory,
    })
    .await?;

    Ok(())
}
