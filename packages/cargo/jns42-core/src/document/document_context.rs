#[derive(Debug, Default)]
pub struct DocumentContext {
  //
}

impl DocumentContext {
  pub fn new() -> Self {
    Default::default()
  }
}

mod ffi {
  use super::*;

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
}
