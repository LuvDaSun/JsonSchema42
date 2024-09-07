use super::{schema_item::ArenaSchemaItem, BoxedSchemaTransform, SchemaTransform, SchemaType};
use crate::{
  documents::{DocumentContext, DocumentContextContainer},
  models::ArenaSchemaItemContainer,
  utils::{Arena, NodeLocation},
};
use std::{
  collections::{BTreeMap, HashSet},
  iter,
  rc::Rc,
};
use wasm_bindgen::prelude::*;

pub type SchemaArena = Arena<ArenaSchemaItem>;

impl Arena<ArenaSchemaItem> {
  pub fn from_document_context(document_context: &Rc<DocumentContext>) -> Self {
    let schema_nodes = document_context.get_schema_nodes();
    let mut implicit_types: BTreeMap<NodeLocation, SchemaType> = BTreeMap::new();

    // first load schemas in the arena

    let mut arena = Arena::new();

    let mut key_map: BTreeMap<NodeLocation, usize> = BTreeMap::new();
    for (location, schema) in &schema_nodes {
      let item = ArenaSchemaItem {
        ..Default::default()
      };

      let key = arena.add_item(item);
      key_map.insert(location.clone(), key);

      if let Some(child_id) = &schema.property_names {
        implicit_types.insert(child_id.clone(), SchemaType::String);
      }
    }

    for (location, key) in &key_map {
      let mut schema = schema_nodes.get(location).unwrap().clone();

      schema.name = Some(
        iter::empty()
          .chain(location.get_path())
          .chain(location.get_hash())
          .flat_map(|part| part.split('.').map(str::to_owned).rev().collect::<Vec<_>>())
          .collect(),
      );

      schema.types = schema.types.or_else(|| {
        implicit_types
          .get(location)
          .map(|value| iter::once(*value).collect())
      });

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

  pub fn get_all_related(&self, key: usize) -> impl Iterator<Item = usize> + '_ {
    let mut result: HashSet<_> = iter::once(key).collect();
    let mut queue: Vec<_> = iter::once(key).collect();

    while let Some(key) = queue.pop() {
      let item = self.get_item(key);
      for key in item.get_dependencies() {
        if !result.insert(key) {
          continue;
        }

        queue.push(key);
      }
    }

    result.into_iter()
  }
}

#[wasm_bindgen]
#[derive(Clone)]
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
  pub fn from_document_context(document_context: &DocumentContextContainer) -> Self {
    let document_context = document_context.clone();
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

  #[wasm_bindgen(js_name = getAllRelated)]
  pub fn get_all_related(&self, key: usize) -> Vec<usize> {
    self.0.get_all_related(key).collect()
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
