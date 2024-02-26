use super::{arena::Arena, intermediate::IntermediateSchema, schema::SchemaNode};
use crate::utils::{names::optimize_names, url::UrlWithPointer};
use im::HashMap;

pub struct Specification {
    pub arena: Arena<SchemaNode>,
    pub names: HashMap<UrlWithPointer, Vec<String>>,
}

impl Specification {
    pub fn new(intermediate_document: IntermediateSchema) -> Self {
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

        let names = optimize_names(original_names, 5)
            .map(|(id, name)| {
                (
                    id.clone(),
                    name.into_iter().map(|part| part.into_owned()).collect(),
                )
            })
            .collect();

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

        Self { arena, names }
    }
}
