use crate::utils::key::Key;

pub fn invoke_callback(callback: Key) {
  unsafe { host_invoke_callback(callback) }
}

extern "C" {
  fn host_invoke_callback(callback: Key);
}
