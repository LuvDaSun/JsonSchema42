use super::with_error::with_error_reference;
use crate::{error::Error, models::ArenaSchemaItem};
use std::{
  ffi::{c_char, CString},
  ptr::null_mut,
};

macro_rules! get_is_some {
  ($name: ident, $field: ident) => {
    #[no_mangle]
    extern "C" fn $name(schema_item: *const ArenaSchemaItem) -> bool {
      let schema_item = unsafe { &*schema_item };

      let result = &schema_item.$field;
      result.is_some()
    }
  };
}

macro_rules! get_location {
  ($name: ident, $field: ident) => {
    #[no_mangle]
    extern "C" fn $name(
      schema_item: *const ArenaSchemaItem,
      error_reference: *mut Error,
    ) -> *mut c_char {
      with_error_reference(error_reference, || {
        let schema_item = unsafe { &*schema_item };

        let result = schema_item.$field.as_ref().unwrap();
        let result = result.to_string();
        let result = CString::new(result)?;
        Ok(result.into_raw())
      })
      .unwrap_or_else(null_mut)
    }
  };
}

macro_rules! get_string {
  ($name: ident, $field: ident) => {
    #[no_mangle]
    extern "C" fn $name(
      schema_item: *const ArenaSchemaItem,
      error_reference: *mut Error,
    ) -> *mut c_char {
      with_error_reference(error_reference, || {
        let schema_item = unsafe { &*schema_item };

        let result = schema_item.$field.as_ref().unwrap();
        let result = CString::new(result.clone())?;
        Ok(result.into_raw())
      })
      .unwrap_or_else(null_mut)
    }
  };
}

macro_rules! get_bool {
  ($name: ident, $field: ident) => {
    #[no_mangle]
    extern "C" fn $name(schema_item: *const ArenaSchemaItem) -> bool {
      let schema_item = unsafe { &*schema_item };

      let result = schema_item.$field.unwrap();
      result
    }
  };
}

macro_rules! get_usize {
  ($name: ident, $field: ident) => {
    #[no_mangle]
    extern "C" fn $name(schema_item: *const ArenaSchemaItem) -> usize {
      let schema_item = unsafe { &*schema_item };

      let result = schema_item.$field.unwrap();
      result
    }
  };
}

#[no_mangle]
extern "C" fn arena_schema_item_new() -> *const ArenaSchemaItem {
  let schema_item = ArenaSchemaItem::default();
  let schema_item = Box::new(schema_item);
  Box::into_raw(schema_item)
}

#[no_mangle]
extern "C" fn arena_schema_item_drop(schema_item: *mut ArenaSchemaItem) {
  let _ = unsafe { Box::from_raw(schema_item) };
}

#[no_mangle]
extern "C" fn arena_schema_item_json(
  schema_item: *const ArenaSchemaItem,
  error_reference: *mut Error,
) -> *mut c_char {
  with_error_reference(error_reference, || {
    let schema_item = unsafe { &*schema_item };

    let schema_item = serde_json::to_string(schema_item)?;
    let schema_item = CString::new(schema_item)?;
    Ok(schema_item.into_raw())
  })
  .unwrap_or_else(null_mut)
}

get_is_some!(arena_schema_item_has_name, name);
get_string!(arena_schema_item_get_name, name);

get_is_some!(arena_schema_item_has_exact, exact);
get_bool!(arena_schema_item_get_exact, exact);

get_is_some!(arena_schema_item_has_primary, primary);
get_bool!(arena_schema_item_get_primary, primary);

get_is_some!(arena_schema_item_has_parent, parent);
get_usize!(arena_schema_item_get_parent, parent);

get_is_some!(arena_schema_item_has_location, location);
get_location!(arena_schema_item_get_location, location);

get_is_some!(arena_schema_item_has_title, title);
get_string!(arena_schema_item_get_title, title);

get_is_some!(arena_schema_item_has_description, description);
get_string!(arena_schema_item_get_description, description);

get_is_some!(arena_schema_item_has_examples, examples);

get_is_some!(arena_schema_item_has_deprecated, deprecated);
get_bool!(arena_schema_item_get_deprecated, deprecated);

get_is_some!(arena_schema_item_has_types, types);

get_is_some!(arena_schema_item_has_reference, reference);
get_usize!(arena_schema_item_get_reference, reference);

get_is_some!(arena_schema_item_has_if, r#if);
get_usize!(arena_schema_item_get_if, r#if);

get_is_some!(arena_schema_item_has_then, then);
get_usize!(arena_schema_item_get_then, then);

get_is_some!(arena_schema_item_has_else, r#else);
get_usize!(arena_schema_item_get_else, r#else);

get_is_some!(arena_schema_item_has_not, not);
get_usize!(arena_schema_item_get_not, not);

get_is_some!(arena_schema_item_has_property_names, property_names);
get_is_some!(arena_schema_item_has_map_properties, map_properties);
get_is_some!(arena_schema_item_has_array_items, array_items);
get_is_some!(arena_schema_item_has_contains, contains);
get_is_some!(arena_schema_item_has_all_of, all_of);
get_is_some!(arena_schema_item_has_any_of, any_of);
get_is_some!(arena_schema_item_has_one_of, one_of);
get_is_some!(arena_schema_item_has_tuple_items, tuple_items);
get_is_some!(arena_schema_item_has_object_properties, object_properties);
get_is_some!(arena_schema_item_has_pattern_properties, pattern_properties);
get_is_some!(arena_schema_item_has_dependent_schemas, dependent_schemas);
get_is_some!(arena_schema_item_has_options, options);
get_is_some!(arena_schema_item_has_required, required);
get_is_some!(arena_schema_item_has_minimum_inclusive, minimum_inclusive);
get_is_some!(arena_schema_item_has_minimum_exclusive, minimum_exclusive);
get_is_some!(arena_schema_item_has_maximum_inclusive, maximum_inclusive);
get_is_some!(arena_schema_item_has_maximum_exclusive, maximum_exclusive);
get_is_some!(arena_schema_item_has_multiple_of, multiple_of);
get_is_some!(arena_schema_item_has_minimum_length, minimum_length);
get_is_some!(arena_schema_item_has_maximum_length, maximum_length);
get_is_some!(arena_schema_item_has_value_pattern, value_pattern);
get_is_some!(arena_schema_item_has_value_format, value_format);
get_is_some!(arena_schema_item_has_minimum_items, minimum_items);
get_is_some!(arena_schema_item_has_maximum_items, maximum_items);
get_is_some!(arena_schema_item_has_unique_items, unique_items);
get_is_some!(arena_schema_item_has_minimum_properties, minimum_properties);
get_is_some!(arena_schema_item_has_maximum_properties, maximum_properties);
