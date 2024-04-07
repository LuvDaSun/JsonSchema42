use super::{
  arena::Arena,
  schema::{SchemaItem, SchemaKey},
};
use crate::{
  ffi::SizedString,
  schema_transforms::{BoxedSchemaTransform, SchemaTransform},
};
use std::iter::empty;

impl Arena<SchemaItem> {
  pub fn resolve_entry(&self, key: SchemaKey) -> (SchemaKey, &SchemaItem) {
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

  pub fn get_ancestors(
    &self,
    key: SchemaKey,
  ) -> impl DoubleEndedIterator<Item = (SchemaKey, &SchemaItem)> {
    let mut result = Vec::new();

    let mut key_maybe = Some(key);
    while let Some(key) = key_maybe {
      let item = self.get_item(key);
      result.push((key, item));

      key_maybe = item.parent;
    }

    result.into_iter()
  }

  pub fn has_ancestor(&self, key: SchemaKey, ancestor_key: SchemaKey) -> bool {
    self
      .get_ancestors(key)
      .any(|(key, _item)| key == ancestor_key)
  }

  pub fn get_name_parts(&self, key: SchemaKey) -> impl Iterator<Item = &str> {
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
          item_previous.id.is_none()
        } else {
          true
        }
      })
      .map(|(_item_previous, item)| {
        empty()
          .chain(
            item
              .id
              .as_ref()
              .map(|id| empty().chain(id.get_path()).chain(id.get_hash())),
          )
          .flatten()
          .chain(item.name.as_deref())
          .filter(|part| !part.is_empty())
      })
      .collect();

    ancestors.into_iter().rev().flatten()
  }

  pub fn transform(&mut self, transforms: Vec<SchemaTransform>) -> usize {
    self.apply_transform(|arena: &mut Arena<SchemaItem>, key: usize| {
      for transform in &transforms {
        let transform: BoxedSchemaTransform = transform.into();
        transform(arena, key)
      }
    })
  }
}

#[no_mangle]
extern "C" fn schema_arena_drop(arena: *mut Arena<SchemaItem>) {
  assert!(!arena.is_null());

  drop(unsafe { Box::from_raw(arena) });
}

#[no_mangle]
extern "C" fn schema_arena_new() -> *const Arena<SchemaItem> {
  let arena = Arena::new();
  let arena = Box::new(arena);
  Box::into_raw(arena)
}

#[no_mangle]
extern "C" fn schema_arena_clone(arena: *const Arena<SchemaItem>) -> *const Arena<SchemaItem> {
  assert!(!arena.is_null());

  let arena = unsafe { &*arena };
  let arena = arena.clone();
  let arena = Box::new(arena);
  Box::into_raw(arena)
}

#[no_mangle]
extern "C" fn schema_arena_count(arena: *const Arena<SchemaItem>) -> usize {
  assert!(!arena.is_null());

  let arena = unsafe { &*arena };
  arena.count()
}

#[no_mangle]
extern "C" fn schema_arena_add_item(
  arena: *mut Arena<SchemaItem>,
  item: *const SizedString,
) -> usize {
  assert!(!arena.is_null());
  assert!(!item.is_null());

  let arena = unsafe { &mut *arena };
  let item = unsafe { &*item };
  let item = item.as_ref();
  let item = serde_json::from_str(item).unwrap();

  arena.add_item(item)
}

#[no_mangle]
extern "C" fn schema_arena_replace_item(
  arena: *mut Arena<SchemaItem>,
  key: usize,
  item: *const SizedString,
) -> *const SizedString {
  assert!(!arena.is_null());
  assert!(!item.is_null());

  let arena = unsafe { &mut *arena };
  let item = unsafe { &*item };
  let item = item.as_ref();
  let item = serde_json::from_str(item).unwrap();

  let item_previous = arena.replace_item(key, item);
  let item_previous = serde_json::to_string(&item_previous).unwrap();
  let item_previous = SizedString::new(item_previous);
  let item_previous = Box::new(item_previous);

  Box::into_raw(item_previous)
}

#[no_mangle]
extern "C" fn schema_arena_get_item(
  arena: *mut Arena<SchemaItem>,
  key: usize,
) -> *const SizedString {
  assert!(!arena.is_null());

  let arena = unsafe { &mut *arena };
  let item = arena.get_item(key);
  let item = serde_json::to_string(item).unwrap();
  let item = SizedString::new(item);
  let item = Box::new(item);

  Box::into_raw(item)
}

#[no_mangle]
extern "C" fn schema_arena_transform(
  arena: *mut Arena<SchemaItem>,
  transforms: *const Vec<usize>,
) -> usize {
  assert!(!arena.is_null());
  assert!(!transforms.is_null());

  let arena = unsafe { &mut *arena };
  let transforms = unsafe { &*transforms };
  let transforms = transforms
    .iter()
    .map(|transform| (*transform).into())
    .collect();

  arena.transform(transforms)
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_get_name_parts() {
    let mut arena = Arena::new();

    arena.add_item(SchemaItem {
      id: Some("http://id.com#/a/0".parse().unwrap()),
      ..Default::default()
    });

    arena.add_item(SchemaItem {
      parent: Some(0),
      id: Some("http://id.com#/b/1".parse().unwrap()),
      ..Default::default()
    });

    arena.add_item(SchemaItem {
      parent: Some(1),
      name: Some("2".to_string()),
      ..Default::default()
    });

    arena.add_item(SchemaItem {
      parent: Some(2),
      name: Some("3".to_string()),
      ..Default::default()
    });

    assert_eq!(arena.get_name_parts(0).collect::<Vec<_>>(), vec!["a", "0"]);
    assert_eq!(arena.get_name_parts(1).collect::<Vec<_>>(), vec!["b", "1"]);
    assert_eq!(
      arena.get_name_parts(2).collect::<Vec<_>>(),
      vec!["b", "1", "2"]
    );
    assert_eq!(
      arena.get_name_parts(3).collect::<Vec<_>>(),
      vec!["b", "1", "2", "3"]
    );
  }
}
