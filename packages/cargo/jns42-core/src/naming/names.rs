use super::Sentence;
use std::collections::BTreeMap;
// use wasm_bindgen::prelude::*;

pub struct Names<K>(BTreeMap<K, Sentence>);

impl<K> Names<K>
where
  K: PartialOrd + Ord,
{
  pub fn new(interior: BTreeMap<K, Sentence>) -> Self {
    Self(interior)
  }

  pub fn get_name(&self, key: &K) -> Option<&Sentence> {
    self.0.get(key)
  }
}

impl<K> IntoIterator for Names<K> {
  type Item = (K, Sentence);
  type IntoIter = std::collections::btree_map::IntoIter<K, Sentence>;

  fn into_iter(self) -> Self::IntoIter {
    self.0.into_iter()
  }
}

// #[wasm_bindgen]
pub struct NamesContainer(Names<usize>);

// #[wasm_bindgen]
impl NamesContainer {
  // #[wasm_bindgen(js_name = getName)]
  pub fn get_name(&self, key: usize) -> Option<Sentence> {
    self.0.get_name(&key).cloned()
  }
}

impl From<Names<usize>> for NamesContainer {
  fn from(value: Names<usize>) -> Self {
    Self(value)
  }
}

impl From<NamesContainer> for Names<usize> {
  fn from(value: NamesContainer) -> Self {
    value.0
  }
}
