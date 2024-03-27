use super::Sentence;
use std::collections::BTreeMap;

pub struct Names<K>(BTreeMap<K, Sentence>);

impl<K> Names<K>
where
  K: PartialOrd + Ord,
{
  pub(super) fn new(interior: BTreeMap<K, Sentence>) -> Self {
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
