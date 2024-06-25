use super::{NamePart, Names, Sentence};
use crate::naming::NamesContainer;
use std::{
  collections::{BTreeMap, BTreeSet},
  fmt::Debug,
};
use wasm_bindgen::prelude::*;

#[derive(Debug)]
pub struct NamesBuilder<K> {
  sentences_map: BTreeMap<K, Vec<Sentence>>,
  default_sentence: Sentence,
}

impl<K> NamesBuilder<K>
where
  K: Clone + PartialOrd + Ord + Debug,
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

  pub fn build(&self) -> Names<K> {
    let prefix_length = Self::find_prefix_length(self.sentences_map.values().collect());
    let sentences_map = self
      .sentences_map
      .iter()
      .map(|(key, sentences)| (key.clone(), sentences[prefix_length..].to_vec()))
      .collect();

    let cardinality_counters = Self::make_cardinality_counters(&sentences_map);
    let part_map = Self::make_parts_map(&sentences_map, &cardinality_counters);
    let optimized_names = Self::make_optimized_names(part_map);
    let optimized_names = Self::make_default_names(optimized_names, self.default_sentence.clone());
    let names = Self::make_names(optimized_names);

    Names::new(names)
  }

  fn find_prefix_length(sentence_list: Vec<&Vec<Sentence>>) -> usize {
    let mut index = 0;

    if sentence_list.is_empty() {
      return index;
    }

    loop {
      let mut compare_sentence = None;
      for sentences in &sentence_list {
        let Some(sentence) = sentences.get(index) else {
          return index;
        };

        let Some(compare_sentence) = compare_sentence else {
          compare_sentence = Some(sentence);
          continue;
        };

        if compare_sentence != sentence {
          return index;
        }
      }

      index += 1;
    }
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
                  .copied()
                  .unwrap_or_default()
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
    let mut optimization_map: BTreeMap<K, (Sentence, Sentence, BTreeSet<NamePart>)> = part_map
      .into_iter()
      .map(|(key, name_parts)| (key, (Sentence::empty(), Sentence::empty(), name_parts)))
      .collect();

    let mut optimized_names: BTreeMap<Sentence, BTreeSet<K>> = BTreeMap::new();
    for (key, part) in &optimization_map {
      let keys = optimized_names.entry(part.1.clone()).or_default();
      (*keys).insert(key.clone());
    }

    let mut done = false;
    while !done {
      done = true;

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
          let (optimized_name_previous, optimized_name, parts) =
            optimization_map.get_mut(key).unwrap();
          let part = parts.pop_last();
          let Some(part) = part else {
            continue;
          };

          *optimized_name_previous = optimized_name.clone();
          *optimized_name = part.sentence.join(optimized_name);

          done = false;
        }
      }

      {
        let optimized_names_previous = optimized_names;

        optimized_names = BTreeMap::new();
        for (key, part) in &optimization_map {
          let keys = optimized_names.entry(part.1.clone()).or_default();
          (*keys).insert(key.clone());
        }

        for (optimized_name_previous, optimized_name, _parts) in optimization_map.values_mut() {
          let Some(keys_next) = optimized_names.get(optimized_name) else {
            continue;
          };
          let Some(keys_previous) = optimized_names_previous.get(optimized_name_previous) else {
            continue;
          };

          if keys_next == keys_previous {
            *optimized_name = optimized_name_previous.clone();
            // done = false
          }
        }
      }

      optimized_names = BTreeMap::new();
      for (key, part) in &optimization_map {
        let keys = optimized_names.entry(part.1.clone()).or_default();
        (*keys).insert(key.clone());
      }
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
  K: Clone + PartialOrd + Ord + Debug,
{
  fn default() -> Self {
    Self::new()
  }
}

#[wasm_bindgen]
pub struct NamesBuilderContainer(NamesBuilder<usize>);

#[wasm_bindgen]
impl NamesBuilderContainer {
  #[wasm_bindgen(constructor)]
  pub fn new() -> Self {
    Self(NamesBuilder::new())
  }

  #[wasm_bindgen(js_name = setDefaultName)]
  pub fn set_default_name(&mut self, value: &str) {
    self.0.set_default_name(value);
  }

  #[wasm_bindgen(js_name = add)]
  pub fn add(&mut self, key: usize, values: Vec<String>) {
    self.0.add(key, values);
  }

  #[wasm_bindgen(js_name = build)]
  pub fn build(&self) -> NamesContainer {
    self.0.build().into()
  }
}

impl Default for NamesBuilderContainer {
  fn default() -> Self {
    Self::new()
  }
}

impl From<NamesBuilder<usize>> for NamesBuilderContainer {
  fn from(value: NamesBuilder<usize>) -> Self {
    Self(value)
  }
}

impl From<NamesBuilderContainer> for NamesBuilder<usize> {
  fn from(value: NamesBuilderContainer) -> Self {
    value.0
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_positive_integer_file() {
    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(
        1,
        [
          "home",
          "workspace",
          "JsonSchema42",
          "fixtures",
          "testing",
          "positive-integer",
        ],
      )
      .add(
        2,
        [
          "home",
          "workspace",
          "JsonSchema42",
          "fixtures",
          "testing",
          "positive-integer",
          "definitions",
          "positiveInteger",
        ],
      )
      .add(
        3,
        [
          "home",
          "workspace",
          "JsonSchema42",
          "fixtures",
          "testing",
          "positive-integer",
          "definitions",
          "positiveIntegerDefault0",
        ],
      )
      .set_default_name("default")
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = vec![
      (1, Sentence::new("default")),
      (2, Sentence::new("positive-integer")),
      (3, Sentence::new("positiveIntegerDefault0")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);
  }

  #[test]
  fn test_names_duplicate() {
    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, ["a", "b", "c"])
      .add(2, ["a", "b", "c"])
      .add(3, ["a", "b", "c"])
      .set_default_name("default")
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = vec![
      (1, Sentence::new("default")),
      (2, Sentence::new("default1")),
      (3, Sentence::new("default2")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, ["a", "b", "c"])
      .add(2, ["a", "b", "c"])
      .add(3, ["a", "b", "c"])
      .add(4, ["a", "b"])
      .add(5, ["a", "b"])
      .set_default_name("default")
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = vec![
      (1, Sentence::new("c")),
      (2, Sentence::new("c-1")),
      (3, Sentence::new("c-2")),
      (4, Sentence::new("default")),
      (5, Sentence::new("default-1")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);
  }

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
      (1, Sentence::new("")),
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
      (1, Sentence::new("")),
      (2, Sentence::new("b")),
      (3, Sentence::new("c")),
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
      (1, Sentence::new("cat")),
      (2, Sentence::new("dog")),
      (3, Sentence::new("goat")),
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
    let expected: BTreeSet<_> = [(1, Sentence::new("cat")), (2, Sentence::new("schema"))]
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
    let expected: BTreeSet<_> = [(1, Sentence::new("cat")), (2, Sentence::new("schema"))]
      .into_iter()
      .collect();
    assert_eq!(actual, expected);
  }
}
