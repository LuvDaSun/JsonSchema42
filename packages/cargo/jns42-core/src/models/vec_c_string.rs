use std::ffi::{c_char, CString};

#[no_mangle]
extern "C" fn vec_c_string_new(capacity: usize) -> *mut Vec<CString> {
  let vec = Vec::with_capacity(capacity);
  let vec = Box::new(vec);

  Box::into_raw(vec)
}

#[no_mangle]
extern "C" fn vec_c_string_drop(vec: *mut Vec<CString>) {
  assert!(!vec.is_null());

  let vec = unsafe { Box::from_raw(vec) };

  drop(vec);
}

#[no_mangle]
extern "C" fn vec_c_string_len(vec: *const Vec<CString>) -> usize {
  assert!(!vec.is_null());

  let vec = unsafe { &*vec };

  vec.len()
}

#[no_mangle]
extern "C" fn vec_c_string_get(vec: *const Vec<CString>, index: usize) -> *const c_char {
  assert!(!vec.is_null());

  let vec = unsafe { &*vec };

  vec.get(index).unwrap().as_ptr()
}

#[no_mangle]
extern "C" fn vec_c_string_push(vec: *mut Vec<CString>, value: *mut c_char) {
  assert!(!vec.is_null());
  assert!(!value.is_null());

  let vec = unsafe { &mut *vec };
  let value = unsafe { CString::from_raw(value) };

  vec.push(value);
}
