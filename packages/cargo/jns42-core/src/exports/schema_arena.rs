use crate::{
  documents::DocumentContext,
  models::{ArenaSchemaItem, SchemaArena, SchemaTransform},
};
use std::rc::Rc;

#[no_mangle]
extern "C" fn schema_arena_drop(arena: *mut SchemaArena) {
  let _ = unsafe { Box::from_raw(arena) };
}

#[no_mangle]
extern "C" fn schema_arena_from_document_context(
  document_context: *const Rc<DocumentContext>,
) -> *mut SchemaArena {
  let document_context = unsafe { &*document_context };
  let arena = SchemaArena::from_document_context(document_context);
  let arena = Box::new(arena);
  Box::into_raw(arena)
}

#[no_mangle]
extern "C" fn schema_arena_clone(arena: *const SchemaArena) -> *mut SchemaArena {
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
extern "C" fn schema_arena_get_item(arena: *mut SchemaArena, key: usize) -> *const ArenaSchemaItem {
  let arena = unsafe { &mut *arena };
  let item = arena.get_item(key);
  item
}

#[no_mangle]
extern "C" fn schema_arena_get_name_parts(arena: *mut SchemaArena, key: usize) -> *mut Vec<String> {
  let arena = unsafe { &mut *arena };
  let parts = arena
    .get_name_parts(key)
    .map(|part| part.to_owned())
    .collect();
  let parts = Box::new(parts);

  Box::into_raw(parts)
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
