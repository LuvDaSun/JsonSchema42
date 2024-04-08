use crate::naming::Sentence;
use std::ffi::{c_char, CStr, CString};

/// get the name as camelCase
#[no_mangle]
extern "C" fn to_camel_case(value: *const c_char) -> *mut c_char {
  let value = unsafe { CStr::from_ptr(value) };
  let value = value.to_str().unwrap();

  let sentence = Sentence::new(value);
  let result = sentence.to_camel_case();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

/// get the name as PascalCase
#[no_mangle]
extern "C" fn to_pascal_case(value: *const c_char) -> *mut c_char {
  let value = unsafe { CStr::from_ptr(value) };
  let value = value.to_str().unwrap();

  let sentence = Sentence::new(value);

  let result = sentence.to_pascal_case();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

/// get the name as snake_case
#[no_mangle]
extern "C" fn to_snake_case(value: *const c_char) -> *mut c_char {
  let value = unsafe { CStr::from_ptr(value) };
  let value = value.to_str().unwrap();

  let sentence = Sentence::new(value);

  let result = sentence.to_snake_case();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

/// get the name as SCREAMING_SNAKE_CASE
#[no_mangle]
extern "C" fn to_screaming_snake_case(value: *const c_char) -> *mut c_char {
  let value = unsafe { CStr::from_ptr(value) };
  let value = value.to_str().unwrap();

  let sentence = Sentence::new(value);

  let result = sentence.to_screaming_snake_case();
  let result = CString::new(result).unwrap();

  result.into_raw()
}
