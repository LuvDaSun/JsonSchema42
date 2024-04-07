use futures::channel::oneshot;
use std::{future::Future, pin::Pin};

pub type Fetch =
  Box<dyn Fn(&str) -> Pin<Box<dyn Future<Output = String> + '_ + Send>> + 'static + Sync>;

pub struct DocumentContext {
  fetch: Fetch,
}

impl DocumentContext {
  pub fn new(fetch: Fetch) -> Self {
    Self { fetch }
  }

  pub async fn load(&self, location: &str) -> String {
    (self.fetch)(location).await
  }
}

mod ffi {
  use super::*;
  use crate::{
    ffi::{SizedString, MANUAL_EXECUTOR},
    utils::key::Key,
  };

  #[no_mangle]
  extern "C" fn document_context_drop(document_context: *mut DocumentContext) {
    assert!(!document_context.is_null());

    drop(unsafe { Box::from_raw(document_context) });
  }

  #[no_mangle]
  extern "C" fn document_context_new() -> *mut DocumentContext {
    let fetch: Fetch = Box::new(|location: &str| {
      Box::pin(async {
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
          crate::ffi::fetch(location, callback_key);
        }

        ready_receiver.await.unwrap()
      })
    });

    let document_context = DocumentContext::new(fetch);
    let document_context = Box::new(document_context);

    Box::into_raw(document_context)
  }

  #[no_mangle]
  extern "C" fn document_context_load(
    document_context: *mut DocumentContext,
    location: *const SizedString,
    callback: Key,
  ) {
    assert!(!document_context.is_null());
    assert!(!location.is_null());

    let document_context = unsafe { &*document_context };

    let location = unsafe { &*location };
    let location = location.as_ref();

    let task = async move {
      let data = document_context.load(location).await;
      let data = SizedString::new(data);
      let data = Box::new(data);
      let data = Box::into_raw(data);
      let data = data as *mut u8;

      unsafe {
        crate::ffi::invoke_host_callback(callback, data);
      }
    };

    MANUAL_EXECUTOR.spawn_wake(task);
  }
}
