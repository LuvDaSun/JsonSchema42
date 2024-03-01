use super::{
  arena::Arena,
  intermediate::IntermediateSchema,
  schema::{SchemaNode, SchemaType},
};
use crate::{
  schema_transforms,
  utils::{name::to_pascal, names::optimize_names, url::UrlWithPointer},
};
use proc_macro2::{Ident, TokenStream};
use quote::{format_ident, quote};
use std::collections::HashMap;
use url::Url;

pub struct Specification {
  pub arena: Arena<SchemaNode>,
  pub names: HashMap<UrlWithPointer, Vec<String>>,
}

impl Specification {
  pub fn new(root_id: String, intermediate_document: IntermediateSchema) -> Self {
    let mut parents: HashMap<_, &str> = HashMap::new();
    let mut implicit_types = HashMap::new();

    // first load schemas in the arena

    let mut arena = Arena::new();
    {
      let mut key_map: HashMap<&str, usize> = HashMap::new();
      for (id, schema) in &intermediate_document.schemas {
        let item = SchemaNode {
          id: Some(id.clone()),
          ..Default::default()
        };

        let key = arena.add_item(item);
        key_map.insert(id, key);

        for child_id in &schema.all_of {
          for child_id in child_id {
            parents.insert(child_id.clone(), id);
          }
        }

        for child_id in &schema.any_of {
          for child_id in child_id {
            parents.insert(child_id.clone(), id);
          }
        }

        for child_id in &schema.one_of {
          for child_id in child_id {
            parents.insert(child_id.clone(), id);
          }
        }

        if let Some(child_id) = &schema.r#if {
          parents.insert(child_id.clone(), id);
        }

        if let Some(child_id) = &schema.then {
          parents.insert(child_id.clone(), id);
        }

        if let Some(child_id) = &schema.r#else {
          parents.insert(child_id.clone(), id);
        }

        if let Some(child_id) = &schema.not {
          parents.insert(child_id.clone(), id);
        }

        if let Some(child_id) = &schema.property_names {
          parents.insert(child_id.clone(), id);
        }

        if let Some(child_id) = &schema.property_names {
          implicit_types.insert(child_id.clone(), SchemaType::String);
        }
      }

      let transformer = |arena: &mut Arena<SchemaNode>, key: usize| {
        let item = arena.get_item(key).clone();
        let id = item.id.unwrap();
        let schema_url = Url::parse(&id).unwrap();
        let schema = intermediate_document.schemas.get(&id).unwrap();
        let parent = parents.get(&id).map(|id| *key_map.get(id).unwrap());
        let types = schema
          .types
          .as_ref()
          .map(|value| value.iter().map(|value| value.into()).collect())
          .and_then(|value: Vec<_>| if value.is_empty() { None } else { Some(value) })
          .or_else(|| implicit_types.get(&id).map(|value| vec![*value]));
        let reference = schema
          .reference
          .as_ref()
          .map(|url| *key_map.get(schema_url.join(url).unwrap().as_str()).unwrap());

        let primary = if id == root_id { Some(true) } else { None };

        let item = SchemaNode {
          primary,
          parent,
          types,

          id: Some(id),
          title: schema.title.clone(),
          description: schema.description.clone(),
          examples: schema.examples.clone(),
          deprecated: schema.deprecated,

          options: schema.options.clone(),

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

          reference,

          contains: schema
            .r#contains
            .as_ref()
            .map(|url| *key_map.get(url.as_str()).unwrap()),
          property_names: schema
            .r#property_names
            .as_ref()
            .map(|url| *key_map.get(url.as_str()).unwrap()),
          map_properties: schema
            .r#map_properties
            .as_ref()
            .map(|url| *key_map.get(url.as_str()).unwrap()),
          array_items: schema
            .r#array_items
            .as_ref()
            .map(|url| *key_map.get(url.as_str()).unwrap()),
          r#if: schema
            .r#if
            .as_ref()
            .map(|url| *key_map.get(url.as_str()).unwrap()),
          then: schema
            .then
            .as_ref()
            .map(|url| *key_map.get(url.as_str()).unwrap()),
          r#else: schema
            .r#else
            .as_ref()
            .map(|url| *key_map.get(url.as_str()).unwrap()),
          not: schema
            .r#not
            .as_ref()
            .map(|url| *key_map.get(url.as_str()).unwrap()),

          tuple_items: None, // TODO
          all_of: schema.all_of.as_ref().map(|value| {
            value
              .iter()
              .map(|url| *key_map.get(url.as_str()).unwrap())
              .collect()
          }),
          any_of: schema.any_of.as_ref().map(|value| {
            value
              .iter()
              .map(|url| *key_map.get(url.as_str()).unwrap())
              .collect()
          }),
          one_of: schema.one_of.as_ref().map(|value| {
            value
              .iter()
              .map(|url| *key_map.get(url.as_str()).unwrap())
              .collect()
          }),

          dependent_schemas: schema.dependent_schemas.as_ref().map(|value| {
            value
              .iter()
              .map(|(name, url)| (name.clone(), *key_map.get(url.as_str()).unwrap()))
              .collect()
          }),
          object_properties: schema.object_properties.as_ref().map(|value| {
            value
              .iter()
              .map(|(name, url)| (name.clone(), *key_map.get(url.as_str()).unwrap()))
              .collect()
          }),
          pattern_properties: schema.pattern_properties.as_ref().map(|value| {
            value
              .iter()
              .map(|(name, url)| (name.clone(), *key_map.get(url.as_str()).unwrap()))
              .collect()
          }),
        };

        arena.set_item(key, item);
      };

      while arena.apply_transform(transformer) > 0 {
        //
      }
    }

    // then optimize the schemas

    {
      fn transformer(arena: &mut Arena<SchemaNode>, key: usize) {
        schema_transforms::single_type::single_type_transform(arena, key);
        schema_transforms::explode::explode_transform(arena, key);
      }

      while arena.apply_transform(transformer) > 0 {
        //
      }
    }

    // then set schema primary field

    {
      fn transformer(arena: &mut Arena<SchemaNode>, key: usize) {
        schema_transforms::primary::primary_transform(arena, key);
      }

      while arena.apply_transform(transformer) > 0 {
        //
      }
    }

    // generate names

    let urls: Vec<_> = intermediate_document
      .schemas
      .keys()
      .map(|key| UrlWithPointer::parse(key).unwrap())
      .collect();

    let original_names: Vec<_> = urls
      .iter()
      .map(|url| {
        let name: Vec<_> = url.get_pointer().as_ref().clone();
        (url, name)
      })
      .collect();

    let names = optimize_names(original_names, 5)
      .into_iter()
      .map(|(id, name)| (id.clone(), name))
      .collect();

    Self { arena, names }
  }
}

impl Specification {
  pub fn get_identifier(&self, key: &usize) -> Ident {
    let name = self.get_name(key);
    let identifier = format_ident!("r#{}", name);
    identifier
  }

  pub fn get_name(&self, key: &usize) -> String {
    let id = self.arena.get_item(*key).id.as_ref().unwrap();
    let uri = UrlWithPointer::parse(id).unwrap();
    let parts = self.names.get(&uri).unwrap();
    let name = format!("T{}", to_pascal(parts));
    name
  }

  pub fn get_interior_identifier(&self, key: &usize) -> TokenStream {
    let identifier = self.get_identifier(key);
    quote! {crate::interiors::#identifier}
  }

  pub fn get_interior_name(&self, key: &usize) -> String {
    let name = self.get_name(key);
    let name = format!("crate::interiors::{}", name);
    name
  }

  pub fn get_type_identifier(&self, key: &usize) -> TokenStream {
    let identifier = self.get_identifier(key);
    quote! {crate::types::#identifier}
  }

  pub fn _get_type_name(&self, key: &usize) -> String {
    let name = self.get_name(key);
    let name = format!("crate::types::{}", name);
    name
  }
}
