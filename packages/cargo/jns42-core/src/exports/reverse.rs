use std::ffi::{c_char, CStr, CString};

#[no_mangle]
extern "C" fn reverse(value: *const c_char, result_output: *mut *mut c_char) {
  let value = unsafe { CStr::from_ptr(value) };
  let value = value.to_str().unwrap();

  let result: String = value.chars().rev().collect();

  let result = CString::new(result).unwrap();
  let result = result.into_raw();

  unsafe { *result_output = result };
}
