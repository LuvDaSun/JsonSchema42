use crate::{models::SchemaArena, schema_transforms::SchemaTransform};
use std::{
  ffi::{c_char, CStr, CString},
  ptr::null_mut,
};

use super::with_error::with_error_reference;

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
  let arena = unsafe { &*arena };
  let arena = arena.clone();
  let arena = Box::new(arena);
  Box::into_raw(arena)
}

#[no_mangle]
extern "C" fn schema_arena_count(arena: *const SchemaArena) -> usize {
  let arena = unsafe { &*arena };
  arena.count()
}

#[no_mangle]
extern "C" fn schema_arena_add_item(
  arena: *mut SchemaArena,
  item: *const c_char,
  error_reference: *mut usize,
) -> usize {
  with_error_reference(error_reference, || {
    let arena = unsafe { &mut *arena };
    let item = unsafe { CStr::from_ptr(item) };
    let item = item.to_str()?;
    let item = serde_json::from_str(item)?;

    Ok(arena.add_item(item))
  })
  .unwrap_or_default()
}

#[no_mangle]
extern "C" fn schema_arena_replace_item(
  arena: *mut SchemaArena,
  key: usize,
  item: *const c_char,
  error_reference: *mut usize,
) -> *mut c_char {
  with_error_reference(error_reference, || {
    let arena = unsafe { &mut *arena };
    let item = unsafe { CStr::from_ptr(item) };
    let item = item.to_str()?;
    let item = serde_json::from_str(item)?;

    let item_previous = arena.replace_item(key, item);
    let item_previous = serde_json::to_string(&item_previous)?;
    let item_previous = CString::new(item_previous)?;

    Ok(item_previous.into_raw())
  })
  .unwrap_or_else(null_mut)
}

#[no_mangle]
extern "C" fn schema_arena_get_item(
  arena: *mut SchemaArena,
  key: usize,
  error_reference: *mut usize,
) -> *mut c_char {
  with_error_reference(error_reference, || {
    let arena = unsafe { &mut *arena };
    let item = arena.get_item(key);
    let item = serde_json::to_string(item).unwrap();
    let item = CString::new(item).unwrap();

    Ok(item.into_raw())
  })
  .unwrap_or_else(null_mut)
}

#[no_mangle]
extern "C" fn schema_arena_transform(
  arena: *mut SchemaArena,
  transforms: *const Vec<SchemaTransform>,
) -> usize {
  let arena = unsafe { &mut *arena };
  let transforms = unsafe { &*transforms };

  arena.transform(transforms)
}