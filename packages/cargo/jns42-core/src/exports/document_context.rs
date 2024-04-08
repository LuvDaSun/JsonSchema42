use crate::{
  documents::{DocumentContext, MetaSchemaId},
  executor::spawn_and_callback,
  utils::key::Key,
};
use std::{
  ffi::{c_char, CStr, CString},
  rc::Rc,
};

#[no_mangle]
extern "C" fn document_context_drop(document_context: *mut Rc<DocumentContext>) {
  let _ = unsafe { Box::from_raw(document_context) };
}

#[no_mangle]
extern "C" fn document_context_new() -> *mut Rc<DocumentContext> {
  let document_context = DocumentContext::new();
  let document_context = Box::new(document_context);
  Box::into_raw(document_context)
}

#[no_mangle]
extern "C" fn document_context_register_well_known_factories(
  document_context: *mut Rc<DocumentContext>,
) {
  let document_context = unsafe { &mut *document_context };
  document_context.register_well_known_factories();
}

#[no_mangle]
extern "C" fn document_context_load_from_location(
  document_context: *const Rc<DocumentContext>,
  retrieval_location: *const c_char,
  given_location: *const c_char,
  antecedent_location: *const c_char,
  default_schema_id: MetaSchemaId,
  callback: Key,
) {
  spawn_and_callback(callback, async move {
    let document_context = unsafe { &*document_context };

    let retrieval_location = unsafe { CStr::from_ptr(retrieval_location) };
    let retrieval_location = retrieval_location.to_str().unwrap();
    let retrieval_location = retrieval_location.parse().unwrap();

    let given_location = unsafe { CStr::from_ptr(given_location) };
    let given_location = given_location.to_str().unwrap();
    let given_location = given_location.parse().unwrap();

    let antecedent_location = if antecedent_location.is_null() {
      None
    } else {
      let antecedent_location = unsafe { CStr::from_ptr(antecedent_location) };
      let antecedent_location = antecedent_location.to_str().unwrap();
      let antecedent_location = antecedent_location.parse().unwrap();
      Some(antecedent_location)
    };

    document_context
      .load_from_location(
        &retrieval_location,
        &given_location,
        antecedent_location.as_ref(),
        &default_schema_id,
      )
      .await;
  });
}

#[no_mangle]
extern "C" fn document_context_get_intermediate_document(
  document_context: *const Rc<DocumentContext>,
) -> *mut c_char {
  let document_context = unsafe { &*document_context };
  let intermediate_document = document_context.get_intermediate_document();
  let intermediate_document = serde_json::to_string(&intermediate_document).unwrap();
  let intermediate_document = CString::new(intermediate_document).unwrap();

  intermediate_document.into_raw()
}
