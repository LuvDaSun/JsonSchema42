use crate::utils::names::{Names, NamesBuilder};

/// Create a new NamesBuilder instance
#[no_mangle]
pub extern "C" fn names_builder_new() -> *mut NamesBuilder<usize> {
  Box::into_raw(Box::new(NamesBuilder::new()))
}

/// # Safety
/// Please only pass pointers to NamesBuilder instances!
/// and pass valid cstr pointers
#[no_mangle]
pub extern "C" fn names_builder_add(
  ptr: *mut NamesBuilder<usize>,
  key: usize,
  input: *const std::ffi::c_char,
) {
  let names_builder = unsafe {
    assert!(!ptr.is_null());
    &mut *ptr
  };
  let input = unsafe {
    assert!(!input.is_null());
    std::ffi::CStr::from_ptr(input)
  };

  let input = input.to_str().unwrap();

  names_builder.add(key, input);
}

/// # Safety
/// Please only pass pointers to NamesBuilder instances!
/// and pass valid cstr pointers
#[no_mangle]
pub extern "C" fn names_builder_build(
  ptr: *mut NamesBuilder<usize>,
  maximum_iterations: usize,
) -> *mut Names<usize> {
  let names_builder = unsafe {
    assert!(!ptr.is_null());
    &mut *ptr
  };

  let names = names_builder.build(maximum_iterations);

  Box::into_raw(Box::new(names))
}

/// Gets a name in camel case
///
/// # Safety
/// Please only pass pointers to Names instances!
#[no_mangle]
pub extern "C" fn names_to_camel_case(ptr: *mut Names<usize>, key: usize) -> *mut std::ffi::c_char {
  let names = unsafe {
    assert!(!ptr.is_null());
    &mut *ptr
  };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_camel_case();
  let result = std::ffi::CString::new(result).unwrap();
  result.into_raw()
}

/// Gets a name in pascal case
///
/// # Safety
/// Please only pass pointers to Names instances!
#[no_mangle]
pub extern "C" fn names_to_pascal_case(
  ptr: *mut Names<usize>,
  key: usize,
) -> *mut std::ffi::c_char {
  let names = unsafe {
    assert!(!ptr.is_null());
    &mut *ptr
  };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_pascal_case();
  let result = std::ffi::CString::new(result).unwrap();
  result.into_raw()
}

/// Gets a name in snake case
///
/// # Safety
/// Please only pass pointers to Names instances!
#[no_mangle]
pub extern "C" fn names_to_snake_case(ptr: *mut Names<usize>, key: usize) -> *mut std::ffi::c_char {
  let names = unsafe {
    assert!(!ptr.is_null());
    &mut *ptr
  };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_snake_case();
  let result = std::ffi::CString::new(result).unwrap();
  result.into_raw()
}

/// Gets a name in screaming snake case
///
/// # Safety
/// Please only pass pointers to Names instances!
#[no_mangle]
pub extern "C" fn names_to_screaming_snake_case(
  ptr: *mut Names<usize>,
  key: usize,
) -> *mut std::ffi::c_char {
  let names = unsafe {
    assert!(!ptr.is_null());
    &mut *ptr
  };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_screaming_snake_case();
  let result = std::ffi::CString::new(result).unwrap();
  result.into_raw()
}

/// Free NamesBuilder instance
///
/// # Safety
/// Please only pass pointers to NamesBuilder instances!
#[no_mangle]
pub extern "C" fn names_builder_free(ptr: *mut NamesBuilder<usize>) {
  if ptr.is_null() {
    return;
  }
  unsafe {
    let _ = Box::from_raw(ptr);
  }
}

/// Free Names instance
///
/// # Safety
/// Please only pass pointers to Names instances!
#[no_mangle]
pub extern "C" fn names_free(ptr: *mut Names<usize>) {
  if ptr.is_null() {
    return;
  }
  unsafe {
    let _ = Box::from_raw(ptr);
  }
}

#[no_mangle]
pub extern "C" fn string_free(s: *mut std::ffi::c_char) {
  unsafe {
    if s.is_null() {
      return;
    }
    let _ = std::ffi::CString::from_raw(s);
  }
}
