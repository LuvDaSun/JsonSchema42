use super::with_error::with_error_reference;
use crate::naming::Sentence;
use std::{
  ffi::{c_char, CStr, CString},
  ptr::null_mut,
};

/// get the name as camelCase
#[no_mangle]
extern "C" fn to_camel_case(value: *const c_char, error_reference: *mut usize) -> *mut c_char {
  with_error_reference(error_reference, || {
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_str()?;

    let sentence = Sentence::new(value);
    let result = sentence.to_camel_case();
    let result = CString::new(result)?;

    Ok(result.into_raw())
  })
  .unwrap_or_else(null_mut)
}

/// get the name as PascalCase
#[no_mangle]
extern "C" fn to_pascal_case(value: *const c_char, error_reference: *mut usize) -> *mut c_char {
  with_error_reference(error_reference, || {
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_str()?;

    let sentence = Sentence::new(value);

    let result = sentence.to_pascal_case();
    let result = CString::new(result)?;

    Ok(result.into_raw())
  })
  .unwrap_or_else(null_mut)
}

/// get the name as snake_case
#[no_mangle]
extern "C" fn to_snake_case(value: *const c_char, error_reference: *mut usize) -> *mut c_char {
  with_error_reference(error_reference, || {
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_str()?;

    let sentence = Sentence::new(value);

    let result = sentence.to_snake_case();
    let result = CString::new(result)?;

    Ok(result.into_raw())
  })
  .unwrap_or_else(null_mut)
}

/// get the name as SCREAMING_SNAKE_CASE
#[no_mangle]
extern "C" fn to_screaming_snake_case(
  value: *const c_char,
  error_reference: *mut usize,
) -> *mut c_char {
  with_error_reference(error_reference, || {
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_str()?;

    let sentence = Sentence::new(value);

    let result = sentence.to_screaming_snake_case();
    let result = CString::new(result)?;

    Ok(result.into_raw())
  })
  .unwrap_or_else(null_mut)
}
