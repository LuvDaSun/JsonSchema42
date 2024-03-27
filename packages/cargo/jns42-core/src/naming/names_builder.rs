use super::{NamePart, Names, Sentence};
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

  pub fn add(&mut self, key: K, value: impl AsRef<str>) -> &mut Self {
    let sentences = self.sentences_map.entry(key).or_default();
    sentences.push(Sentence::new(value.as_ref()));
    self
  }

  pub fn set_default_name(&mut self, value: impl AsRef<str>) -> &mut Self {
    self.default_sentence = Sentence::new(value.as_ref());
    self
  }

  pub fn build(&self) -> Names<K> {
    let (sentences_map, cardinality_counters) =
      Self::make_sentences_map_and_cardinality_counters(self.sentences_map.clone());
    let part_map = Self::make_parts_map(sentences_map, cardinality_counters);
    let optimized_names = Self::make_optimized_names(part_map);
    let optimized_names = Self::make_default_names(optimized_names, self.default_sentence.clone());
    let names = Self::make_names(optimized_names);

    Names::new(names)
  }

  /// create a new, normalized, sentences map and cardinality counters
  fn make_sentences_map_and_cardinality_counters(
    mut sentences_map: BTreeMap<K, Vec<Sentence>>,
  ) -> (BTreeMap<K, Vec<Sentence>>, BTreeMap<Sentence, usize>) {
    let key_count = sentences_map.len();
    let mut cardinality_counters = BTreeMap::<Sentence, usize>::new();

    loop {
      let mut done = true;

      // calculate unique cardinality for every sentence
      for sentences in sentences_map.values() {
        // we ignore empty sentences
        if sentences.is_empty() {
          continue;
        }

        // make sentences unique
        let sentences: BTreeSet<Sentence> = sentences.iter().cloned().collect();
        for sentence in sentences {
          if sentence.is_empty() {
            continue;
          }

          // for every unique name part add 1 to cardinality
          let cardinality = cardinality_counters.entry(sentence).or_default();
          *cardinality += 1;

          if *cardinality >= key_count {
            done = false
          }
        }
      }

      if done {
        break;
      }

      // if we get to here we need to reduce cardinality for some sentences, so let's figure out
      // which ones we need to remove
      let remove_sentences: BTreeSet<_> = cardinality_counters
        .into_iter()
        .filter_map(|(sentence, cardinality)| {
          if cardinality < key_count {
            None
          } else {
            Some(sentence.clone())
          }
        })
        .collect();

      for sentences in &mut sentences_map.values_mut() {
        let mut remove_sentences = remove_sentences.clone();
        let mut sentence_count = sentences.len();

        *sentences = sentences
          .iter()
          .filter(|sentence| {
            if remove_sentences.remove(sentence) {
              sentence_count -= 1;
              // only keep the last sentence
              sentence_count == 0
            } else {
              true
            }
          })
          .cloned()
          .collect();
      }

      cardinality_counters = BTreeMap::new();
    }

    (sentences_map, cardinality_counters)
  }

  /// Create a map with a value of a tuple where the first element is the optimized
  /// name (initially empty) and then an ordered set of name parts
  fn make_parts_map(
    sentences_map: BTreeMap<K, Vec<Sentence>>,
    cardinality_counters: BTreeMap<Sentence, usize>,
  ) -> BTreeMap<K, BTreeSet<NamePart>> {
    let parts_map = sentences_map
      .into_iter()
      .map(|(key, sentences)| {
        (
          key,
          sentences
            .iter()
            .enumerate()
            .map(|(index, sentence)| NamePart {
              cardinality: cardinality_counters
                .get(sentence)
                .copied()
                .unwrap_or_default(),
              index,
              sentence: sentence.clone(),
              is_head: index == sentences.len() - 1,
            })
            .collect(),
        )
      })
      .collect();

    parts_map
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

      for keys in optimized_names.values() {
        // add a name part to the optimized names. For every optimized name, take the first
        // part info and add it to the optimized name. The part infos are ordered by cardinality
        // so unique names are more likely to popup. More unique names (lower cardinality) will
        // be at the beginning of the set.
        for key in keys {
          let (optimized_name, parts) = optimization_map.get_mut(key).unwrap();
          let part = parts.pop_first();
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

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_make_sentences_map_and_cardinality_counters() {
    let sentences_map = [
      (
        1,
        vec![Sentence::new("a"), Sentence::new("a"), Sentence::new("c")],
      ),
      (
        2,
        vec![Sentence::new("a"), Sentence::new("b"), Sentence::new("c")],
      ),
      (
        3,
        vec![Sentence::new("a"), Sentence::new("a b"), Sentence::new("c")],
      ),
      (
        4,
        vec![Sentence::new("a"), Sentence::new("a b"), Sentence::new("c")],
      ),
      (5, vec![Sentence::new("a"), Sentence::new("c")]),
    ]
    .into();
    let (sentences_map_actual, cardinality_counters_actual) =
      NamesBuilder::make_sentences_map_and_cardinality_counters(sentences_map);

    let sentences_map_expected: BTreeMap<_, Vec<Sentence>> = [
      (1, vec![Sentence::new("a")]),
      (2, vec![Sentence::new("b")]),
      (3, vec![Sentence::new("a b")]),
      (4, vec![Sentence::new("a b")]),
      (5, vec![Sentence::new("c")]),
    ]
    .into();
    let cardinality_counters_expected: BTreeMap<Sentence, usize> = [
      (Sentence::new("a"), 1),
      (Sentence::new("b"), 1),
      (Sentence::new("a b"), 2),
      (Sentence::new("c"), 1),
    ]
    .into();

    assert_eq!(sentences_map_actual, sentences_map_expected);
    assert_eq!(cardinality_counters_actual, cardinality_counters_expected);
  }

  #[test]
  fn test_names() {
    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "A")
      .add(2, "")
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [(1, Sentence::new("a")), (2, Sentence::empty())]
      .into_iter()
      .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "A")
      .add(2, "B")
      .build()
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
      .build()
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
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("cat properties id")),
      (2, Sentence::new("dog properties id")),
      (3, Sentence::new("goat properties id")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "a")
      .add(2, "a b")
      .add(3, "a b c")
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("a")),
      (2, Sentence::new("a b")),
      (3, Sentence::new("a b c")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "a")
      .add(2, "b a")
      .add(3, "c b a")
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("a")),
      (2, Sentence::new("b a")),
      (3, Sentence::new("c b a")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "a b c")
      .add(2, "b c a")
      .add(3, "c a b")
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [
      (1, Sentence::new("a b c")),
      (2, Sentence::new("b c a")),
      (3, Sentence::new("c a b")),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);
  }
}
