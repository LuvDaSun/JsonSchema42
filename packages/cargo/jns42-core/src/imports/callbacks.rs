use crate::utils::key::Key;

pub fn invoke_callback(callback: Key, result: *mut u8) {
  unsafe { host_invoke_callback(callback, result) }
}

extern "C" {
  fn host_invoke_callback(callback: Key, result: *mut u8);
}
