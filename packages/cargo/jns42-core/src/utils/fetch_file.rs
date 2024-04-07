use crate::callbacks::register_callback;
use futures::channel::oneshot;
use std::{
  error::Error,
  ffi::{c_char, CString},
  ptr::null_mut,
};
use tokio::{fs::File, io::AsyncReadExt};

pub async fn host_fetch_file(location: &str) -> Result<String, Box<dyn Error>> {
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
  ready_receiver.await?;

  let data = unsafe { Box::from_raw(data) };
  let data = *data;
  let data = unsafe { CString::from_raw(data) };
  let data = data.to_str().unwrap();
  let data = data.to_owned();

  Ok(data)
}

pub async fn local_fetch_file(location: &str) -> Result<String, Box<dyn Error>> {
  if location.starts_with("http://") || location.starts_with("https://") {
    let response = reqwest::get(location).await?.error_for_status()?;
    let data = response.text().await?;
    Ok(data)
  } else {
    let mut file = File::open(location).await?;
    let metadata = file.metadata().await?;
    let mut data = String::with_capacity(metadata.len() as usize);
    file.read_to_string(&mut data).await?;
    Ok(data)
  }
}
