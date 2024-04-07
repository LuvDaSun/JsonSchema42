use crate::{models::schema_arena::SchemaArena, schema_transforms::SchemaTransform};
use std::ffi::{c_char, CStr, CString};

#[no_mangle]
extern "C" fn schema_arena_drop(arena: *mut SchemaArena) {
  let _ = unsafe { Box::from_raw(arena) };
}

#[no_mangle]
extern "C" fn schema_arena_new() -> *const SchemaArena {
  let arena = SchemaArena::new();
  let arena = Box::new(arena);
  Box::into_raw(arena)
}

#[no_mangle]
extern "C" fn schema_arena_clone(arena: *const SchemaArena) -> *const SchemaArena {
  assert!(!arena.is_null());

  let arena = unsafe { &*arena };
  let arena = arena.clone();
  let arena = Box::new(arena);
  Box::into_raw(arena)
}

#[no_mangle]
extern "C" fn schema_arena_count(arena: *const SchemaArena) -> usize {
  assert!(!arena.is_null());

  let arena = unsafe { &*arena };
  arena.count()
}

#[no_mangle]
extern "C" fn schema_arena_add_item(arena: *mut SchemaArena, item: *const c_char) -> usize {
  assert!(!arena.is_null());
  assert!(!item.is_null());

  let arena = unsafe { &mut *arena };
  let item = unsafe { CStr::from_ptr(item) };
  let item = item.to_str().unwrap();
  let item = serde_json::from_str(item).unwrap();

  arena.add_item(item)
}

#[no_mangle]
extern "C" fn schema_arena_replace_item(
  arena: *mut SchemaArena,
  key: usize,
  item: *const c_char,
) -> *mut c_char {
  assert!(!arena.is_null());
  assert!(!item.is_null());

  let arena = unsafe { &mut *arena };
  let item = unsafe { CStr::from_ptr(item) };
  let item = item.to_str().unwrap();
  let item = serde_json::from_str(item).unwrap();

  let item_previous = arena.replace_item(key, item);
  let item_previous = serde_json::to_string(&item_previous).unwrap();
  let item_previous = CString::new(item_previous).unwrap();

  item_previous.into_raw()
}

#[no_mangle]
extern "C" fn schema_arena_get_item(arena: *mut SchemaArena, key: usize) -> *mut c_char {
  assert!(!arena.is_null());

  let arena = unsafe { &mut *arena };
  let item = arena.get_item(key);
  let item = serde_json::to_string(item).unwrap();
  let item = CString::new(item).unwrap();

  item.into_raw()
}

#[no_mangle]
extern "C" fn schema_arena_transform(
  arena: *mut SchemaArena,
  transforms: *const Vec<SchemaTransform>,
) -> usize {
  assert!(!arena.is_null());
  assert!(!transforms.is_null());

  let arena = unsafe { &mut *arena };
  let transforms = unsafe { &*transforms };

  arena.transform(transforms)
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::schema_item::SchemaItem;

  #[test]
  fn test_get_name_parts() {
    let mut arena = SchemaArena::new();

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
