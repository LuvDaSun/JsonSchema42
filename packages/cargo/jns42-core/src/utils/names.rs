use std::{
  cmp::Ordering,
  collections::{BTreeMap, BTreeSet, HashMap, HashSet},
};

#[derive(Debug, Default, PartialEq, Eq)]
struct PartInfo<'s> {
  value: &'s str,
  index: usize,
  cardinality: usize,
  is_head: bool,
}

impl<'s> PartialOrd for PartInfo<'s> {
  fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
    Some(self.cmp(other))
  }
}

impl<'s> Ord for PartInfo<'s> {
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

    match self.index.cmp(&other.index) {
      Ordering::Less => return Ordering::Less,
      Ordering::Greater => return Ordering::Greater,
      _ => {}
    };

    Ordering::Equal
  }
}

pub fn optimize_names<'f, K>(
  names: impl IntoIterator<Item = (K, impl IntoIterator<Item = impl ToString>)>,
  maximum_iterations: usize,
) -> Vec<(K, Vec<String>)>
where
  K: Clone + PartialOrd + Ord + 'f,
{
  let names = names
    .into_iter()
    .map(|(key, value)| {
      (
        key,
        value
          .into_iter()
          .map(|value| value.to_string())
          .collect::<Vec<_>>(),
      )
    })
    .collect::<Vec<_>>();

  // first we calculate the cardinality of each name-part we use this hashmap to keep
  // count
  let mut cardinality_counters = HashMap::<_, usize>::new();
  for (_key, name) in names.iter() {
    // unique name parts
    let name: HashSet<_> = name.iter().collect();
    for part in name {
      // for every unique name part add 1 to cardinality
      let cardinality = cardinality_counters.entry(part).or_default();
      *cardinality += 1;
    }
  }

  // then we create part info's that we can optimize. The key is the original key, then the
  // value is a tuple where the first element is the optimized name and the second part are
  // the ordered part info's. Those are ordered!
  let mut part_info_map: BTreeMap<_, (Vec<&str>, BTreeSet<_>)> = BTreeMap::new();
  for (key, name) in names.iter() {
    let part_info_entry = part_info_map.entry(key.clone()).or_default();
    for (index, part) in name.iter().enumerate() {
      let part_info = PartInfo {
        cardinality: *cardinality_counters.entry(part).or_default(),
        index,
        value: part,
        is_head: index == name.len() - 1,
      };
      part_info_entry.1.insert(part_info);
    }
  }

  // this is where we keep the optimized names as the key, the original keys are in the value.
  // Ideally there is only one element in the vector that is the value. This means that the
  // optimized name references only one original key and that we can use it as a replacement
  // for the original name.
  let mut optimized_names: HashMap<Vec<_>, BTreeSet<_>> = Default::default();
  // then run the optimization process! we keep on iterating the optimization until we reach the
  // maximum number of iterations, or if there is nothing more to optimize.

  for _iteration in 0..maximum_iterations {
    let mut done = true;
    optimized_names = Default::default();

    for (key, part_info) in &part_info_map {
      let keys = optimized_names.entry(part_info.0.clone()).or_default();
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
        let (optimized_name, part_infos) = part_info_map.get_mut(key).unwrap();
        let part_info = part_infos.pop_first();
        if let Some(part_info) = part_info {
          optimized_name.push(part_info.value);
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
  let result = optimized_names
    .into_iter()
    .flat_map(|(optimized_name, keys)| {
      let unique = keys.len() == 1;
      keys.into_iter().enumerate().map(move |(index, key)| {
        let mut optimized_name: Vec<_> = optimized_name
          .iter()
          .map(|value| value.to_string())
          .collect();
        optimized_name.reverse();
        if unique {
          (key, optimized_name)
        } else {
          optimized_name.push(index.to_string());
          (key, optimized_name)
        }
      })
    })
    .collect::<Vec<_>>();

  result
}

#[cfg(target_arch = "wasm32")]
mod wasm {
  use std::collections::HashMap;

  use wasm_bindgen::prelude::*;

  #[wasm_bindgen(js_name = "optimizeNames")]
  pub fn optimize_names_js(
    names_js: &JsValue,
    maximum_iterations: usize,
  ) -> Result<JsValue, JsValue> {
    let mut names = HashMap::new();

    let Some(names_js) = names_js.dyn_ref::<js_sys::Array>() else {
      return Err(JsValue::from_str("expected array"));
    };

    for names_index in 0..names_js.length() {
      let tuple_js = names_js.get(names_index);
      let Some(tuple_js) = tuple_js.dyn_ref::<js_sys::Array>() else {
        return Err(JsValue::from_str("expected array"));
      };
      if tuple_js.length() != 2 {
        return Err(JsValue::from_str("expected tuple of 2"));
      }

      let key_js = tuple_js.get(0);
      let Some(key) = key_js.as_string() else {
        return Err(JsValue::from_str("could not get as string"));
      };

      let mut name_parts = Vec::new();
      let name_parts_js = tuple_js.get(1);
      let Some(name_parts_js) = name_parts_js.dyn_ref::<js_sys::Array>() else {
        return Err(JsValue::from_str("expected array"));
      };
      for name_parts_index in 0..name_parts_js.length() {
        let name_part_js = name_parts_js.get(name_parts_index);
        let name_part = name_part_js.as_string();
        let Some(name_part) = name_part else {
          return Err(JsValue::from_str("not a string"));
        };

        name_parts.push(name_part);
      }

      if names.insert(key, name_parts).is_some() {
        return Err(JsValue::from_str("duplicate key"));
      }
    }

    let result = super::optimize_names(names, maximum_iterations);

    let result_js = js_sys::Array::new();
    for (key, name_parts) in result {
      let key_js = JsValue::from_str(&key);

      let name_parts_js = js_sys::Array::new();
      for name_part in name_parts {
        let name_part_js = JsValue::from_str(&name_part);
        name_parts_js.push(&name_part_js);
      }

      let tuple_js = js_sys::Array::new();
      tuple_js.push(&key_js);
      tuple_js.push(&name_parts_js);

      let tuple_js = JsValue::from(tuple_js);
      result_js.push(&tuple_js);
    }

    let result_js = JsValue::from(result_js);

    Ok(result_js)
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_part_info_order() {
    let part_info_a = PartInfo {
      cardinality: 100,
      index: 1,
      is_head: false,
      value: "A",
    };
    let part_info_b = PartInfo {
      cardinality: 1,
      index: 2,
      is_head: false,
      value: "B",
    };
    let part_info_c = PartInfo {
      cardinality: 100,
      index: 3,
      is_head: false,
      value: "C",
    };
    let part_info_d = PartInfo {
      cardinality: 10,
      index: 4,
      is_head: false,
      value: "D",
    };
    let part_info_e = PartInfo {
      cardinality: 1000,
      index: 5,
      is_head: true,
      value: "E",
    };

    let mut actual: Vec<_> = [
      &part_info_a,
      &part_info_b,
      &part_info_c,
      &part_info_d,
      &part_info_e,
    ]
    .into();
    actual.sort();

    let expected: Vec<_> = [
      &part_info_e,
      &part_info_b,
      &part_info_d,
      &part_info_a,
      &part_info_c,
    ]
    .into();

    assert_eq!(actual, expected);
  }

  #[test]
  fn test_names() {
    let actual: BTreeSet<_> = optimize_names([(1, vec!["A"]), (2, vec![""])], 5)
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [(1, vec!["A".to_string()]), (2, vec!["".to_string()])]
      .into_iter()
      .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = optimize_names([(1, vec!["A"]), (2, vec!["B"])], 5)
      .into_iter()
      .collect();
    let expected: BTreeSet<_> = [(1, vec!["A".to_string()]), (2, vec!["B".to_string()])]
      .into_iter()
      .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = optimize_names(
      [(1, vec!["A"]), (2, vec!["B", "C"]), (3, vec!["B", "D"])],
      5,
    )
    .into_iter()
    .collect();
    let expected: BTreeSet<_> = [
      (1, vec!["A".to_string()]),
      (2, vec!["C".to_string()]),
      (3, vec!["D".to_string()]),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);

    let actual: BTreeSet<_> = optimize_names(
      [
        (1, vec!["cat", "properties", "id"]),
        (2, vec!["dog", "properties", "id"]),
        (3, vec!["goat", "properties", "id"]),
      ],
      5,
    )
    .into_iter()
    .collect();
    let expected: BTreeSet<_> = [
      (1, vec!["cat".to_string(), "id".to_string()]),
      (2, vec!["dog".to_string(), "id".to_string()]),
      (3, vec!["goat".to_string(), "id".to_string()]),
    ]
    .into_iter()
    .collect();
    assert_eq!(actual, expected);
  }
}
