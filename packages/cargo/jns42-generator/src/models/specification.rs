use super::{arena::Arena, intermediate::IntermediateSchema, schema::SchemaNode};
use crate::{
    schema_transforms,
    utils::{names::optimize_names, url::UrlWithPointer},
};
use im::HashMap;
use inflector::Inflector;
use proc_macro2::{Ident, TokenStream};
use quote::{format_ident, quote};

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
                        parent: None, // TODO

                        id: Some(id.clone()),
                        title: schema.title.clone(),
                        description: schema.description.clone(),
                        examples: None, // TODO
                        deprecated: schema.deprecated,

                        types: schema
                            .types
                            .as_ref()
                            .map(|value| value.iter().map(|value| value.into()).collect()),

                        options: None, // TODO

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

                        reference: None, // TODO

                        contains: None,       // TODO
                        property_names: None, // TODO
                        map_properties: None, // TODO
                        array_items: None,    // TODO
                        r#if: schema.r#if.as_ref().map(|url| *key_map.get(url).unwrap()),
                        then: schema.then.as_ref().map(|url| *key_map.get(url).unwrap()),
                        r#else: schema.r#else.as_ref().map(|url| *key_map.get(url).unwrap()),
                        not: None, // TODO

                        dependent_schemas: None,  // TODO
                        object_properties: None,  // TODO
                        pattern_properties: None, // TODO

                        tuple_items: None, // TODO
                        all_of: schema.all_of.as_ref().map(|value| {
                            value.iter().map(|url| *key_map.get(url).unwrap()).collect()
                        }),
                        any_of: schema.any_of.as_ref().map(|value| {
                            value.iter().map(|url| *key_map.get(url).unwrap()).collect()
                        }),
                        one_of: schema.one_of.as_ref().map(|value| {
                            value.iter().map(|url| *key_map.get(url).unwrap()).collect()
                        }),
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

impl Specification {
    pub fn get_identifier(&self, key: &usize) -> Ident {
        let name = self.get_name(key);
        let identifier = format_ident!("{}", name);
        identifier
    }

    pub fn get_name(&self, key: &usize) -> String {
        let id = self.arena.get_item(*key).id.as_ref().unwrap();
        let uri = UrlWithPointer::parse(id).unwrap();
        let parts = self.names.get(&uri).unwrap();
        let name = format!("T{}", parts.join(" ").to_pascal_case());
        name
    }

    pub fn get_interior_identifier(&self, key: &usize) -> TokenStream {
        let identifier = self.get_identifier(key);
        quote! {super::interior::#identifier}
    }

    pub fn get_interior_name(&self, key: &usize) -> String {
        let name = self.get_name(key);
        let name = format!("super::interior::{}", name);
        name
    }

    pub fn get_type_identifier(&self, key: &usize) -> TokenStream {
        let identifier = self.get_identifier(key);
        quote! {super::interior::#identifier}
    }

    pub fn _get_type_name(&self, key: &usize) -> String {
        let name = self.get_name(key);
        let name = format!("super::types::{}", name);
        name
    }
}
