use crate::models::schema_item::SchemaItem;

#[no_mangle]
extern "C" fn schema_item_new() -> *const SchemaItem {
  let schema_item = SchemaItem::default();
  let schema_item = Box::new(schema_item);
  Box::into_raw(schema_item)
}

#[no_mangle]
extern "C" fn schema_item_drop(schema_item: *mut SchemaItem) {
  let _ = unsafe { Box::from_raw(schema_item) };
}
