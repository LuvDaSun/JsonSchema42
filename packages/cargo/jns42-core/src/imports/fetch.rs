use crate::{exports::callbacks::register_callback, utils::key::Key};
use futures::channel::oneshot;
use std::ffi::{c_char, CString};

pub async fn fetch(location: &str) -> String {
  let (ready_sender, ready_receiver) = oneshot::channel();

  let callback_key = register_callback(|data| {
    let data = unsafe { CString::from_raw(data as *mut c_char) };
    let data = data.to_str().unwrap();
    let data = data.to_owned();

    ready_sender.send(data).unwrap();
  });

  let location = CString::new(location.to_owned()).unwrap();
  let location = location.into_raw();

  unsafe {
    host_fetch(location, callback_key);
  }

  ready_receiver.await.unwrap()
}

extern "C" {
  fn host_fetch(location: *mut c_char, callback: Key);
}
