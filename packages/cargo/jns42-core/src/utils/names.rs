use super::sentence::Sentence;
use std::{
  cmp::Ordering,
  collections::{BTreeMap, BTreeSet},
};

#[derive(Debug, Default, PartialEq, Eq)]
struct Part {
  value: Sentence,
  index: usize,
  cardinality: usize,
  is_head: bool,
}

impl PartialOrd for Part {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    Some(self.cmp(other))
  }
}

impl Ord for Part {
  fn cmp(&self, other: &Self) -> Ordering {
    match self.is_head.cmp(&other.is_head) {
      Ordering::Less => return Ordering::Greater,
      Ordering::Greater => return Ordering::Less,
      _ => {}
    };

    match self.cardinality.cmp(&other.cardinality) {
      Ordering::Less => return Ordering::Less,
      Ordering::Greater => return Ordering::Greater,
      _ => {}
    };

    // match self.value.len().cmp(&other.value.len()) {
    //   Ordering::Less => return Ordering::Less,
    //   Ordering::Greater => return Ordering::Greater,
    //   _ => {}
    // };

    match self.index.cmp(&other.index) {
      Ordering::Less => return Ordering::Less,
      Ordering::Greater => return Ordering::Greater,
      _ => {}
    };

    Ordering::Equal
  }
}

#[derive(Debug)]
pub struct NamesBuilder<K>(BTreeMap<K, Vec<Sentence>>);

impl<K> NamesBuilder<K>
where
  K: Clone + PartialOrd + Ord,
{
  pub fn new() -> Self {
    Self(BTreeMap::new())
  }

  pub fn add(&mut self, key: K, input: impl AsRef<str>) -> &mut Self {
    let sentences = self.0.entry(key).or_default();
    sentences.push(Sentence::new(input.as_ref()));
    self
  }

  pub fn build(&self, maximum_iterations: usize) -> Names<K> {
    // first we calculate the cardinality of each name-part we use this map to keep
    // count
    let mut cardinality_counters = BTreeMap::<_, usize>::new();
    for (_key, sentences) in self.0.iter() {
      // unique name parts
      let sentences: BTreeSet<_> = sentences.iter().collect();
      for sentence in sentences {
        // for every unique name part add 1 to cardinality
        let cardinality = cardinality_counters.entry(sentence).or_default();
        *cardinality += 1;
      }
    }

    // then we create part's that we can optimize. The key is the original key, then the
    // value is a tuple where the first element is the optimized name and the second part are
    // the ordered part info's. Those are ordered!
    let mut part_map: BTreeMap<_, (Sentence, BTreeSet<_>)> = BTreeMap::new();
    for (key, sentences) in self.0.iter() {
      let part_entry = part_map.entry(key.clone()).or_default();
      for (index, sentence) in sentences.iter().enumerate() {
        let part_info = Part {
          cardinality: *cardinality_counters.entry(sentence).or_default(),
          index,
          value: sentence.clone(),
          is_head: index == sentences.len() - 1,
        };
        part_entry.1.insert(part_info);
      }
    }

    // this is where we keep the optimized names as the key, the original keys are in the value.
    // Ideally there is only one element in the vector that is the value. This means that the
    // optimized name references only one original key and that we can use it as a replacement
    // for the original name.
    let mut optimized_names: BTreeMap<Sentence, BTreeSet<K>> = Default::default();
    // then run the optimization process! we keep on iterating the optimization until we reach the
    // maximum number of iterations, or if there is nothing more to optimize.

    for _iteration in 0..maximum_iterations {
      let mut done = true;
      optimized_names = Default::default();

      for (key, part) in &part_map {
        let keys = optimized_names.entry(part.0.clone()).or_default();
        (*keys).insert(key.clone());
      }

      for keys in optimized_names.values() {
        if keys.len() == 1 {
          // hurray optimization for this name is done!
          continue;
        }

        // if we get to here then one of the names is not unique! this means we need
        // another iteration after this one. We are not done!
        done = false;

        // add a name part to the optimized names. For every optimized name, take the first
        // part info and add it to the optimized name. The part infos are ordered by cardinality
        // so unique names are more likely to popup. More unique names (lower cardinality) will
        // be at the beginning of the set.
        for key in keys {
          let (optimized_name, parts) = part_map.get_mut(key).unwrap();
          let part = parts.pop_first();
          if let Some(part) = part {
            *optimized_name = optimized_name.join(&part.value);
          }
        }
      }

      if done {
        break;
      }
    }

    // return the optimized names. If the original names vector has a length of 1 then
    // it is  unique and can safely be returned. If not, then we need to make it unique
    // by adding an index to it.
    let names = optimized_names
      .into_iter()
      .flat_map(|(optimized_name, keys)| {
        keys.into_iter().enumerate().map(move |(index, key)| {
          let mut optimized_name: Sentence = optimized_name.iter().cloned().collect();
          if index == 0 {
            (key, optimized_name)
          } else {
            optimized_name = optimized_name.join(&Sentence::new(&index.to_string()));
            (key, optimized_name)
          }
        })
      })
      .collect();

    Names::new(names)
  }
}

impl<K> Default for NamesBuilder<K>
where
  K: Clone + PartialOrd + Ord,
{
  fn default() -> Self {
    Self::new()
  }
}

pub struct Names<K>(BTreeMap<K, Sentence>);

impl<K> Names<K>
where
  K: PartialOrd + Ord,
{
  fn new(interior: BTreeMap<K, Sentence>) -> Self {
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

pub mod ffi {

  #[repr(C)]
  pub struct NamesBuilder(Box<super::NamesBuilder<usize>>);

  impl NamesBuilder {
    #[allow(clippy::new_without_default)]
    #[no_mangle]
    pub extern "C" fn new() -> NamesBuilder {
      super::NamesBuilder::new().into()
    }

    #[no_mangle]
    pub extern "C" fn add(&mut self, key: usize, input: safer_ffi::string::String) -> &mut Self {
      self.0.add(key, input.to_string());
      self
    }

    #[no_mangle]
    pub extern "C" fn build(&self, maximum_iterations: usize) -> Names {
      Names(Box::new(self.0.build(maximum_iterations)))
    }
  }

  impl From<super::NamesBuilder<usize>> for NamesBuilder {
    fn from(value: super::NamesBuilder<usize>) -> Self {
      Self(Box::new(value))
    }
  }

  #[repr(C)]
  pub struct Names(Box<super::Names<usize>>);

  impl Names {
    #[no_mangle]
    pub extern "C" fn get_name(&self, key: usize) -> crate::utils::sentence::ffi::Sentence {
      self.0.get_name(&key).clone().into()
    }
  }

  impl From<super::Names<usize>> for Names {
    fn from(value: super::Names<usize>) -> Self {
      Self(Box::new(value))
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_part_info_order() {
    let part_info_a = Part {
      cardinality: 100,
      index: 1,
      is_head: false,
      value: Sentence::new("A"),
    };
    let part_info_b = Part {
      cardinality: 1,
      index: 2,
      is_head: false,
      value: Sentence::new("B"),
    };
    let part_info_c = Part {
      cardinality: 100,
      index: 3,
      is_head: false,
      value: Sentence::new("C"),
    };
    let part_info_d = Part {
      cardinality: 10,
      index: 4,
      is_head: false,
      value: Sentence::new("D"),
    };
    let part_info_e = Part {
      cardinality: 1000,
      index: 5,
      is_head: true,
      value: Sentence::new("E"),
    };

    let mut actual: Vec<_> = vec![
      &part_info_a,
      &part_info_b,
      &part_info_c,
      &part_info_d,
      &part_info_e,
    ];
    actual.sort();

    let expected: Vec<_> = vec![
      &part_info_e,
      &part_info_b,
      &part_info_d,
      &part_info_a,
      &part_info_c,
    ];

    assert_eq!(actual, expected);
  }

  #[test]
  fn test_names() {
    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "A")
      .add(2, "")
      .build(5)
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [(1, Sentence::new("a")), (2, Sentence::new(""))]
      .into_iter()
      .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "A")
      .add(2, "B")
      .build(5)
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [(1, Sentence::new("A")), (2, Sentence::new("B"))]
      .into_iter()
      .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "A")
      .add(2, "B")
      .add(2, "C")
      .add(3, "B")
      .add(3, "D")
      .build(5)
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("A")),
      (2, Sentence::new("C")),
      (3, Sentence::new("D")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "cat properties id")
      .add(2, "dog properties id")
      .add(3, "goat properties id")
      .build(5)
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("cat id")),
      (2, Sentence::new("dog id")),
      (3, Sentence::new("goat id")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "a")
      .add(2, "a b")
      .add(3, "a b c")
      .build(5)
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("a")),
      (2, Sentence::new("b")),
      (3, Sentence::new("c")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "a")
      .add(2, "b a")
      .add(3, "c b a")
      .build(5)
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("a")),
      (2, Sentence::new("b a")),
      (3, Sentence::new("c a")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "a b c")
      .add(2, "b c a")
      .add(3, "c a b")
      .build(5)
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("c")),
      (2, Sentence::new("a")),
      (3, Sentence::new("b")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);
  }
}
