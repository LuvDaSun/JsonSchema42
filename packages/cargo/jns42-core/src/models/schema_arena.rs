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

#[cfg(target_arch = "wasm32")]
use crate::exports;

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
    let mut result: BTreeSet<_> = iter::once(key).collect();
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

#[cfg(target_arch = "wasm32")]
pub struct SchemaArenaHost(std::cell::RefCell<SchemaArena>);

#[cfg(target_arch = "wasm32")]
impl From<SchemaArena> for SchemaArenaHost {
  fn from(value: SchemaArena) -> Self {
    Self(value.into())
  }
}

#[cfg(target_arch = "wasm32")]
impl From<SchemaArenaHost> for exports::jns42::core::models::SchemaArena {
  fn from(value: SchemaArenaHost) -> Self {
    Self::new(value)
  }
}

#[cfg(target_arch = "wasm32")]
impl From<SchemaArena> for exports::jns42::core::models::SchemaArena {
  fn from(value: SchemaArena) -> Self {
    SchemaArenaHost::from(value).into()
  }
}

#[cfg(target_arch = "wasm32")]
impl exports::jns42::core::models::GuestSchemaArena for SchemaArenaHost {
  fn new() -> Self {
    SchemaArena::new().into()
  }

  fn count(&self) -> u32 {
    self.0.borrow().count() as u32
  }

  fn get_item(
    &self,
    key: exports::jns42::core::models::Key,
  ) -> exports::jns42::core::models::ArenaSchemaItem {
    self.0.borrow().get_item(key as usize).clone().into()
  }

  fn get_all_related(
    &self,
    key: exports::jns42::core::models::Key,
  ) -> Vec<exports::jns42::core::models::Key> {
    self
      .0
      .borrow()
      .get_all_related(key as usize)
      .map(|value| value as exports::jns42::core::models::Key)
      .collect()
  }

  fn transform(&self, transforms: Vec<exports::jns42::core::models::SchemaTransform>) -> u32 {
    self
      .0
      .borrow_mut()
      .apply_transform(|arena: &mut SchemaArena, key: usize| {
        for transform in &transforms {
          let transform: super::schema_transform::BoxedSchemaTransform = (*transform).into();
          transform(arena, key)
        }
      }) as u32
  }

  fn clone(&self) -> exports::jns42::core::models::SchemaArena {
    exports::jns42::core::models::SchemaArena::new(SchemaArenaHost::from(self.0.borrow().clone()))
  }
}

// #[cfg(test)]
// mod tests {
//   use *;
//   use exports::jns42::core::models::{
//     ArenaSchemaItem, GuestSchemaArena, SchemaTransform, SchemaType,
//   };
//   use itertools::Itertools;

//   fn run_test(
//     initial: impl IntoIterator<Item = ArenaSchemaItem>,
//     expected: impl IntoIterator<Item = ArenaSchemaItem>,
//     transforms: impl IntoIterator<Item = SchemaTransform>,
//   ) {
//     let expected: Vec<_> = expected.into_iter().collect();
//     let arena_input = models::SchemaArena::from_iter(initial);
//     let transforms: Vec<_> = transforms.into_iter().collect();

//     // the order of transforms should not matter! we test that here
//     for transforms in transforms.iter().permutations(transforms.len()) {
//       let arena: SchemaArenaHost = arena_input.clone().into();
//       let transforms = transforms.into_iter().cloned().collect::<Vec<_>>();

//       let mut iteration = 0;
//       while arena.transform(transforms.clone()) > 0 {
//         iteration += 1;
//         assert!(iteration < 100);
//         assert!(arena.count() < 100);
//       }

//       let arena: SchemaArena = arena.into();
//       let actual: Vec<_> = arena.iter().cloned().collect();

//       assert_eq!(actual, expected)
//     }
//   }

//   #[test]
//   fn test_transform_1() {
//     let transforms = [
//       SchemaTransform::FlattenAllOf,
//       SchemaTransform::InheritAllOf,
//       SchemaTransform::InheritReference,
//       SchemaTransform::ResolveAllOf,
//       SchemaTransform::ResolveSingleAllOf,
//       SchemaTransform::Unalias,
//     ];

//     let initial = [
//       ArenaSchemaItem {
//         types: Some([SchemaType::Str].into()),
//         ..Default::default()
//       }, // 0
//       ArenaSchemaItem {
//         types: Some([SchemaType::Object].into()),
//         object_properties: Some([("a".into(), 0), ("b".into(), 0)].into()),
//         ..Default::default()
//       }, // 1
//       ArenaSchemaItem {
//         object_properties: Some([("c".into(), 0)].into()),
//         reference: Some(1),
//         ..Default::default()
//       }, // 2
//     ];

//     let expected = [
//       ArenaSchemaItem {
//         types: Some([SchemaType::Str].into()),
//         ..Default::default()
//       }, // 0
//       ArenaSchemaItem {
//         types: Some([SchemaType::Object].into()),
//         object_properties: Some([("a".into(), 0), ("b".into(), 0)].into()),
//         ..Default::default()
//       }, // 1
//       ArenaSchemaItem {
//         reference: Some(4),
//         ..Default::default()
//       }, // 2
//       ArenaSchemaItem {
//         object_properties: Some([("c".into(), 0)].into()),
//         ..Default::default()
//       }, // 3
//       ArenaSchemaItem {
//         types: Some([SchemaType::Object].into()),
//         object_properties: Some([("a".into(), 0), ("b".into(), 0), ("c".into(), 0)].into()),
//         ..Default::default()
//       }, // 4
//     ];

//     run_test(initial, expected, transforms);
//   }
// }
