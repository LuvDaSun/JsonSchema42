use super::with_error::with_error_reference;
use crate::naming::Sentence;
use std::{
  ffi::{c_char, CStr, CString},
  ptr::null_mut,
};

#[no_mangle]
extern "C" fn sentence_drop(sentence: *mut Sentence) {
  let _ = unsafe { Box::from_raw(sentence) };
}

#[no_mangle]
extern "C" fn sentence_new(input: *const c_char, error_reference: *mut usize) -> *mut Sentence {
  with_error_reference(error_reference, || {
    let input = unsafe { CStr::from_ptr(input) };
    let input = input.to_str()?;

    let sentence = Sentence::new(input);
    let sentence = Box::new(sentence);

    Ok(Box::into_raw(sentence))
  })
  .unwrap_or_else(null_mut)
}

#[no_mangle]
extern "C" fn sentence_clone(sentence: *const Sentence) -> *mut Sentence {
  let sentence = unsafe { &*sentence };

  let sentence = sentence.clone();
  let sentence = Box::new(sentence);

  Box::into_raw(sentence)
}

/// get the sentence as camelCase
#[no_mangle]
extern "C" fn sentence_to_camel_case(
  sentence: *const Sentence,
  error_reference: *mut usize,
) -> *mut c_char {
  with_error_reference(error_reference, || {
    let sentence = unsafe { &*sentence };

    let result = sentence.to_camel_case();
    let result = CString::new(result)?;

    Ok(result.into_raw())
  })
  .unwrap_or_else(null_mut)
}

/// get the sentence as PascalCase
#[no_mangle]
extern "C" fn sentence_to_pascal_case(
  sentence: *const Sentence,
  error_reference: *mut usize,
) -> *mut c_char {
  with_error_reference(error_reference, || {
    let sentence = unsafe { &*sentence };

    let result = sentence.to_pascal_case();
    let result = CString::new(result)?;

    Ok(result.into_raw())
  })
  .unwrap_or_else(null_mut)
}

/// get the sentence as snake_case
#[no_mangle]
extern "C" fn sentence_to_snake_case(
  sentence: *const Sentence,
  error_reference: *mut usize,
) -> *mut c_char {
  with_error_reference(error_reference, || {
    let sentence = unsafe { &*sentence };

    let result = sentence.to_snake_case();
    let result = CString::new(result)?;

    Ok(result.into_raw())
  })
  .unwrap_or_else(null_mut)
}

/// get the sentence as SCREAMING_SNAKE_CASE
#[no_mangle]
extern "C" fn sentence_to_screaming_snake_case(
  sentence: *const Sentence,
  error_reference: *mut usize,
) -> *mut c_char {
  with_error_reference(error_reference, || {
    let sentence = unsafe { &*sentence };

    let result = sentence.to_screaming_snake_case();
    let result = CString::new(result)?;

    Ok(result.into_raw())
  })
  .unwrap_or_else(null_mut)
}
