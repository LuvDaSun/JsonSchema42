use super::{schema_node::SchemaItem, IntermediateNode, SchemaType};
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
use std::collections::{BTreeMap, HashMap};
use std::iter::{empty, once};

pub static NON_IDENTIFIER_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"[^a-zA-Z0-9]").unwrap());

pub struct Specification {
  pub arena: Arena<SchemaItem>,
  pub names: HashMap<usize, (bool, Sentence)>,
}

impl Specification {
  pub fn new(
    root_id: NodeLocation,
    schema_nodes: BTreeMap<NodeLocation, IntermediateNode>,
  ) -> Result<Self, Error> {
    let mut parents: HashMap<NodeLocation, NodeLocation> = HashMap::new();
    let mut implicit_types: HashMap<NodeLocation, SchemaType> = HashMap::new();

    // first load schemas in the arena

    let mut arena = Arena::new();
    {
      let mut key_map: HashMap<NodeLocation, usize> = HashMap::new();
      for (id, schema) in &schema_nodes {
        let item = SchemaItem {
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
        let mut schema = schema_nodes.get(id).unwrap().clone();
        schema.parent = parents.get(id).map(|value| value.to_string());
        schema.types = schema
          .types
          .or_else(|| implicit_types.get(id).map(|value| once(*value).collect()));
        schema.primary = if *id == root_id { Some(true) } else { None };

        let item = schema.map_keys(|key| *key_map.get(&key.parse().unwrap()).unwrap());

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
