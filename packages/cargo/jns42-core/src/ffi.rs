use crate::utils::names::{Names, NamesBuilder};

/// Create a new NamesBuilder instance
#[no_mangle]
pub extern "C" fn names_builder_new() -> *mut NamesBuilder<usize> {
  let names_builder = NamesBuilder::new();
  let names_builder = Box::new(names_builder);
  Box::into_raw(names_builder)
}

/// # Safety
/// Please only pass pointers to NamesBuilder instances!
/// and pass valid cstr pointers
#[no_mangle]
pub extern "C" fn names_builder_add(
  names_builder: *mut NamesBuilder<usize>,
  key: usize,
  value: *const PascalString,
) {
  assert!(!names_builder.is_null());
  assert!(!value.is_null());

  let names_builder = unsafe { &mut *names_builder };
  let value = unsafe { &*value };
  let value = value.as_str();

  names_builder.add(key, value);
}

/// # Safety
/// Please only pass pointers to NamesBuilder instances!
/// and pass valid cstr pointers
#[no_mangle]
pub extern "C" fn names_builder_build(
  names_builder: *mut NamesBuilder<usize>,
  maximum_iterations: usize,
) -> *mut Names<usize> {
  let names_builder = unsafe {
    assert!(!names_builder.is_null());
    &mut *names_builder
  };

  let names = names_builder.build(maximum_iterations);
  let names = Box::new(names);
  Box::into_raw(names)
}

#[no_mangle]
pub extern "C" fn names_to_camel_case(names: *mut Names<usize>, key: usize) -> *const PascalString {
  assert!(!names.is_null());
  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_camel_case();
  let result = PascalString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

#[no_mangle]
pub extern "C" fn names_to_pascal_case(
  names: *mut Names<usize>,
  key: usize,
) -> *const PascalString {
  assert!(!names.is_null());
  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_pascal_case();
  let result = PascalString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

#[no_mangle]
pub extern "C" fn names_to_snake_case(names: *mut Names<usize>, key: usize) -> *const PascalString {
  assert!(!names.is_null());
  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_snake_case();
  let result = PascalString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

#[no_mangle]
pub extern "C" fn names_to_screaming_snake_case(
  names: *mut Names<usize>,
  key: usize,
) -> *const PascalString {
  assert!(!names.is_null());
  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_screaming_snake_case();
  let result = PascalString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// Free NamesBuilder instance
///
/// # Safety
/// Please only pass pointers to NamesBuilder instances!
#[no_mangle]
pub extern "C" fn names_builder_free(names_builder: *mut NamesBuilder<usize>) {
  if names_builder.is_null() {
    return;
  }
  unsafe {
    let _ = Box::from_raw(names_builder);
  }
}

/// Free Names instance
///
/// # Safety
/// Please only pass pointers to Names instances!
#[no_mangle]
pub extern "C" fn names_free(names: *mut Names<usize>) {
  if names.is_null() {
    return;
  }
  unsafe {
    let _ = Box::from_raw(names);
  }
}

#[no_mangle]
extern "C" fn reverse(value: *const PascalString, result_out: *mut Out<PascalString>) {
  let value = unsafe { &*value };
  let value = value.as_str();

  let result: String = value.chars().rev().collect();

  let result = PascalString::new(result);
  let result = Box::new(result);

  let result_out = unsafe { &mut *result_out };
  result_out.set(Box::into_raw(result));
}

//#region data

#[repr(C)]
pub struct PascalString {
  size: usize,
  data: *const u8,
}

impl PascalString {
  pub fn new(value: String) -> Self {
    let bytes = value.into_bytes();
    let data = bytes.into_boxed_slice();
    let size = data.len();
    let data = Box::into_raw(data) as *const u8;

    Self { size, data }
  }

  pub fn as_str(&self) -> &str {
    unsafe {
      let slice = std::slice::from_raw_parts(self.data, self.size);
      std::str::from_utf8_unchecked(slice)
    }
  }
}

#[repr(C)]
pub struct Out<T>(*const T);

impl<T> Out<T> {
  pub fn set(&mut self, value: *const T) {
    debug_assert!(self.0.is_null());
    self.0 = value;
  }
}

//#endregion

//#region memory

const ALIGN: usize = std::mem::align_of::<usize>();

#[no_mangle]
extern "C" fn alloc(size: usize) -> *const u8 {
  debug_assert!(size > 0);

  let Ok(layout) = std::alloc::Layout::from_size_align(size, ALIGN) else {
    panic!("could not get layout")
  };

  let pointer = unsafe { std::alloc::alloc(layout) };
  if pointer.is_null() {
    panic!("pointer is null")
  }

  pointer
}

#[no_mangle]
extern "C" fn dealloc(pointer: *mut u8, size: usize) {
  debug_assert!(size > 0);

  let Ok(layout) = std::alloc::Layout::from_size_align(size, ALIGN) else {
    panic!("could not get layout")
  };

  unsafe { std::alloc::dealloc(pointer, layout) };
}

//#endregion
