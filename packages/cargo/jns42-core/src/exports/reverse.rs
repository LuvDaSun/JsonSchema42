use super::with_error::with_error_reference;
use std::ffi::{c_char, CStr, CString};

#[no_mangle]
extern "C" fn reverse(
  value: *const c_char,
  result_output: *mut *mut c_char,
  error_reference: *mut usize,
) {
  with_error_reference(error_reference, || {
    let value = unsafe { CStr::from_ptr(value) };
    let value = value.to_str()?;

    let result: String = value.chars().rev().collect();

    let result = CString::new(result)?;
    let result = result.into_raw();

    unsafe { *result_output = result };

    Ok(())
  })
  .unwrap_or_default()
}
