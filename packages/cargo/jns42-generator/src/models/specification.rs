use super::{arena::Arena, intermediate::IntermediateSchema, schema::SchemaNode};
use crate::{
    schema_transforms,
    utils::{names::optimize_names, url::UrlWithPointer},
};
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

        let mut arena = Arena::new();

        {
            let mut key_map = HashMap::new();
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
                        deprecated: schema.deprecated,

                        types: schema
                            .types
                            .as_ref()
                            .map(|value| value.iter().map(|value| value.into()).collect()),

                        minimum_inclusive: schema.minimum_inclusive,
                        minimum_exclusive: schema.minimum_exclusive,
                        maximum_inclusive: schema.maximum_inclusive,
                        maximum_exclusive: schema.maximum_exclusive,
                        multiple_of: schema.multiple_of,

                        minimum_length: schema.minimum_length,
                        maximum_length: schema.maximum_length,
                        value_pattern: schema.value_pattern.clone(),
                        value_format: schema.value_format.clone(),

                        maximum_items: schema.maximum_items,
                        minimum_items: schema.minimum_items,
                        unique_items: schema.unique_items,

                        minimum_properties: schema.minimum_properties,
                        maximum_properties: schema.maximum_properties,
                        required: schema.required.clone(),

                        all_of: schema.all_of.as_ref().map(|value| {
                            value.iter().map(|url| *key_map.get(url).unwrap()).collect()
                        }),
                        any_of: schema.any_of.as_ref().map(|value| {
                            value.iter().map(|url| *key_map.get(url).unwrap()).collect()
                        }),
                        one_of: schema.one_of.as_ref().map(|value| {
                            value.iter().map(|url| *key_map.get(url).unwrap()).collect()
                        }),

                        ..Default::default()
                    };

                    arena.set_item(key, item);
                }
            };

            while arena.apply_transform(transformer) > 0 {
                //
            }
        }

        {
            fn transformer(arena: &mut Arena<SchemaNode>, key: usize) {
                schema_transforms::single_type::single_type_transform(arena, key);
                schema_transforms::explode::explode_transform(arena, key);
            }

            while arena.apply_transform(transformer) > 0 {
                //
            }
        }

        Self { arena, names }
    }
}
