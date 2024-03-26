pub fn product<T>(sets: impl IntoIterator<Item = impl IntoIterator<Item = T>>) -> Vec<Vec<T>>
where
  T: Clone,
{
  let sets: Vec<Vec<_>> = sets
    .into_iter()
    .map(|sets| sets.into_iter().collect())
    .collect();

  if sets.is_empty() {
    return Default::default();
  }

  let count = sets.len();
  let mut indices: Vec<_> = vec![0; count];
  let mut result = Vec::new();

  loop {
    result.push(
      sets
        .iter()
        .enumerate()
        .map(|(index, set)| set[indices[index]].clone())
        .collect(),
    );

    for index in (0..count).rev() {
      indices[index] += 1;

      if indices[index] < sets[index].len() {
        break;
      }

      indices[index] = 0
    }

    if indices.iter().all(|index| index == &0) {
      break;
    }
  }

  result
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_product() {
    let expected = vec![
      vec![1, 4],
      vec![1, 5],
      vec![2, 4],
      vec![2, 5],
      vec![3, 4],
      vec![3, 5],
    ];
    let actual = product(vec![vec![1, 2, 3], vec![4, 5]]);
    assert_eq!(actual, expected);
  }
}
