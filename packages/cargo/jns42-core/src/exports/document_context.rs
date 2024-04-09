use super::with_error::{with_error_reference, with_error_reference_future};
use crate::{documents::DocumentContext, executor::spawn_and_callback, utils::key::Key};
use std::{
  ffi::{c_char, CStr, CString},
  ptr::null_mut,
  rc::Rc,
};

#[no_mangle]
extern "C" fn document_context_drop(document_context: *mut Rc<DocumentContext>) {
  let _ = unsafe { Box::from_raw(document_context) };
}

#[no_mangle]
extern "C" fn document_context_new() -> *mut Rc<DocumentContext> {
  let document_context = DocumentContext::new_hosted();
  let document_context = Box::new(document_context);
  Box::into_raw(document_context)
}

#[no_mangle]
extern "C" fn document_context_register_well_known_factories(
  document_context: *mut Rc<DocumentContext>,
  error_reference: *mut usize,
) {
  with_error_reference(error_reference, || {
    let document_context = unsafe { &mut *document_context };
    document_context.register_well_known_factories()?;
    Ok(())
  })
  .unwrap_or_default()
}

#[no_mangle]
extern "C" fn document_context_load_from_location(
  document_context: *const Rc<DocumentContext>,
  retrieval_location: *const c_char,
  given_location: *const c_char,
  antecedent_location: *const c_char,
  default_meta_schema_id: *const c_char,
  error_reference: *mut usize,
  callback: Key,
) {
  spawn_and_callback(callback, async move {
    with_error_reference_future(error_reference, || async move {
      let document_context = unsafe { &*document_context };

      let retrieval_location = unsafe { CStr::from_ptr(retrieval_location) };
      let retrieval_location = retrieval_location.to_str()?;
      let retrieval_location = retrieval_location.parse()?;

      let given_location = unsafe { CStr::from_ptr(given_location) };
      let given_location = given_location.to_str()?;
      let given_location = given_location.parse()?;

      let antecedent_location = if antecedent_location.is_null() {
        None
      } else {
        let antecedent_location = unsafe { CStr::from_ptr(antecedent_location) };
        let antecedent_location = antecedent_location.to_str()?;
        let antecedent_location = antecedent_location.parse()?;
        Some(antecedent_location)
      };

      let default_meta_schema_id = unsafe { CStr::from_ptr(default_meta_schema_id) };
      let default_meta_schema_id = default_meta_schema_id.to_str()?;

      document_context
        .load_from_location(
          &retrieval_location,
          &given_location,
          antecedent_location.as_ref(),
          default_meta_schema_id,
        )
        .await?;

      Ok(())
    })
    .await;
  });
}

#[no_mangle]
extern "C" fn document_context_load_from_node(
  document_context: *const Rc<DocumentContext>,
  retrieval_location: *const c_char,
  given_location: *const c_char,
  antecedent_location: *const c_char,
  node: *const c_char,
  default_meta_schema_id: *const c_char,
  error_reference: *mut usize,
  callback: Key,
) {
  spawn_and_callback(callback, async move {
    with_error_reference_future(error_reference, || async move {
      let document_context = unsafe { &*document_context };

      let retrieval_location = unsafe { CStr::from_ptr(retrieval_location) };
      let retrieval_location = retrieval_location.to_str()?;
      let retrieval_location = retrieval_location.parse()?;

      let given_location = unsafe { CStr::from_ptr(given_location) };
      let given_location = given_location.to_str()?;
      let given_location = given_location.parse()?;

      let antecedent_location = if antecedent_location.is_null() {
        None
      } else {
        let antecedent_location = unsafe { CStr::from_ptr(antecedent_location) };
        let antecedent_location = antecedent_location.to_str()?;
        let antecedent_location = antecedent_location.parse()?;
        Some(antecedent_location)
      };

      let node = unsafe { CStr::from_ptr(node) };
      let node = node.to_str()?;
      let node = serde_json::from_str(node)?;

      let default_meta_schema_id = unsafe { CStr::from_ptr(default_meta_schema_id) };
      let default_meta_schema_id = default_meta_schema_id.to_str()?;

      document_context
        .load_from_node(
          &retrieval_location,
          &given_location,
          antecedent_location.as_ref(),
          node,
          default_meta_schema_id,
        )
        .await?;

      Ok(())
    })
    .await;
  });
}

#[no_mangle]
extern "C" fn document_context_get_intermediate_document(
  document_context: *const Rc<DocumentContext>,
  error_reference: *mut usize,
) -> *mut c_char {
  with_error_reference(error_reference, || {
    let document_context = unsafe { &*document_context };
    let intermediate_document = document_context.get_intermediate_document();
    let intermediate_document = serde_json::to_string(&intermediate_document)?;
    let intermediate_document = CString::new(intermediate_document)?;

    Ok(intermediate_document.into_raw())
  })
  .unwrap_or_else(null_mut)
}
