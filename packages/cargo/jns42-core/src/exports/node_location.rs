use crate::utils::node_location::NodeLocation;
use std::ffi::{c_char, CString};

#[no_mangle]
extern "C" fn node_location_drop(node_location: *mut NodeLocation) {
  assert!(!node_location.is_null());

  drop(unsafe { Box::from_raw(node_location) });
}

#[no_mangle]
extern "C" fn node_location_clone(node_location: *const NodeLocation) -> *mut NodeLocation {
  assert!(!node_location.is_null());

  let node_location = unsafe { &*node_location };

  let result = node_location.clone();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_parse(input: *const c_char) -> *mut NodeLocation {
  assert!(!input.is_null());

  let input = unsafe { &*input };
  let input = input.as_ref();

  let node_location = input.parse().unwrap();
  let node_location = Box::new(node_location);

  Box::into_raw(node_location)
}

#[no_mangle]
extern "C" fn node_location_join(
  node_location: *const NodeLocation,
  other_node_location: *const NodeLocation,
) -> *mut NodeLocation {
  assert!(!node_location.is_null());
  assert!(!other_node_location.is_null());

  let node_location = unsafe { &*node_location };
  let other_node_location = unsafe { &*other_node_location };

  let result = node_location.join(other_node_location);
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_to_string(node_location: *const NodeLocation) -> *mut c_char {
  assert!(!node_location.is_null());

  let node_location = unsafe { &*node_location };

  let result = node_location.to_string();
  let result = CString::new(result);
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_to_retrieval_string(node_location: *const NodeLocation) -> *mut c_char {
  assert!(!node_location.is_null());

  let node_location = unsafe { &*node_location };

  let result = node_location.to_retrieval_string();
  let result = CString::new(result);
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_get_anchor(node_location: *mut NodeLocation) -> *const c_char {
  assert!(!node_location.is_null());

  let node_location = unsafe { &mut *node_location };

  let result = node_location.get_anchor();
  let Some(result) = result else {
    return null();
  };
  let result = CString::new(result.to_owned());
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_get_pointer(node_location: *mut NodeLocation) -> *const Vec<String> {
  let node_location = unsafe { &mut *node_location };

  let result = node_location.get_pointer();
  let Some(result) = result else {
    return null();
  };
  let result = result
    .into_iter()
    .map(|value| CString::new(value.to_owned()))
    .collect();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_get_path(node_location: *mut NodeLocation) -> *const Vec<String> {
  let node_location = unsafe { &mut *node_location };

  let result = node_location.get_path();
  let result = result
    .into_iter()
    .map(|value| CString::new(value.to_owned()))
    .collect();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_get_hash(node_location: *mut NodeLocation) -> *const Vec<String> {
  let node_location = unsafe { &mut *node_location };

  let result = node_location.get_hash();
  let result = result
    .into_iter()
    .map(|value| CString::new(value.to_owned()))
    .collect();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_set_anchor(node_location: *mut NodeLocation, anchor: *const c_char) {
  assert!(!node_location.is_null());
  assert!(!anchor.is_null());

  let node_location = unsafe { &mut *node_location };
  let anchor = unsafe { &*anchor };
  let anchor = anchor.as_ref();

  node_location.set_anchor(anchor);
}

#[no_mangle]
extern "C" fn node_location_set_pointer(
  node_location: *mut NodeLocation,
  pointer: *const Vec<String>,
) {
  assert!(!node_location.is_null());
  assert!(!pointer.is_null());

  let node_location = unsafe { &mut *node_location };
  let pointer = unsafe { &*pointer };

  node_location.set_pointer(pointer);
}

#[no_mangle]
extern "C" fn node_location_set_root(node_location: *mut NodeLocation) {
  assert!(!node_location.is_null());

  let node_location = unsafe { &mut *node_location };

  node_location.set_root();
}
