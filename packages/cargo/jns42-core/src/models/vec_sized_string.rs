use crate::ffi::SizedString;

#[no_mangle]
extern "C" fn vec_sized_string_new(capacity: usize) -> *const Vec<SizedString> {
  let vec = Vec::with_capacity(capacity);
  let vec = Box::new(vec);

  Box::into_raw(vec)
}

#[no_mangle]
extern "C" fn vec_sized_string_drop(vec: *mut Vec<SizedString>) {
  assert!(!vec.is_null());

  drop(unsafe { Box::from_raw(vec) });
}

#[no_mangle]
extern "C" fn vec_sized_string_len(vec: *const Vec<SizedString>) -> usize {
  assert!(!vec.is_null());

  let vec = unsafe { &*vec };

  vec.len()
}

#[no_mangle]
extern "C" fn vec_sized_string_get(
  vec: *const Vec<SizedString>,
  index: usize,
) -> *const SizedString {
  assert!(!vec.is_null());

  let vec = unsafe { &*vec };

  vec.get(index).unwrap()
}

#[no_mangle]
extern "C" fn vec_sized_string_push(vec: *mut Vec<SizedString>, value: *mut SizedString) {
  assert!(!vec.is_null());
  assert!(!value.is_null());

  let vec = unsafe { &mut *vec };
  let value = unsafe { Box::from_raw(value) };

  vec.push(*value);
}
