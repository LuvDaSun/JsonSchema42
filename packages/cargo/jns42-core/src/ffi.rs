use crate::naming::{Names, NamesBuilder, Sentence};

/// Create a new NamesBuilder instance
#[no_mangle]
pub extern "C" fn names_builder_new() -> *mut NamesBuilder<usize> {
  let names_builder = NamesBuilder::new();
  let names_builder = Box::new(names_builder);
  Box::into_raw(names_builder)
}

/// add a sentence to a key
#[no_mangle]
pub extern "C" fn names_builder_add(
  names_builder: *mut NamesBuilder<usize>,
  key: usize,
  value: *const SizedString,
) {
  assert!(!names_builder.is_null());
  assert!(!value.is_null());

  let names_builder = unsafe { &mut *names_builder };
  let value = unsafe { &*value };
  let value = value.as_str();

  names_builder.add(key, value);
}

/// add a sentence to a key
#[no_mangle]
pub extern "C" fn names_builder_set_default_name(
  names_builder: *mut NamesBuilder<usize>,
  value: *const SizedString,
) {
  assert!(!value.is_null());

  let names_builder = unsafe { &mut *names_builder };
  let value = unsafe { &*value };
  let value = value.as_str();

  names_builder.set_default_name(value);
}

/// create a names struct from the builder
#[no_mangle]
pub extern "C" fn names_builder_build(
  names_builder: *mut NamesBuilder<usize>,
) -> *mut Names<usize> {
  assert!(!names_builder.is_null());

  let names_builder = unsafe { &mut *names_builder };

  let names = names_builder.build();
  let names = Box::new(names);
  Box::into_raw(names)
}

/// get the name as camelCase
#[no_mangle]
pub extern "C" fn names_to_camel_case(names: *mut Names<usize>, key: usize) -> *const SizedString {
  assert!(!names.is_null());

  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_camel_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// get the name as PascalCase
#[no_mangle]
pub extern "C" fn names_to_pascal_case(names: *mut Names<usize>, key: usize) -> *const SizedString {
  assert!(!names.is_null());

  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();

  let result = sentence.to_pascal_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// get the name as snake_case
#[no_mangle]
pub extern "C" fn names_to_snake_case(names: *mut Names<usize>, key: usize) -> *const SizedString {
  assert!(!names.is_null());

  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();

  let result = sentence.to_snake_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// get the name as SCREAMING_SNAKE_CASE
#[no_mangle]
pub extern "C" fn names_to_screaming_snake_case(
  names: *mut Names<usize>,
  key: usize,
) -> *const SizedString {
  assert!(!names.is_null());

  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();

  let result = sentence.to_screaming_snake_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// Free NamesBuilder instance
#[no_mangle]
pub extern "C" fn names_builder_free(names_builder: *mut NamesBuilder<usize>) {
  assert!(!names_builder.is_null());

  unsafe {
    let _ = Box::from_raw(names_builder);
  }
}

/// Free Names instance
#[no_mangle]
pub extern "C" fn names_free(names: *mut Names<usize>) {
  assert!(!names.is_null());

  unsafe {
    let _ = Box::from_raw(names);
  }
}

#[no_mangle]
extern "C" fn reverse(value: *const SizedString, result_out: *mut Out<SizedString>) {
  let value = unsafe { &*value };
  let value = value.as_str();

  let result: String = value.chars().rev().collect();

  let result = SizedString::new(result);
  let result = Box::new(result);

  let result_out = unsafe { &mut *result_out };
  result_out.set(Box::into_raw(result));
}

/// get the name as camelCase
#[no_mangle]
pub extern "C" fn to_camel_case(value: *const SizedString) -> *const SizedString {
  assert!(!value.is_null());

  let value = unsafe { &*value };
  let value = value.as_str();

  let sentence = Sentence::new(value);
  let result = sentence.to_camel_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// get the name as PascalCase
#[no_mangle]
pub extern "C" fn to_pascal_case(value: *const SizedString) -> *const SizedString {
  assert!(!value.is_null());

  let value = unsafe { &*value };
  let value = value.as_str();

  let sentence = Sentence::new(value);

  let result = sentence.to_pascal_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// get the name as snake_case
#[no_mangle]
pub extern "C" fn to_snake_case(value: *const SizedString) -> *const SizedString {
  assert!(!value.is_null());

  let value = unsafe { &*value };
  let value = value.as_str();

  let sentence = Sentence::new(value);

  let result = sentence.to_snake_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// get the name as SCREAMING_SNAKE_CASE
#[no_mangle]
pub extern "C" fn to_screaming_snake_case(value: *const SizedString) -> *const SizedString {
  assert!(!value.is_null());

  let value = unsafe { &*value };
  let value = value.as_str();

  let sentence = Sentence::new(value);

  let result = sentence.to_screaming_snake_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

//#region data

#[repr(C)]
pub struct SizedString {
  data: *const u8,
  size: usize,
}

impl SizedString {
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
  if size == 0 {
    return std::ptr::null();
  }

  let Ok(layout) = std::alloc::Layout::from_size_align(size, ALIGN) else {
    panic!("could not get layout")
  };

  let pointer = unsafe { std::alloc::alloc(layout) };
  if pointer.is_null() {
    panic!("could not get pointer")
  }

  pointer
}

#[no_mangle]
extern "C" fn dealloc(pointer: *mut u8, size: usize) {
  if size == 0 {
    return;
  }

  if pointer.is_null() {
    return;
  }

  let Ok(layout) = std::alloc::Layout::from_size_align(size, ALIGN) else {
    panic!("could not get layout")
  };

  unsafe { std::alloc::dealloc(pointer, layout) };
}

//#endregion
