use super::{NamePart, Names, Sentence};
use std::collections::{BTreeMap, BTreeSet};

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

  pub fn build(&self) -> Names<K> {
    let key_count = self.0.len();
    let mut sentences_map = self.0.clone();
    let mut cardinality_counters = BTreeMap::<_, usize>::new();

    loop {
      let mut maximum_cardinality = 0;
      // calculate unique cardinality for every sentence
      for sentences in sentences_map.values() {
        // we ignore empty sentences
        if sentences.is_empty() {
          continue;
        }

        // make sentences unique
        let sentences: BTreeSet<_> = sentences.iter().collect();
        for sentence in sentences {
          // for every unique name part add 1 to cardinality
          let cardinality = cardinality_counters.entry(sentence).or_default();
          *cardinality += 1;

          maximum_cardinality = maximum_cardinality.max(*cardinality);
        }
      }

      // if the maximum cardinality is smaller than the number of keys then we are done here
      if maximum_cardinality < key_count {
        break;
      }

      // if we get to here we need to reduce cardinality for some sentences, so let's figure out
      // which ones we need to remove
      let remove_sentences: BTreeSet<_> = cardinality_counters
        .into_iter()
        .filter_map(|(sentence, cardinality)| {
          if cardinality < key_count {
            Some(sentence.clone())
          } else {
            None
          }
        })
        .collect();

      for sentences in &mut sentences_map.values_mut() {
        for remove_sentence in &remove_sentences {
          let Some(index) = sentences
            .iter()
            .position(|sentence| sentence == remove_sentence)
          else {
            continue;
          };

          // if it is the last element, we won't remove
          if index == sentences.len() - 1 {
            continue;
          }
          sentences.remove(index);
        }
      }

      cardinality_counters = BTreeMap::new();
    }

    // then we create part's that we can optimize. The key is the original key, then the
    // value is a tuple where the first element is the optimized name and the second part are
    // the ordered part info's. Those are ordered!
    let mut part_map: BTreeMap<_, (Sentence, BTreeSet<_>)> = BTreeMap::new();
    for (key, sentences) in self.0.iter() {
      let part_entry = part_map.entry(key.clone()).or_default();
      for (index, sentence) in sentences.iter().enumerate() {
        let part_info = NamePart {
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

    loop {
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
            *optimized_name = part.value.join(optimized_name);
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

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_names() {
    let actual: BTreeSet<_> = NamesBuilder::new()
      .add(1, "A")
      .add(2, "")
      .build()
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [(1, Sentence::new("a")), (2, Sentence::new(""))]
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
