use super::Sentence;
use crate::ffi::SizedString;
use std::collections::BTreeMap;

pub struct Names<K>(BTreeMap<K, Sentence>);

impl<K> Names<K>
where
  K: PartialOrd + Ord,
{
  pub fn new(interior: BTreeMap<K, Sentence>) -> Self {
    Self(interior)
  }

  pub fn get_name(&self, key: &K) -> &Sentence {
    let sentence = self.0.get(key).unwrap();
    sentence
  }
}

impl<K> IntoIterator for Names<K> {
  type Item = (K, Sentence);
  type IntoIter = std::collections::btree_map::IntoIter<K, Sentence>;

  fn into_iter(self) -> Self::IntoIter {
    self.0.into_iter()
  }
}

/// get the name as camelCase
#[no_mangle]
extern "C" fn names_to_camel_case(names: *mut Names<usize>, key: usize) -> *const SizedString {
  assert!(!names.is_null());

  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();
  let result = sentence.to_camel_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// get the name as PascalCase
#[no_mangle]
extern "C" fn names_to_pascal_case(names: *mut Names<usize>, key: usize) -> *const SizedString {
  assert!(!names.is_null());

  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();

  let result = sentence.to_pascal_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// get the name as snake_case
#[no_mangle]
extern "C" fn names_to_snake_case(names: *mut Names<usize>, key: usize) -> *const SizedString {
  assert!(!names.is_null());

  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();

  let result = sentence.to_snake_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// get the name as SCREAMING_SNAKE_CASE
#[no_mangle]
extern "C" fn names_to_screaming_snake_case(
  names: *mut Names<usize>,
  key: usize,
) -> *const SizedString {
  assert!(!names.is_null());

  let names = unsafe { &mut *names };

  let sentence = names.get_name(&key).clone();

  let result = sentence.to_screaming_snake_case();
  let result = SizedString::new(result);
  let result = Box::new(result);
  Box::into_raw(result)
}

/// Free Names instance
#[no_mangle]
extern "C" fn names_free(names: *mut Names<usize>) {
  assert!(!names.is_null());

  unsafe {
    let _ = Box::from_raw(names);
  }
}
