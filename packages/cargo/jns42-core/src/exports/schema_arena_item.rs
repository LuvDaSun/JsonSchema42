use crate::models::ArenaSchemaItem;

#[no_mangle]
extern "C" fn schema_arena_item_new() -> *const ArenaSchemaItem {
  let schema_item = ArenaSchemaItem::default();
  let schema_item = Box::new(schema_item);
  Box::into_raw(schema_item)
}

#[no_mangle]
extern "C" fn schema_arena_item_drop(schema_item: *mut ArenaSchemaItem) {
  let _ = unsafe { Box::from_raw(schema_item) };
}
