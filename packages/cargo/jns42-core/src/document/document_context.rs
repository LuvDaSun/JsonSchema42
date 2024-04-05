use std::future::Future;
pub type Fetch = Box<dyn Fn(&str) -> Box<dyn Future<Output = String> + '_> + 'static>;

pub struct DocumentContext {
  fetch: Fetch,
}

impl DocumentContext {
  pub fn new(fetch: Fetch) -> Self {
    Self { fetch }
  }
}

mod ffi {
  use super::*;
  use crate::{
    ffi::{register_callback, SizedString},
    utils::key::Key,
  };
  use std::sync::{Arc, Mutex};

  #[no_mangle]
  extern "C" fn document_context_drop(document_context: *mut DocumentContext) {
    assert!(!document_context.is_null());

    drop(unsafe { Box::from_raw(document_context) });
  }

  #[no_mangle]
  extern "C" fn document_context_new() -> *mut DocumentContext {
    let fetch: Fetch = Box::new(|location: &str| {
      Box::new(async {
        let ready = Arc::new(Mutex::new(false));
        let key = Key::new();
        {
          let ready = ready.clone();
          let callback = move |_pointer: *mut u8| {
            let mut ready = ready.lock().unwrap();
            *ready = true;
          };
          register_callback(key, callback);
        }

        let location = SizedString::new(location.to_owned());
        let location = Box::new(location);
        let location = Box::into_raw(location);

        unsafe {
          crate::ffi::fetch(location, key);
        }

        String::new()
      })
    });

    let document_context = DocumentContext::new(fetch);
    let document_context = Box::new(document_context);

    Box::into_raw(document_context)
  }
}
