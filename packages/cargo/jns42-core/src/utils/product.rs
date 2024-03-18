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

// #[cfg(target_arch = "wasm32")]
mod wasm {
  use wasm_bindgen::prelude::*;

  #[wasm_bindgen]
  pub fn product(sets_js: &JsValue) -> Result<JsValue, JsValue> {
    let mut sets = Vec::new();

    let Some(sets_js) = sets_js.dyn_ref::<js_sys::Array>() else {
      return Err(JsValue::from_str("expected array"));
    };
    for sets_index in 0..sets_js.length() {
      let mut sub_sets = Vec::new();
      let sub_sets_js = sets_js.get(sets_index);
      let Some(sub_sets_js) = sub_sets_js.dyn_ref::<js_sys::Array>() else {
        return Err(JsValue::from_str("expected array"));
      };
      for sub_sets_index in 0..sub_sets_js.length() {
        let item = sub_sets_js.get(sub_sets_index);

        sub_sets.push(item);
      }
      sets.push(sub_sets);
    }

    let result = super::product(sets);

    let result_js = js_sys::Array::new();
    for sub_result in result {
      let sub_result_js = js_sys::Array::new();
      for item in sub_result {
        sub_result_js.push(&item);
      }
      result_js.push(&JsValue::from(sub_result_js));
    }

    Ok(JsValue::from(result_js))
  }
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
