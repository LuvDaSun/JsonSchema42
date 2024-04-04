use super::{NamePart, Names, Sentence};
use crate::ffi::SizedString;
use std::collections::{BTreeMap, BTreeSet};

#[derive(Debug)]
pub struct NamesBuilder<K> {
  sentences_map: BTreeMap<K, Vec<Sentence>>,
  default_sentence: Sentence,
}

impl<K> NamesBuilder<K>
where
  K: Clone + PartialOrd + Ord,
{
  pub fn new() -> Self {
    Self {
      sentences_map: Default::default(),
      default_sentence: Sentence::empty(),
    }
  }

  pub fn add(&mut self, key: K, values: impl IntoIterator<Item = impl AsRef<str>>) -> &mut Self {
    let values = values
      .into_iter()
      .map(|value| Sentence::new(value.as_ref()))
      .collect();
    self.sentences_map.insert(key, values);
    self
  }

  pub fn set_default_name(&mut self, value: impl AsRef<str>) -> &mut Self {
    self.default_sentence = Sentence::new(value.as_ref());
    self
  }

  pub fn build(&mut self) -> Names<K> {
    let cardinality_counters = Self::make_cardinality_counters(&self.sentences_map);
    let part_map = Self::make_parts_map(&self.sentences_map, &cardinality_counters);
    let optimized_names = Self::make_optimized_names(part_map);
    let optimized_names = Self::make_default_names(optimized_names, self.default_sentence.clone());
    let names = Self::make_names(optimized_names);

    Names::new(names)
  }

  /// create a new, normalized, sentences map and cardinality counters
  fn make_cardinality_counters(
    sentences_map: &BTreeMap<K, Vec<Sentence>>,
  ) -> BTreeMap<Sentence, usize> {
    let mut cardinality_counters = BTreeMap::<Sentence, usize>::new();

    // calculate unique cardinality for every sentence
    for sentences in sentences_map.values() {
      // we ignore empty sentences
      if sentences.is_empty() {
        continue;
      }

      for sentence in sentences {
        if sentence.is_empty() {
          continue;
        }

        // for every unique name part add 1 to cardinality
        let cardinality = cardinality_counters.entry(sentence.clone()).or_default();
        *cardinality += 1;
      }
    }

    cardinality_counters
  }

  /// Create a map with a value of a tuple where the first element is the optimized
  /// name (initially empty) and then an ordered set of name parts
  fn make_parts_map(
    sentences_map: &BTreeMap<K, Vec<Sentence>>,
    cardinality_counters: &BTreeMap<Sentence, usize>,
  ) -> BTreeMap<K, BTreeSet<NamePart>> {
    let key_count = sentences_map.len();

    sentences_map
      .iter()
      .map(|(key, sentences)| {
        let mut sentences_set: BTreeSet<_> = sentences.iter().collect();
        (
          key.clone(),
          sentences
            .iter()
            .enumerate()
            // unique sentences, but keep the order
            .filter(|(_index, sentence)| sentences_set.remove(sentence))
            .map(|(index, sentence)| {
              // how many times does this sentence occur in our sentences
              let local_cardinality = sentences
                .iter()
                .filter(|current_sentence| *current_sentence == sentence)
                .count();
              // adjust cardinality if this sentence occurs multiple times
              let adjust_cardinality = (local_cardinality - 1) * key_count;

              // maximum cardinality is the number of keys
              let cardinality = key_count.min(
                cardinality_counters
                  .get(sentence)
                  .unwrap()
                  .saturating_sub(adjust_cardinality),
              );

              NamePart {
                cardinality,
                index,
                sentence: sentence.clone(),
                is_head: index == sentences.len() - 1,
              }
            })
            .collect(),
        )
      })
      .collect()
  }

  fn make_optimized_names(
    part_map: BTreeMap<K, BTreeSet<NamePart>>,
  ) -> BTreeMap<Sentence, BTreeSet<K>> {
    let mut optimized_names: BTreeMap<Sentence, BTreeSet<K>> = BTreeMap::new();
    let mut optimization_map: BTreeMap<K, (Sentence, BTreeSet<NamePart>)> = part_map
      .into_iter()
      .map(|(key, name_parts)| (key, (Sentence::empty(), name_parts)))
      .collect();

    loop {
      let mut done = true;

      for (key, part) in &optimization_map {
        let keys = optimized_names.entry(part.0.clone()).or_default();
        (*keys).insert(key.clone());
      }

      for (name, keys) in &optimized_names {
        if !name.is_empty() && keys.len() == 1 {
          // hurray! this name is unique!
          continue;
        }

        // add a name part to the optimized names. For every optimized name, take the first
        // part info and add it to the optimized name. The part infos are ordered by cardinality
        // so unique names are more likely to popup. More unique names (lower cardinality) will
        // be at the beginning of the set.
        for key in keys {
          let (optimized_name, parts) = optimization_map.get_mut(key).unwrap();
          let part = parts.pop_last();
          let Some(part) = part else {
            continue;
          };

          *optimized_name = part.sentence.join(optimized_name);

          done = false;
        }
      }

      if done {
        break;
      }

      optimized_names = BTreeMap::new();
    }

    optimized_names
  }

  fn make_default_names(
    optimized_names: BTreeMap<Sentence, BTreeSet<K>>,
    default_sentence: Sentence,
  ) -> BTreeMap<Sentence, BTreeSet<K>> {
    optimized_names
      .into_iter()
      .map(|(sentence, keys)| {
        if sentence.is_empty() {
          (default_sentence.clone(), keys)
        } else {
          (sentence, keys)
        }
      })
      .collect()
  }

  fn make_names(optimized_names: BTreeMap<Sentence, BTreeSet<K>>) -> BTreeMap<K, Sentence> {
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
    names
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

/// Create a new NamesBuilder instance
#[no_mangle]
extern "C" fn names_builder_new() -> *mut NamesBuilder<usize> {
  let names_builder = NamesBuilder::new();
  let names_builder = Box::new(names_builder);
  Box::into_raw(names_builder)
}

/// Free NamesBuilder instance
#[no_mangle]
extern "C" fn names_builder_drop(names_builder: *mut NamesBuilder<usize>) {
  assert!(!names_builder.is_null());

  drop(unsafe { Box::from_raw(names_builder) });
}

/// add a sentence to a key
#[no_mangle]
extern "C" fn names_builder_add(
  names_builder: *mut NamesBuilder<usize>,
  key: usize,
  values: *const Vec<SizedString>,
) {
  assert!(!names_builder.is_null());
  assert!(!values.is_null());

  let names_builder = unsafe { &mut *names_builder };
  let values = unsafe { &*values };

  names_builder.add(key, values);
}

/// add a sentence to a key
#[no_mangle]
extern "C" fn names_builder_set_default_name(
  names_builder: *mut NamesBuilder<usize>,
  value: *const SizedString,
) {
  assert!(!value.is_null());

  let names_builder = unsafe { &mut *names_builder };
  let value = unsafe { &*value };
  let value = value.as_str();

  names_builder.set_default_name(value);
}

/// create a names struct from the builder
#[no_mangle]
extern "C" fn names_builder_build(names_builder: *mut NamesBuilder<usize>) -> *mut Names<usize> {
  assert!(!names_builder.is_null());

  let names_builder = unsafe { &mut *names_builder };

  let names = names_builder.build();
  let names = Box::new(names);
  Box::into_raw(names)
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_names_1() {
    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, ["a"])
      .add(2, ["a", "b"])
      .add(3, ["a", "b", "c"])
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = vec![
      (1, Sentence::new("a")),
      (2, Sentence::new("b")),
      (3, Sentence::new("c")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, ["a"])
      .add(2, ["b", "a"])
      .add(3, ["c", "b", "a"])
      .build()
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
      .add(1, ["b", "c", "a"])
      .add(2, ["c", "a", "b"])
      .add(3, ["a", "b", "c"])
      .build()
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
  }

  #[test]
  fn test_names_2() {
    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, ["x", "cat", "a", "b", "id"])
      .add(2, ["x", "dog", "a", "b", "id"])
      .add(3, ["x", "goat", "a", "b", "id"])
      .build()
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
  }

  #[test]
  fn test_names_3() {
    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, ["schema", "cat", "id"])
      .add(2, ["schema", "schema", "id"])
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("cat id")),
      (2, Sentence::new("schema id")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);
  }

  #[test]
  fn test_names_4() {
    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, ["cat", "cat", "cat", "id"])
      .add(2, ["schema", "schema", "id"])
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("cat id")),
      (2, Sentence::new("schema id")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);
  }
}
