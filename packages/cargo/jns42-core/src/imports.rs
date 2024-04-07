use crate::utils::key::Key;
use std::ffi::c_char;

extern "C" {
  pub fn host_invoke_callback(callback: Key);
  pub fn host_fetch_file(location: *mut c_char, data: *mut *mut c_char, callback: Key);
}
