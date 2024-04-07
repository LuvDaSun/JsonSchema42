pub struct DocumentContext {
  //
}

impl DocumentContext {
  pub fn new() -> Self {
    Self {}
  }

  pub async fn load(&mut self, location: &str) -> String {
    crate::ffi::fetch(location).await
  }
}

mod ffi {
  use std::ffi::{c_char, CStr, CString};

  use super::*;
  use crate::{ffi::spawn, utils::key::Key};

  #[no_mangle]
  extern "C" fn document_context_drop(document_context: *mut DocumentContext) {
    assert!(!document_context.is_null());

    drop(unsafe { Box::from_raw(document_context) });
  }

  #[no_mangle]
  extern "C" fn document_context_new() -> *mut DocumentContext {
    let document_context = DocumentContext::new();
    let document_context = Box::new(document_context);

    Box::into_raw(document_context)
  }

  #[no_mangle]
  extern "C" fn document_context_load(
    document_context: *mut DocumentContext,
    location: *const c_char,
    callback: Key,
  ) {
    assert!(!document_context.is_null());
    assert!(!location.is_null());

    let location = unsafe { CStr::from_ptr(location) };
    let document_context = unsafe { &mut *document_context };

    let task = async move {
      let location = location.to_string_lossy();
      let location = location.as_ref();

      let data = document_context.load(location).await;
      let data = CString::new(data).unwrap();
      let data = data.into_raw();
      let data = data as *mut u8;

      unsafe {
        crate::ffi::host_invoke_callback(callback, data);
      }
    };

    spawn(task);
  }
}
