use crate::utils::key::Key;
use futures::{channel::oneshot, executor::LocalPool, Future};
use manual_executor::ManualExecutor;
use once_cell::sync::Lazy;
use std::ffi::{c_char, CStr, CString};
use std::sync::Arc;
use std::{cell::RefCell, collections::BTreeMap, sync::Mutex};

#[no_mangle]
extern "C" fn reverse(value: *const c_char, result_output: *mut *mut c_char) {
  let value = unsafe { CStr::from_ptr(value) };
  let value = value.to_str().unwrap();

  let result: String = value.chars().rev().collect();

  let result = CString::new(result).unwrap();
  let result = result.into_raw();

  unsafe { *result_output = result };
}

type Callbacks = Lazy<Mutex<BTreeMap<Key, Box<dyn FnOnce(*mut u8) + Send>>>>;
static CALLBACKS: Callbacks = Lazy::new(Default::default);

#[no_mangle]
extern "C" fn invoke_callback(key: Key, result: *mut u8) {
  let mut callbacks = CALLBACKS.lock().unwrap();
  let callback = callbacks.remove(&key).unwrap();
  (callback)(result);
  MANUAL_EXECUTOR.wake_all();
  // EXECUTOR.with_borrow_mut(|pool| pool.run_until_stalled());
}

pub fn register_callback(callback: impl FnOnce(*mut u8) + Send + 'static) -> Key {
  let key = Key::new();
  let mut callbacks = CALLBACKS.lock().unwrap();
  let callback = Box::new(callback);
  assert!(callbacks.insert(key, callback).is_none());
  key
}

pub async fn fetch(location: &str) -> String {
  let (ready_sender, ready_receiver) = oneshot::channel();

  let callback_key = crate::ffi::register_callback(|data| {
    let data = unsafe { CString::from_raw(data as *mut c_char) };
    let data = data.to_str().unwrap();
    let data = data.to_owned();

    ready_sender.send(data).unwrap();
  });

  let location = CString::new(location.to_owned()).unwrap();
  let location = location.into_raw();

  unsafe {
    crate::ffi::host_fetch(location, callback_key);
  }

  ready_receiver.await.unwrap()
}

extern "C" {
  pub fn host_fetch(location: *mut c_char, callback: Key);
  pub fn host_invoke_callback(callback: Key, result: *mut u8);
}

pub fn spawn(task: impl Future<Output = ()> + 'static + Send) {
  MANUAL_EXECUTOR.spawn_wake(task);
  // EXECUTOR.with_borrow_mut(|pool| {
  //   let spawner = pool.spawner();
  //   spawner.spawn_local(task).unwrap();
  //   pool.run_until_stalled()
  // });
}

thread_local! {
  pub static EXECUTOR: RefCell<LocalPool> = RefCell::new(LocalPool::new());
}

pub static MANUAL_EXECUTOR: Lazy<Arc<ManualExecutor>> = Lazy::new(ManualExecutor::new);
