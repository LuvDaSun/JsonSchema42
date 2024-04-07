use super::executor::wake;
use crate::utils::key::Key;
use once_cell::sync::Lazy;
use std::{collections::BTreeMap, sync::Mutex};

type Callbacks = Lazy<Mutex<BTreeMap<Key, Box<dyn FnOnce(*mut u8) + Send>>>>;
static CALLBACKS: Callbacks = Lazy::new(Default::default);

pub fn register_callback(callback: impl FnOnce(*mut u8) + Send + 'static) -> Key {
  let key = Key::new();
  let mut callbacks = CALLBACKS.lock().unwrap();
  let callback = Box::new(callback);
  assert!(callbacks.insert(key, callback).is_none());
  key
}

#[no_mangle]
extern "C" fn invoke_callback(key: Key, result: *mut u8) {
  let mut callbacks = CALLBACKS.lock().unwrap();
  let callback = callbacks.remove(&key).unwrap();
  (callback)(result);
  wake();
}
