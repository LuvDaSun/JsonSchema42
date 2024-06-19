use super::{schema_item::ArenaSchemaItem, BoxedSchemaTransform, SchemaTransform, SchemaType};
use crate::{
  documents::{DocumentContext, DocumentContextContainer},
  models::ArenaSchemaItemContainer,
  utils::{Arena, NodeLocation},
};
use std::{collections::HashMap, iter, rc::Rc};
use wasm_bindgen::prelude::*;

pub type SchemaArena = Arena<ArenaSchemaItem>;

impl Arena<ArenaSchemaItem> {
  pub fn from_document_context(document_context: &Rc<DocumentContext>) -> Self {
    let schema_nodes = document_context.get_schema_nodes();
    let mut parents: HashMap<NodeLocation, NodeLocation> = HashMap::new();
    let mut implicit_types: HashMap<NodeLocation, SchemaType> = HashMap::new();

    // first load schemas in the arena

    let mut arena = Arena::new();

    let mut key_map: HashMap<NodeLocation, usize> = HashMap::new();
    for (id, schema) in &schema_nodes {
      let item = ArenaSchemaItem {
        exact: Some(true),
        primary: Some(true),
        ..Default::default()
      };

      let key = arena.add_item(item);
      key_map.insert(id.clone(), key);

      for child_id in &schema.all_of {
        for child_id in child_id {
          parents.insert(child_id.clone(), id.clone());
        }
      }

      for child_id in &schema.any_of {
        for child_id in child_id {
          parents.insert(child_id.clone(), id.clone());
        }
      }

      for child_id in &schema.one_of {
        for child_id in child_id {
          parents.insert(child_id.clone(), id.clone());
        }
      }

      if let Some(child_id) = &schema.r#if {
        parents.insert(child_id.clone(), id.clone());
      }

      if let Some(child_id) = &schema.then {
        parents.insert(child_id.clone(), id.clone());
      }

      if let Some(child_id) = &schema.r#else {
        parents.insert(child_id.clone(), id.clone());
      }

      if let Some(child_id) = &schema.not {
        parents.insert(child_id.clone(), id.clone());
      }

      if let Some(child_id) = &schema.property_names {
        parents.insert(child_id.clone(), id.clone());
      }

      if let Some(child_id) = &schema.property_names {
        implicit_types.insert(child_id.clone(), SchemaType::String);
      }
    }

    for (location, key) in &key_map {
      let mut schema = schema_nodes.get(location).unwrap().clone();
      schema.parent = parents.get(location).cloned();
      schema.types = schema.types.or_else(|| {
        implicit_types
          .get(location)
          .map(|value| iter::once(*value).collect())
      });
      // schema.primary = if *id == root_id { Some(true) } else { None };

      let item = schema.map_keys(|location| *key_map.get(location).unwrap());

      arena.replace_item(*key, item);
    }

    arena
  }

  /// Resolves the final entry for a given schema key, following any alias chains.
  ///
  /// This method iteratively follows the alias chain for a given key until it reaches
  /// an item that does not have an alias. It returns both the resolved key and a reference
  /// to the resolved `ArenaSchemaItem`.
  ///
  /// # Parameters
  /// - `key`: The initial `usize` to resolve.
  ///
  /// # Returns
  /// A tuple containing the resolved `usize` and a reference to the resolved `ArenaSchemaItem`.
  pub fn resolve_entry(&self, key: usize) -> (usize, &ArenaSchemaItem) {
    let mut resolved_key = key;
    let mut resolved_item = self.get_item(resolved_key);

    loop {
      let Some(alias_key) = resolved_item.get_alias_key() else {
        break;
      };
      resolved_key = alias_key;
      resolved_item = self.get_item(resolved_key);
    }

    (resolved_key, resolved_item)
  }

  /// Retrieves the ancestors of a given schema item by its key.
  ///
  /// This method returns an iterator over the ancestors of the specified item,
  /// starting from the item itself and moving up to the root.
  ///
  /// # Parameters
  /// - `key`: The `usize` of the item whose ancestors are to be retrieved.
  ///
  /// # Returns
  /// An iterator over tuples containing the `usize` and a reference to the `ArenaSchemaItem`
  /// for each ancestor, including the item itself.
  pub fn get_ancestors(
    &self,
    key: usize,
  ) -> impl DoubleEndedIterator<Item = (usize, &ArenaSchemaItem)> {
    let mut result = Vec::new();

    let mut key_maybe = Some(key);
    while let Some(key) = key_maybe {
      let item = self.get_item(key);
      result.push((key, item));

      key_maybe = item.parent;
    }

    result.into_iter()
  }

  /// Checks if a given schema item has a specific ancestor.
  ///
  /// # Parameters
  /// - `key`: The `usize` of the item to check.
  /// - `ancestor_key`: The `usize` of the potential ancestor.
  ///
  /// # Returns
  /// `true` if the item identified by `key` has the ancestor identified by `ancestor_key`,
  /// otherwise `false`.
  pub fn has_ancestor(&self, key: usize, ancestor_key: usize) -> bool {
    self
      .get_ancestors(key)
      .any(|(key, _item)| key == ancestor_key)
  }

  /// Generates an iterator over the name parts of a schema item and its ancestors.
  ///
  /// This method constructs an iterator that yields the name parts (path and hash) of
  /// the specified schema item and its ancestors, in reverse order (from the root ancestor
  /// to the item itself).
  ///
  /// # Parameters
  /// - `key`: The `usize` of the item whose name parts are to be retrieved.
  ///
  /// # Returns
  /// An iterator over string slices (`&str`) representing the name parts.
  pub fn get_name_parts(&self, key: usize) -> impl Iterator<Item = String> {
    let ancestors: Vec<_> = self
      .get_ancestors(key)
      .map(|(_key, item)| item)
      .scan(None, |state, item| {
        let item_previous = *state;
        *state = Some(item);
        Some((item_previous, item))
      })
      .take_while(|(item_previous, _item)| {
        if let Some(item_previous) = item_previous {
          item_previous.location.is_none()
        } else {
          true
        }
      })
      .map(|(_item_previous, item)| {
        iter::empty()
          .chain(item.location.as_ref().map(|id| {
            iter::empty()
              .chain(
                id.get_path()
                  .into_iter()
                  .map(|part| {
                    if let Some(index) = part.find('.') {
                      part[..index].to_owned()
                    } else {
                      part
                    }
                  })
                  .filter(|part| !part.is_empty()),
              )
              .chain(id.get_hash())
          }))
          .flatten()
          .chain(item.name.clone())
          .filter(|part| !part.is_empty())
      })
      .collect();

    ancestors.into_iter().rev().flatten()
  }
}

#[wasm_bindgen]
pub struct SchemaArenaContainer(SchemaArena);

#[wasm_bindgen]
impl SchemaArenaContainer {
  #[wasm_bindgen(js_name = clone)]
  pub fn _clone(&self) -> Self {
    Self(self.0.clone())
  }
}

#[wasm_bindgen]
impl SchemaArenaContainer {
  #[wasm_bindgen(js_name = fromDocumentContext)]
  pub fn from_document_context(document_context: DocumentContextContainer) -> Self {
    SchemaArena::from_document_context(&document_context.into()).into()
  }

  #[wasm_bindgen(js_name = getItem)]
  pub fn get_item(&self, key: usize) -> ArenaSchemaItemContainer {
    self.0.get_item(key).clone().into()
  }

  #[wasm_bindgen(js_name = count)]
  pub fn count(&self) -> usize {
    self.0.count()
  }

  #[wasm_bindgen(js_name = getNameParts)]
  pub fn get_name_parts(&self, key: usize) -> Vec<String> {
    self.0.get_name_parts(key).collect()
  }

  /// Applies a series of transformations to the schema items within the arena.
  ///
  /// This method iterates over each transformation provided and applies it to the arena.
  /// The transformations are applied in the order they are provided.
  ///
  /// # Parameters
  /// - `transforms`: A reference to a vector of `SchemaTransform` instances to be applied.
  ///
  /// # Returns
  /// The number of transformations applied.
  #[wasm_bindgen(js_name = transform)]
  pub fn transform(&mut self, transforms: Vec<SchemaTransform>) -> usize {
    self
      .0
      .apply_transform(|arena: &mut Arena<ArenaSchemaItem>, key: usize| {
        for transform in &transforms {
          let transform: BoxedSchemaTransform = (*transform).into();
          transform(arena, key)
        }
      })
  }
}

impl From<SchemaArena> for SchemaArenaContainer {
  fn from(value: SchemaArena) -> Self {
    Self(value)
  }
}

impl From<SchemaArenaContainer> for SchemaArena {
  fn from(value: SchemaArenaContainer) -> Self {
    value.0
  }
}
