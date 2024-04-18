use crate::models::ArenaSchemaNode;

#[no_mangle]
extern "C" fn schema_item_new() -> *const ArenaSchemaNode {
  let schema_item = ArenaSchemaNode::default();
  let schema_item = Box::new(schema_item);
  Box::into_raw(schema_item)
}

#[no_mangle]
extern "C" fn schema_item_drop(schema_item: *mut ArenaSchemaNode) {
  let _ = unsafe { Box::from_raw(schema_item) };
}
