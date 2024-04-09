use crate::naming::{Names, Sentence};

/// Free Names instance
#[no_mangle]
extern "C" fn names_drop(names: *mut Names<usize>) {
  let _ = unsafe { Box::from_raw(names) };
}

#[no_mangle]
extern "C" fn names_to_get_name(names: *const Names<usize>, key: usize) -> *mut Sentence {
  let names = unsafe { &*names };

  let sentence = names.get_name(&key);
  let sentence = sentence.clone();
  let sentence = Box::new(sentence);

  Box::into_raw(sentence)
}
