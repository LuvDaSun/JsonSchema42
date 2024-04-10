use crate::naming::{Names, Sentence};

/// Free Names instance
#[no_mangle]
extern "C" fn names_drop(names: *mut Names<usize>) {
  let _ = unsafe { Box::from_raw(names) };
}

#[no_mangle]
extern "C" fn names_get_name(names: *const Names<usize>, key: usize) -> *const Sentence {
  let names = unsafe { &*names };

  names.get_name(&key)
}
