use super::Sentence;
use std::collections::BTreeMap;

#[cfg(target_arch = "wasm32")]
use crate::exports;

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

#[cfg(target_arch = "wasm32")]
pub struct NamesHost(Names<u32>);

#[cfg(target_arch = "wasm32")]
impl From<Names<u32>> for NamesHost {
  fn from(value: Names<u32>) -> Self {
    Self(value)
  }
}

#[cfg(target_arch = "wasm32")]
impl From<NamesHost> for exports::jns42::core::naming::Names {
  fn from(value: NamesHost) -> Self {
    Self::new(value)
  }
}

#[cfg(target_arch = "wasm32")]
impl From<Names<u32>> for exports::jns42::core::naming::Names {
  fn from(value: Names<u32>) -> Self {
    NamesHost::from(value).into()
  }
}

#[cfg(target_arch = "wasm32")]
impl exports::jns42::core::naming::GuestNames for NamesHost {
  fn get_name(&self, key: u32) -> Option<exports::jns42::core::naming::Sentence> {
    self.0.get_name(&key).cloned().map(Into::into)
  }
}
