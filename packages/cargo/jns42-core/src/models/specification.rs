use super::schema_item::ArenaSchemaItem;
use crate::{
  documents::DocumentContext,
  naming::{NamesBuilder, Sentence},
  schema_transforms,
  utils::{Arena, NodeLocation},
};
use once_cell::sync::Lazy;
use proc_macro2::{Ident, TokenStream};
use quote::{format_ident, quote};
use regex::Regex;
use std::{collections::HashMap, rc::Rc};
use std::{collections::HashSet, iter::empty};

pub static NON_IDENTIFIER_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"[^a-zA-Z0-9]").unwrap());

pub struct Specification {
  pub arena: Arena<ArenaSchemaItem>,
  pub names: HashMap<usize, (bool, Sentence)>,
}

impl Specification {
  pub fn new(document_context: &Rc<DocumentContext>, roots: HashSet<NodeLocation>) -> Self {
    // first load schemas in the arena

    let mut arena = Arena::from_document_context(document_context);

    // then optimize the schemas

    {
      while arena.apply_transform(transformer) > 0 {
        //
      }

      fn transformer(arena: &mut Arena<ArenaSchemaItem>, key: usize) {
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

    // generate names

    let roots = arena
      .iter()
      .enumerate()
      .filter_map(|(key, item)| {
        let location = item.location.clone()?;
        if roots.contains(&location) {
          Some(key)
        } else {
          None
        }
      })
      .flat_map(|key| arena.get_all_descendants(key));

    let primaries: HashSet<_> = roots
      .flat_map(|key| arena.get_all_descendants(key))
      .collect();

    let mut primary_names = NamesBuilder::new();
    let mut secondary_names = NamesBuilder::new();
    for (key, _item) in arena.iter().enumerate() {
      let parts = arena.get_name_parts(key).map(|part| {
        NON_IDENTIFIER_REGEX
          .replace_all(part.as_str(), " ")
          .into_owned()
          .trim()
          .to_string()
      });

      if primaries.contains(&key) {
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
