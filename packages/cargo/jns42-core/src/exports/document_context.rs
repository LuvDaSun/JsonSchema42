use crate::{
  document::document_context::DocumentContext, executor::spawn,
  imports::callbacks::invoke_callback, utils::key::Key,
};
use std::ffi::{c_char, CStr, CString};

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
  data_reference: *mut *mut c_char,
  callback: Key,
) {
  assert!(!document_context.is_null());
  assert!(!location.is_null());

  let location = unsafe { CStr::from_ptr(location) };
  let document_context = unsafe { &mut *document_context };

  let task = async move {
    let location = location.to_str().unwrap();

    let data = document_context.load(location).await;
    let data = CString::new(data).unwrap();
    let data = data.into_raw();

    unsafe {
      *data_reference = data;
    }

    invoke_callback(callback);
  };

  spawn(task);
}
