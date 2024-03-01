use super::{
  arena::Arena,
  intermediate::IntermediateSchema,
  schema::{SchemaNode, SchemaType},
};
use crate::{
  schema_transforms::{self},
  utils::{name::to_pascal, names::optimize_names, url::UrlWithPointer},
};
use proc_macro2::{Ident, TokenStream};
use quote::{format_ident, quote};
use std::{collections::HashMap, iter::empty};
use url::Url;

pub struct Specification {
  pub arena: Arena<SchemaNode>,
  pub names: HashMap<usize, (bool, Vec<String>)>,
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

    let primary_name_entries = arena
      .iter()
      .enumerate()
      .filter(|(_key, item)| item.primary.unwrap_or_default())
      .filter_map(|(key, item)| item.id.as_ref().map(|id| (key, id)))
      .map(|(key, id)| {
        (
          key,
          UrlWithPointer::parse(id)
            .unwrap()
            .get_pointer()
            .as_ref()
            .clone(),
        )
      });
    let secondary_name_entries = arena
      .iter()
      .enumerate()
      .filter(|(_key, item)| !item.primary.unwrap_or_default())
      .filter_map(|(key, item)| item.id.as_ref().map(|id| (key, id)))
      .map(|(key, id)| {
        (
          key,
          UrlWithPointer::parse(id)
            .unwrap()
            .get_pointer()
            .as_ref()
            .clone(),
        )
      });
    let primary_names = optimize_names(primary_name_entries, 5).into_iter();
    let secondary_names = optimize_names(secondary_name_entries, 5).into_iter();

    let names = empty()
      .chain(primary_names.map(|(key, parts)| (key, (true, parts))))
      .chain(secondary_names.map(|(key, parts)| (key, (false, parts))))
      .collect();

    Self { arena, names }
  }
}

impl Specification {
  fn get_is_primary_and_identifier(&self, key: &usize) -> (bool, Ident) {
    let (is_primary, name) = self.get_is_primary_and_name(key);
    let identifier = format_ident!("r#{}", name);
    (is_primary, identifier)
  }

  fn get_is_primary_and_name(&self, key: &usize) -> (bool, String) {
    let (is_primary, parts) = self.names.get(key).unwrap();
    let name = format!("T{}", to_pascal(parts));
    (*is_primary, name)
  }

  pub fn get_identifier(&self, key: &usize) -> Ident {
    let (_is_primary, name) = self.get_is_primary_and_identifier(key);
    name
  }

  pub fn get_name(&self, key: &usize) -> String {
    let (_is_primary, name) = self.get_is_primary_and_name(key);
    name
  }

  pub fn get_interior_identifier(&self, key: &usize) -> TokenStream {
    let (is_primary, identifier) = self.get_is_primary_and_identifier(key);
    if is_primary {
      quote! {crate::interiors::#identifier}
    } else {
      quote! {crate::interiors_secondary::#identifier}
    }
  }

  pub fn get_interior_name(&self, key: &usize) -> String {
    let (is_primary, name) = self.get_is_primary_and_name(key);
    if is_primary {
      format!("crate::interiors::{}", name)
    } else {
      format!("crate::interiors_secondary::{}", name)
    }
  }

  pub fn get_type_identifier(&self, key: &usize) -> TokenStream {
    let (is_primary, identifier) = self.get_is_primary_and_identifier(key);
    if is_primary {
      quote! {crate::types::#identifier}
    } else {
      quote! {crate::types_secondary::#identifier}
    }
  }

  pub fn _get_type_name(&self, key: &usize) -> String {
    let (is_primary, name) = self.get_is_primary_and_name(key);
    if is_primary {
      format!("crate::types::{}", name)
    } else {
      format!("crate::types_secondary::{}", name)
    }
  }
}
