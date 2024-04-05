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
  use futures::{executor::LocalPool, task::LocalSpawnExt};

  use super::*;
  use crate::ffi::SizedString;

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
        let callback_key = {
          let callback = |pointer: *mut u8| {
            let content = pointer as *mut SizedString;
            let content = unsafe { &*content };
            let content: String = content.into();
            ready_sender.send(content).unwrap();
          };
          crate::ffi::register_callback(callback)
        };

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
    location: *mut SizedString,
  ) {
    assert!(!document_context.is_null());
    assert!(!location.is_null());

    let document_context = unsafe { &mut *document_context };

    let location = unsafe { &*location };
    let location = location.as_ref();

    let mut pool = LocalPool::new();
    let spawner = pool.spawner();
    let future = async {
      let result = document_context.load(location).await;
      let result = SizedString::new(result);
      let result = Box::new(result);
      let result = Box::into_raw(result) as *mut u8;

      unsafe {
        crate::ffi::invoke_host_callback(0, result);
      }
    };
    spawner.spawn_local(future).unwrap();
    pool.run_until_stalled();
  }
}
