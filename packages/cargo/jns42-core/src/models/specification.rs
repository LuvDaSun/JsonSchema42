use super::{intermediate::IntermediateSchema, schema_item::SchemaItem, SchemaType};
use crate::{
  error::Error,
  naming::{NamesBuilder, Sentence},
  schema_transforms,
  utils::{arena::Arena, node_location::NodeLocation},
};
use once_cell::sync::Lazy;
use proc_macro2::{Ident, TokenStream};
use quote::{format_ident, quote};
use regex::Regex;
use std::collections::HashMap;
use std::iter::{empty, once};

pub static NON_IDENTIFIER_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"[^a-zA-Z0-9]").unwrap());

pub struct Specification {
  pub arena: Arena<SchemaItem>,
  pub names: HashMap<usize, (bool, Sentence)>,
}

impl Specification {
  pub fn new(
    root_id: NodeLocation,
    intermediate_document: IntermediateSchema,
  ) -> Result<Self, Error> {
    let mut parents: HashMap<NodeLocation, NodeLocation> = HashMap::new();
    let mut implicit_types: HashMap<NodeLocation, SchemaType> = HashMap::new();

    // first load schemas in the arena

    let mut arena = Arena::new();
    {
      let mut key_map: HashMap<NodeLocation, usize> = HashMap::new();
      for (id, schema) in &intermediate_document.schemas {
        let item = SchemaItem {
          id: Some(id.clone()),
          ..Default::default()
        };

        let key = arena.add_item(item);
        key_map.insert(id.clone(), key);

        for child_id in &schema.all_of {
          for child_id in child_id {
            let child_id = child_id.parse()?;
            parents.insert(child_id, id.clone());
          }
        }

        for child_id in &schema.any_of {
          for child_id in child_id {
            let child_id = child_id.parse()?;
            parents.insert(child_id, id.clone());
          }
        }

        for child_id in &schema.one_of {
          for child_id in child_id {
            let child_id = child_id.parse()?;
            parents.insert(child_id, id.clone());
          }
        }

        if let Some(child_id) = &schema.r#if {
          let child_id = child_id.parse()?;
          parents.insert(child_id, id.clone());
        }

        if let Some(child_id) = &schema.then {
          let child_id = child_id.parse()?;
          parents.insert(child_id, id.clone());
        }

        if let Some(child_id) = &schema.r#else {
          let child_id = child_id.parse()?;
          parents.insert(child_id, id.clone());
        }

        if let Some(child_id) = &schema.not {
          let child_id = child_id.parse()?;
          parents.insert(child_id, id.clone());
        }

        if let Some(child_id) = &schema.property_names {
          let child_id = child_id.parse()?;
          parents.insert(child_id, id.clone());
        }

        if let Some(child_id) = &schema.property_names {
          let child_id = child_id.parse()?;
          implicit_types.insert(child_id, SchemaType::String);
        }
      }

      for (id, key) in &key_map {
        let schema = intermediate_document.schemas.get(id).unwrap();
        let parent = parents.get(id).map(|id| *key_map.get(id).unwrap());
        let types = schema
          .types
          .as_ref()
          .and_then(|value| {
            if value.is_empty() {
              None
            } else {
              Some(value.clone())
            }
          })
          .or_else(|| implicit_types.get(id).map(|value| once(*value).collect()));

        let primary = if *id == root_id { Some(true) } else { None };

        let item = SchemaItem {
          name: None,
          exact: None,
          primary,
          parent,
          types,

          id: Some(id.clone()),
          title: schema.title.clone(),
          description: schema.description.clone(),
          examples: schema.examples.clone(),
          deprecated: schema.deprecated,

          options: schema.options.clone(),

          minimum_inclusive: schema.minimum_inclusive.clone(),
          minimum_exclusive: schema.minimum_exclusive.clone(),
          maximum_inclusive: schema.maximum_inclusive.clone(),
          maximum_exclusive: schema.maximum_exclusive.clone(),
          multiple_of: schema.multiple_of.clone(),

          minimum_length: schema.minimum_length,
          maximum_length: schema.maximum_length,
          value_pattern: schema
            .value_pattern
            .as_ref()
            .map(|value| vec![value.clone()]),
          value_format: schema
            .value_format
            .as_ref()
            .map(|value| vec![value.clone()]),

          maximum_items: schema.maximum_items,
          minimum_items: schema.minimum_items,
          unique_items: schema.unique_items,

          minimum_properties: schema.minimum_properties,
          maximum_properties: schema.maximum_properties,
          required: schema
            .required
            .as_ref()
            .map(|value| value.iter().cloned().collect()),

          reference: map_location_value(&key_map, schema.reference.as_ref())?,

          contains: map_location_value(&key_map, schema.contains.as_ref())?,
          property_names: map_location_value(&key_map, schema.property_names.as_ref())?,
          map_properties: map_location_value(&key_map, schema.map_properties.as_ref())?,
          array_items: map_location_value(&key_map, schema.array_items.as_ref())?,
          r#if: map_location_value(&key_map, schema.r#if.as_ref())?,
          then: map_location_value(&key_map, schema.then.as_ref())?,
          r#else: map_location_value(&key_map, schema.r#else.as_ref())?,
          not: map_location_value(&key_map, schema.not.as_ref())?,

          tuple_items: map_location_list(&key_map, schema.tuple_items.as_ref())?
            .map(|list| list.collect()),
          all_of: map_location_list(&key_map, schema.all_of.as_ref())?.map(|list| list.collect()),
          any_of: map_location_list(&key_map, schema.any_of.as_ref())?.map(|list| list.collect()),
          one_of: map_location_list(&key_map, schema.one_of.as_ref())?.map(|list| list.collect()),

          dependent_schemas: map_location_map(&key_map, schema.dependent_schemas.as_ref())?
            .map(|map| map.collect()),
          object_properties: map_location_map(&key_map, schema.object_properties.as_ref())?
            .map(|map| map.collect()),
          pattern_properties: map_location_map(&key_map, schema.pattern_properties.as_ref())?
            .map(|map| map.collect()),
        };

        arena.replace_item(*key, item);
      }
    }

    // then optimize the schemas

    {
      while arena.apply_transform(transformer) > 0 {
        //
      }

      fn transformer(arena: &mut Arena<SchemaItem>, key: usize) {
        schema_transforms::single_type::transform(arena, key);
        schema_transforms::explode::transform(arena, key);

        schema_transforms::resolve_single::all_of::transform(arena, key);
        schema_transforms::resolve_single::any_of::transform(arena, key);
        schema_transforms::resolve_single::one_of::transform(arena, key);
        schema_transforms::flatten::all_of::transform(arena, key);
        schema_transforms::flatten::any_of::transform(arena, key);
        schema_transforms::flatten::one_of::transform(arena, key);
        schema_transforms::flip::all_of_one_of::transform(arena, key);
        schema_transforms::flip::all_of_any_of::transform(arena, key);
        schema_transforms::inherit::reference::transform(arena, key);
        schema_transforms::inherit::one_of::transform(arena, key);
        schema_transforms::inherit::any_of::transform(arena, key);

        schema_transforms::resolve_all_of::transform(arena, key);
        schema_transforms::resolve_not::transform(arena, key);
        schema_transforms::resolve_if_then_else::transform(arena, key);
      }
    }

    // then set schema primary field

    {
      while arena.apply_transform(transformer) > 0 {
        //
      }

      fn transformer(arena: &mut Arena<SchemaItem>, key: usize) {
        schema_transforms::primary::transform(arena, key);
      }
    }

    // generate names

    let mut primary_names = NamesBuilder::new();
    let mut secondary_names = NamesBuilder::new();
    for (key, item) in arena.iter().enumerate() {
      let parts = arena.get_name_parts(key).map(|part| {
        NON_IDENTIFIER_REGEX
          .replace_all(part, " ")
          .into_owned()
          .trim()
          .to_string()
      });

      if item.primary.unwrap_or_default() {
        primary_names.add(key, parts);
      } else {
        secondary_names.add(key, parts);
      }
    }

    let primary_names = primary_names.build().into_iter();
    let secondary_names = secondary_names.build().into_iter();

    let names = empty()
      .chain(primary_names.map(|(key, parts)| (key, (true, parts))))
      .chain(secondary_names.map(|(key, parts)| (key, (false, parts))))
      .collect();

    Ok(Self { arena, names })
  }
}

fn map_location_value(
  key_map: &HashMap<NodeLocation, usize>,
  value: Option<impl AsRef<str>>,
) -> Result<Option<usize>, Error> {
  let value = value.map(|value| value.as_ref().parse()).transpose()?;
  Ok(value.map(|value| key_map.get(&value).unwrap()).copied())
}

fn map_location_list(
  key_map: &HashMap<NodeLocation, usize>,
  list: Option<impl IntoIterator<Item = impl AsRef<str>>>,
) -> Result<Option<impl Iterator<Item = usize> + '_>, Error> {
  let list = list
    .map(|list| {
      list
        .into_iter()
        .map(|value| value.as_ref().parse::<NodeLocation>())
        .collect::<Result<Vec<_>, _>>()
    })
    .transpose()?;
  Ok(list.map(|list| list.into_iter().map(|value| *key_map.get(&value).unwrap())))
}

fn map_location_map(
  key_map: &HashMap<NodeLocation, usize>,
  list: Option<impl IntoIterator<Item = (impl AsRef<str>, impl AsRef<str>)>>,
) -> Result<Option<impl Iterator<Item = (String, usize)> + '_>, Error> {
  let list = list
    .map(|list| {
      list
        .into_iter()
        .map(|(name, value)| {
          value
            .as_ref()
            .parse::<NodeLocation>()
            .map(|value| (name.as_ref().to_owned(), value))
        })
        .collect::<Result<Vec<_>, _>>()
    })
    .transpose()?;
  Ok(list.map(|list| {
    list
      .into_iter()
      .map(|(name, value)| (name, *key_map.get(&value).unwrap()))
  }))
}

impl Specification {
  fn get_is_primary_and_identifier(&self, key: &usize) -> (bool, Ident) {
    let (is_primary, name) = self.get_is_primary_and_name(key);
    let identifier = format_ident!("r#{}", name);
    (is_primary, identifier)
  }

  fn get_is_primary_and_name(&self, key: &usize) -> (bool, String) {
    let (is_primary, sentence) = self.names.get(key).unwrap();
    let name = format!("T{}", sentence.to_pascal_case());
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
