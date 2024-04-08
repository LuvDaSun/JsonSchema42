use crate::naming::{Names, NamesBuilder};
use std::ffi::{c_char, CStr};

use super::with_error::with_error_reference;

/// Free NamesBuilder instance
#[no_mangle]
extern "C" fn names_builder_drop(names_builder: *mut NamesBuilder<usize>) {
  let _ = unsafe { Box::from_raw(names_builder) };
}

/// Create a new NamesBuilder instance
#[no_mangle]
extern "C" fn names_builder_new() -> *mut NamesBuilder<usize> {
  let names_builder = NamesBuilder::new();
  let names_builder = Box::new(names_builder);
  Box::into_raw(names_builder)
}

/// add a sentence to a key
#[no_mangle]
extern "C" fn names_builder_add(
  names_builder: *mut NamesBuilder<usize>,
  key: usize,
  values: *const Vec<String>,
) {
  let names_builder = unsafe { &mut *names_builder };
  let values = unsafe { &*values };

  names_builder.add(key, values);
}

/// add a sentence to a key
#[no_mangle]
extern "C" fn names_builder_set_default_name(
  names_builder: *mut NamesBuilder<usize>,
  value: *const c_char,
  error_reference: *mut usize,
) {
  with_error_reference(error_reference, || {
    let names_builder = unsafe { &mut *names_builder };
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_str()?;

    names_builder.set_default_name(value);

    Ok(())
  })
  .unwrap_or_default()
}

/// create a names struct from the builder
#[no_mangle]
extern "C" fn names_builder_build(names_builder: *mut NamesBuilder<usize>) -> *mut Names<usize> {
  let names_builder = unsafe { &mut *names_builder };

  let names = names_builder.build();
  let names = Box::new(names);
  Box::into_raw(names)
}
