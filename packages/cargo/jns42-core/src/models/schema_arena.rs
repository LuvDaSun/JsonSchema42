use super::{SchemaType, schema_item::ArenaSchemaItem};
use crate::{
  documents::DocumentContext,
  utilities::{Arena, NodeLocation},
};
use std::{
  collections::{BTreeMap, BTreeSet},
  iter,
  rc::Rc,
};

pub type SchemaArena = Arena<ArenaSchemaItem>;

impl Arena<ArenaSchemaItem> {
  pub fn from_document_context(document_context: &Rc<DocumentContext>) -> Self {
    let schema_nodes = document_context.get_schema_nodes();
    let mut implicit_types: BTreeMap<NodeLocation, SchemaType> = BTreeMap::new();

    // first load schemas in the arena

    let mut arena = Arena::new();

    let mut key_map: BTreeMap<NodeLocation, u32> = BTreeMap::new();
    for (location, schema) in &schema_nodes {
      let item = ArenaSchemaItem {
        ..Default::default()
      };

      let key = arena.add_item(item);
      key_map.insert(location.clone(), key as u32);

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

      arena.replace_item(*key as usize, item);
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
  pub fn resolve_entry(&self, key: u32) -> (u32, &ArenaSchemaItem) {
    let mut resolved_key = key;
    let mut resolved_item = self.get_item(resolved_key as usize);

    loop {
      let Some(alias_key) = resolved_item.get_alias_key() else {
        break;
      };
      resolved_key = alias_key;
      resolved_item = self.get_item(resolved_key as usize);
    }

    (resolved_key, resolved_item)
  }

  pub fn get_all_related(&self, key: u32) -> impl Iterator<Item = u32> + '_ {
    let mut result: BTreeSet<_> = iter::once(key).collect();
    let mut queue: Vec<_> = iter::once(key).collect();

    while let Some(key) = queue.pop() {
      let item = self.get_item(key as usize);
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
