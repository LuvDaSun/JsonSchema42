use super::Sentence;
use std::cmp::Ordering;

#[derive(Debug, Default, PartialEq, Eq)]
pub struct NamePart {
  pub sentence: Sentence,
  pub index: usize,
  pub cardinality: usize,
  pub is_head: bool,
}

impl PartialOrd for NamePart {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    Some(self.cmp(other))
  }
}

impl Ord for NamePart {
  fn cmp(&self, other: &Self) -> Ordering {
    match self.is_head.cmp(&other.is_head) {
      Ordering::Less => return Ordering::Less,
      Ordering::Greater => return Ordering::Greater,
      _ => {}
    };

    match self.cardinality.cmp(&other.cardinality) {
      Ordering::Less => return Ordering::Greater,
      Ordering::Greater => return Ordering::Less,
      _ => {}
    };

    match self.index.cmp(&other.index) {
      Ordering::Less => return Ordering::Less,
      Ordering::Greater => return Ordering::Greater,
      _ => {}
    };

    Ordering::Equal
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_part_order() {
    let part_info_a = NamePart {
      cardinality: 100,
      index: 1,
      is_head: false,
      sentence: Sentence::new("A"),
    };
    let part_info_b = NamePart {
      cardinality: 1,
      index: 2,
      is_head: false,
      sentence: Sentence::new("B"),
    };
    let part_info_c = NamePart {
      cardinality: 100,
      index: 3,
      is_head: false,
      sentence: Sentence::new("C"),
    };
    let part_info_d = NamePart {
      cardinality: 10,
      index: 4,
      is_head: false,
      sentence: Sentence::new("D"),
    };
    let part_info_e = NamePart {
      cardinality: 1000,
      index: 5,
      is_head: true,
      sentence: Sentence::new("E"),
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
      &part_info_a,
      &part_info_c,
      &part_info_d,
      &part_info_b,
      &part_info_e,
    ];

    assert_eq!(actual, expected);
  }
}
