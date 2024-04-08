use crate::naming::Names;
use std::ffi::{c_char, CString};

/// Free Names instance
#[no_mangle]
extern "C" fn names_drop(names: *mut Names<usize>) {
  let _ = unsafe { Box::from_raw(names) };
}

/// get the name as camelCase
#[no_mangle]
extern "C" fn names_to_camel_case(names: *mut Names<usize>, key: usize) -> *mut c_char {
  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_camel_case();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

/// get the name as PascalCase
#[no_mangle]
extern "C" fn names_to_pascal_case(names: *mut Names<usize>, key: usize) -> *mut c_char {
  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();

  let result = sentence.to_pascal_case();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

/// get the name as snake_case
#[no_mangle]
extern "C" fn names_to_snake_case(names: *mut Names<usize>, key: usize) -> *mut c_char {
  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();

  let result = sentence.to_snake_case();
  let result = CString::new(result).unwrap();

  result.into_raw()
}

/// get the name as SCREAMING_SNAKE_CASE
#[no_mangle]
extern "C" fn names_to_screaming_snake_case(names: *mut Names<usize>, key: usize) -> *mut c_char {
  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();

  let result = sentence.to_screaming_snake_case();
  let result = CString::new(result).unwrap();

  result.into_raw()
}
