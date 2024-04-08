use std::pin::Pin;

use futures::Future;

use crate::error::Error;

pub fn with_error_reference<T>(
  error_reference: *mut usize,
  task: impl FnOnce() -> Result<T, Error>,
) -> Option<T> {
  match (task)() {
    Ok(result) => Some(result),
    Err(error) => {
      let error_reference = unsafe { &mut *error_reference };
      *error_reference = error as usize;
      None
    }
  }
}
