use crate::callbacks::register_callback;
use futures::channel::oneshot;
use std::{
  ffi::{c_char, CString},
  ptr::null_mut,
};

pub async fn fetch_file(location: &str) -> String {
  let location = CString::new(location.to_owned()).unwrap();
  let location = location.into_raw();

  let data = Box::new(null_mut() as *mut c_char);
  let data = Box::into_raw(data);

  let (ready_sender, ready_receiver) = oneshot::channel();
  let callback_key = register_callback(|| {
    ready_sender.send(()).unwrap();
  });
  unsafe {
    crate::imports::host_fetch_file(location, data, callback_key);
  }
  ready_receiver.await.unwrap();

  let data = unsafe { Box::from_raw(data) };
  let data = *data;
  let data = unsafe { CString::from_raw(data) };
  let data = data.to_str().unwrap();

  data.to_owned()
}
