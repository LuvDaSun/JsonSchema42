use crate::utils::node_location::NodeLocation;
use std::{
  ffi::{c_char, CStr, CString},
  ptr::null,
};

#[no_mangle]
extern "C" fn node_location_drop(node_location: *mut NodeLocation) {
  let _ = unsafe { Box::from_raw(node_location) };
}

#[no_mangle]
extern "C" fn node_location_clone(node_location: *const NodeLocation) -> *mut NodeLocation {
  let node_location = unsafe { &*node_location };

  let result = node_location.clone();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_parse(input: *const c_char) -> *mut NodeLocation {
  let input = unsafe { CStr::from_ptr(input) };
  let input = input.to_str().unwrap();

  let node_location = input.parse().unwrap();
  let node_location = Box::new(node_location);

  Box::into_raw(node_location)
}

#[no_mangle]
extern "C" fn node_location_join(
  node_location: *const NodeLocation,
  other_node_location: *const NodeLocation,
) -> *mut NodeLocation {
  let node_location = unsafe { &*node_location };
  let other_node_location = unsafe { &*other_node_location };

  let result = node_location.join(other_node_location);
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_to_string(node_location: *const NodeLocation) -> *mut c_char {
  let node_location = unsafe { &*node_location };

  let result = node_location.to_string();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

#[no_mangle]
extern "C" fn node_location_to_fetch_string(node_location: *const NodeLocation) -> *mut c_char {
  let node_location = unsafe { &*node_location };

  let result = node_location.to_fetch_string();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

#[no_mangle]
extern "C" fn node_location_get_anchor(node_location: *const NodeLocation) -> *const c_char {
  let node_location = unsafe { &*node_location };

  let result = node_location.get_anchor();
  let Some(result) = result else {
    return null();
  };
  let result = result.to_owned();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

#[no_mangle]
extern "C" fn node_location_get_pointer(node_location: *const NodeLocation) -> *const Vec<String> {
  let node_location = unsafe { &*node_location };

  let result = node_location.get_pointer();
  let Some(result) = result else {
    return null();
  };
  let result = result.into_iter().map(|value| value.to_owned()).collect();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_get_path(node_location: *const NodeLocation) -> *const Vec<String> {
  let node_location = unsafe { &*node_location };

  let result = node_location.get_path();
  let result = result.into_iter().map(|value| value.to_owned()).collect();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn node_location_get_hash(node_location: *const NodeLocation) -> *const Vec<String> {
  let node_location = unsafe { &*node_location };

  let result = node_location.get_hash();
  let result = result.into_iter().map(|value| value.to_owned()).collect();
  let result = Box::new(result);

  Box::into_raw(result)
}

#[no_mangle]
extern "C" fn is_root(node_location: *const NodeLocation) -> bool {
  let node_location = unsafe { &*node_location };

  node_location.is_root()
}

#[no_mangle]
extern "C" fn node_location_set_anchor(node_location: *mut NodeLocation, anchor: *const c_char) {
  let node_location = unsafe { &mut *node_location };
  let anchor = unsafe { CStr::from_ptr(anchor) };
  let anchor = anchor.to_str().unwrap();

  node_location.set_anchor(anchor);
}

#[no_mangle]
extern "C" fn node_location_set_pointer(
  node_location: *mut NodeLocation,
  pointer: *const Vec<String>,
) {
  let node_location = unsafe { &mut *node_location };
  let pointer = unsafe { &*pointer };

  node_location.set_pointer(pointer);
}

#[no_mangle]
extern "C" fn node_location_set_root(node_location: *mut NodeLocation) {
  let node_location = unsafe { &mut *node_location };

  node_location.set_root();
}
