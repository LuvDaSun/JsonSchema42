use std::ffi::{c_char, CString};

#[no_mangle]
extern "C" fn vec_string_new(capacity: usize) -> *mut Vec<String> {
  let vec = Vec::with_capacity(capacity);
  let vec = Box::new(vec);

  Box::into_raw(vec)
}

#[no_mangle]
extern "C" fn vec_string_drop(vec: *mut Vec<String>) {
  let _ = unsafe { Box::from_raw(vec) };
}

#[no_mangle]
extern "C" fn vec_string_len(vec: *const Vec<String>) -> usize {
  let vec = unsafe { &*vec };

  vec.len()
}

#[no_mangle]
extern "C" fn vec_string_get(vec: *const Vec<String>, index: usize) -> *const c_char {
  let vec = unsafe { &*vec };

  let value = vec.get(index).unwrap();
  let value = CString::new(value.clone()).unwrap();

  value.into_raw()
}

#[no_mangle]
extern "C" fn vec_string_push(vec: *mut Vec<String>, value: *mut c_char) {
  let vec = unsafe { &mut *vec };
  let value = unsafe { CString::from_raw(value) };
  let value = value.to_str().unwrap();
  let value = value.to_owned();

  vec.push(value);
}
