use jns42_core::{
  documents::DocumentContext,
  models::ArenaSchemaItem,
  naming::{Names, NamesBuilder},
  schema_transforms,
  utils::Arena,
};
use once_cell::sync::Lazy;
use proc_macro2::{Ident, TokenStream};
use quote::{format_ident, quote};
use regex::Regex;
use std::collections::HashSet;
use std::rc::Rc;

pub static NON_IDENTIFIER_REGEX: Lazy<Regex> = Lazy::new(|| Regex::new(r"[^a-zA-Z]").unwrap());

pub struct SpecificationConfiguration {
  pub default_type_name: String,
  pub transform_maximum_iterations: usize,
}

pub struct Specification {
  pub arena: Arena<ArenaSchemaItem>,
  pub names: Names<usize>,
}

impl Specification {
  pub fn new(
    document_context: &Rc<DocumentContext>,
    configuration: SpecificationConfiguration,
  ) -> Self {
    let SpecificationConfiguration {
      default_type_name,
      transform_maximum_iterations,
    } = configuration;

    // first load schemas in the arena

    let mut arena = Arena::from_document_context(document_context);

    // generate root keys

    let explicit_locations = document_context.get_explicit_locations();
    let explicit_type_keys: Vec<_> = arena
      .iter()
      .enumerate()
      .filter_map(|(key, item)| {
        let location = item.location.clone()?;

        if explicit_locations.contains(&location) {
          Some(key)
        } else {
          None
        }
      })
      .collect();

    // then optimize the schemas

    {
      let mut transform_iterations = 0;
      while arena.apply_transform(transformer) > 0 {
        transform_iterations += 1;
        if transform_iterations < transform_maximum_iterations {
          continue;
        }
        panic!("too many iterations");
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

    {
      let mut transform_iterations = 0;
      while arena.apply_transform(transformer) > 0 {
        transform_iterations += 1;
        if transform_iterations < transform_maximum_iterations {
          continue;
        }
        panic!("too many iterations");
      }

      fn transformer(arena: &mut Arena<ArenaSchemaItem>, key: usize) {
        schema_transforms::name::transform(arena, key);
      }
    }

    let primary_type_keys: HashSet<_> = explicit_type_keys
      .into_iter()
      .flat_map(|key| arena.get_all_related(key))
      .collect();

    let mut names_builder = NamesBuilder::new();
    names_builder.set_default_name(default_type_name);

    for key in primary_type_keys {
      let item = arena.get_item(key);

      let Some(name) = item.name.as_ref() else {
        continue;
      };

      let parts = name
        .iter()
        .filter(|part| !NON_IDENTIFIER_REGEX.is_match(part))
        .filter(|part| !part.is_empty());

      names_builder.add(key, parts);
    }

    let names = names_builder.build();

    Self { arena, names }
  }
}

impl Specification {
  pub fn get_snake_identifier(&self, key: &usize) -> Option<Ident> {
    let name = self.get_snake_name(key)?;
    Some(format_ident!("r#{}", name))
  }

  pub fn get_snake_name(&self, key: &usize) -> Option<String> {
    let sentence = self.names.get_name(key)?;
    Some(sentence.to_snake_case())
  }

  pub fn get_identifier(&self, key: &usize) -> Option<Ident> {
    let name = self.get_name(key)?;
    Some(format_ident!("r#{}", name))
  }

  pub fn get_name(&self, key: &usize) -> Option<String> {
    let sentence = self.names.get_name(key)?;
    Some(sentence.to_pascal_case())
  }

  pub fn get_interior_identifier(&self, key: &usize) -> Option<TokenStream> {
    let identifier = self.get_identifier(key)?;
    Some(quote! {crate::interiors::#identifier})
  }

  pub fn get_interior_name(&self, key: &usize) -> Option<String> {
    let name = self.get_name(key)?;
    Some(format!("crate::interiors::{}", name))
  }

  pub fn get_type_identifier(&self, key: &usize) -> Option<TokenStream> {
    let identifier = self.get_identifier(key)?;
    Some(quote! {crate::types::#identifier})
  }

  pub fn _get_type_name(&self, key: &usize) -> Option<String> {
    let name = self.get_name(key)?;
    Some(format!("crate::types::{}", name))
  }
}
