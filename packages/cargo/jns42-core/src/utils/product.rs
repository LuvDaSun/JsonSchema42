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

pub(crate) fn neon_register(cx: &mut neon::context::ModuleContext) -> neon::result::NeonResult<()> {
  use neon::prelude::*;

  fn product_js(mut cx: FunctionContext) -> JsResult<JsArray> {
    let sets_js: Handle<JsArray> = cx.argument(0)?;
    let sets_length = sets_js.len(&mut cx) as usize;
    let mut sets = Vec::with_capacity(sets_length);
    for index in 0..sets_length {
      let sub_sets_js: Handle<JsArray> = sets_js.get(&mut cx, index as u32)?;
      let sub_sets_length = sub_sets_js.len(&mut cx) as usize;
      let mut sub_sets = Vec::with_capacity(sub_sets_length);
      for sub_index in 0..sub_sets_length {
        let value_js: Handle<JsValue> = sub_sets_js.get(&mut cx, sub_index as u32)?;
        sub_sets.push(value_js)
      }
      sets.push(sub_sets);
    }

    let result = product(sets);

    let result_js = JsArray::new(&mut cx, result.len());
    for (index, sub_result) in result.into_iter().enumerate() {
      let sub_result_js = JsArray::new(&mut cx, sub_result.len());

      for (sub_index, item) in sub_result.into_iter().enumerate() {
        sub_result_js.set(&mut cx, sub_index as u32, item)?;
      }

      result_js.set(&mut cx, index as u32, sub_result_js)?;
    }

    Ok(result_js)
  }

  cx.export_function("product", product_js)?;

  Ok(())
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
