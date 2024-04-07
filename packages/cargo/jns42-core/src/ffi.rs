use crate::utils::key::Key;
use futures::{channel::oneshot, executor::LocalPool, Future};
use manual_executor::ManualExecutor;
use once_cell::sync::Lazy;
use std::sync::Arc;
use std::{cell::RefCell, collections::BTreeMap, sync::Mutex};

#[no_mangle]
extern "C" fn reverse(value: *const SizedString, result_output: *mut *const SizedString) {
  let value = unsafe { &*value };
  let value = value.as_ref();

  let result: String = value.chars().rev().collect();

  let result = SizedString::new(result);
  let result = Box::new(result);

  unsafe { *result_output = Box::into_raw(result) };
}

#[repr(C)]
pub struct SizedString {
  data: *mut u8,
  size: usize,
}

impl SizedString {
  pub fn new(value: String) -> Self {
    let bytes = value.into_bytes();
    let data = bytes.into_boxed_slice();
    let size = data.len();
    let data = Box::into_raw(data) as *mut u8;

    Self { data, size }
  }
}

impl Drop for SizedString {
  fn drop(&mut self) {
    dealloc(self.data, self.size)
  }
}

impl From<SizedString> for String {
  fn from(value: SizedString) -> Self {
    value.as_ref().to_string()
  }
}

impl From<&SizedString> for String {
  fn from(value: &SizedString) -> Self {
    value.as_ref().to_string()
  }
}

impl AsRef<str> for SizedString {
  fn as_ref(&self) -> &str {
    unsafe {
      let slice = std::slice::from_raw_parts(self.data, self.size);
      std::str::from_utf8_unchecked(slice)
    }
  }
}

const ALIGN: usize = std::mem::align_of::<usize>();

#[no_mangle]
extern "C" fn alloc(size: usize) -> *const u8 {
  if size == 0 {
    return std::ptr::null();
  }

  let Ok(layout) = std::alloc::Layout::from_size_align(size, ALIGN) else {
    panic!("could not get layout")
  };

  let pointer = unsafe { std::alloc::alloc(layout) };
  if pointer.is_null() {
    panic!("could not get pointer")
  }

  pointer
}

// #[no_mangle]
// extern "C" fn realloc(pointer: *mut u8, size_previous: usize, size: usize) -> *const u8 {
//   debug_assert!(size_previous > 0);
//   debug_assert!(size > 0);

//   let Ok(layout) = std::alloc::Layout::from_size_align(size_previous, ALIGN) else {
//     panic!("could not get layout")
//   };

//   let pointer = unsafe { std::alloc::realloc(pointer, layout, size) };
//   if pointer.is_null() {
//     panic!("pointer is null")
//   }

//   pointer
// }

#[no_mangle]
extern "C" fn dealloc(pointer: *mut u8, size: usize) {
  if size == 0 {
    return;
  }

  if pointer.is_null() {
    return;
  }

  let Ok(layout) = std::alloc::Layout::from_size_align(size, ALIGN) else {
    panic!("could not get layout")
  };

  unsafe { std::alloc::dealloc(pointer, layout) };
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
    let data = data as *mut SizedString;
    let data: Box<SizedString> = unsafe { Box::from_raw(data) };
    let data: String = (*data).into();

    ready_sender.send(data).unwrap();
  });

  let location = SizedString::new(location.to_owned());
  let location = Box::new(location);
  let location = Box::into_raw(location);

  unsafe {
    crate::ffi::host_fetch(location, callback_key);
  }

  ready_receiver.await.unwrap()
}

extern "C" {
  pub fn host_fetch(argument: *const SizedString, callback: Key);
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
