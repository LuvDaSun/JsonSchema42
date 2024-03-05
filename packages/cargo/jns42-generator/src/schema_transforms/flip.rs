use crate::{
  models::{arena::Arena, schema::SchemaNode},
  utils::product::product,
};
use std::collections::HashMap;

/**
 * Flips oneOf and allOf types. If an allOf has a oneOf in it, this transform
 * will flip em! It will become a oneOf with a few allOfs in it.
 *
 * We can generate code for a oneOf with some allOfs in it, but for an allOf with
 * a bunch of oneOfs, we cannot generate code.
 *
 * this

```yaml
- allOf:
    - 1
    - 2
    - 3
- type: object
- oneOf:
    - 100
    - 200
- oneOf:
    - 300
    - 400
```

will become

```yaml
- oneOf:
    - 2
    - 3
    - 4
    - 5
- type: object
- allOf:
    - 1
    - 100
    - 300
- allOf:
    - 1
    - 100
    - 400
- allOf:
    - 1
    - 200
    - 300
- allOf:
    - 1
    - 200
    - 400
```
 */
pub fn transform(arena: &mut Arena<SchemaNode>, key: usize) {
  let item = arena.get_item(key);

  let Some(sub_keys) = &item.all_of else {
    return;
  };

  // we need 2 to be able to merge!
  if sub_keys.len() < 2 {
    return;
  }

  // resolve the items
  let sub_entries: HashMap<_, _> = sub_keys
    .iter()
    .map(|sub_key| (*sub_key, arena.get_item(*sub_key)))
    .collect();

  // collect all of the sub sub keys
  let sub_sub_keys: HashMap<_, _> = sub_entries
    .iter()
    .filter_map(|(sub_key, sub_item)| {
      sub_item
        .one_of
        .as_ref()
        .map(|sub_sub_keys| (*sub_key, sub_sub_keys.clone()))
    }) // TODO
    .collect();

  // if there are no sub sub keys then we are done
  if sub_sub_keys.is_empty() {
    return;
  }

  // filter out all entries that have no sub sub
  let sub_keys: Vec<_> = sub_entries
    .keys()
    .copied()
    .filter(|sub_key| !sub_sub_keys.contains_key(sub_key))
    .collect();

  let mut sub_keys_new = Vec::new();
  let item = item.clone();
  for set in product(sub_sub_keys.values().cloned().collect()) {
    let sub_item = SchemaNode {
      parent: Some(key),
      all_of: Some(
        sub_keys
          .iter()
          .copied()
          .chain(set.iter().copied())
          .collect(),
      ),
      ..Default::default()
    };
    let sub_key = arena.add_item(sub_item);
    sub_keys_new.push(sub_key);
  }

  let item = SchemaNode {
    all_of: None,
    one_of: Some(sub_keys_new),
    ..item
  };

  arena.set_item(key, item);
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{arena::Arena, schema::SchemaNode};

  #[test]
  fn test_transform() {
    let mut arena = Arena::new();

    arena.add_item(Default::default()); // 0
    arena.add_item(Default::default()); // 1
    arena.add_item(Default::default()); // 2
    arena.add_item(Default::default()); // 3
    arena.add_item(Default::default()); // 4

    arena.add_item(SchemaNode {
      one_of: Some(vec![1, 2]),
      ..Default::default()
    }); // 5
    arena.add_item(SchemaNode {
      one_of: Some(vec![3, 4]),
      ..Default::default()
    }); // 6
    arena.add_item(SchemaNode {
      all_of: Some(vec![0, 5, 6]),
      ..Default::default()
    }); // 7

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected = vec![
      Default::default(), // 0
      Default::default(), // 1
      Default::default(), // 2
      Default::default(), // 3
      Default::default(), // 4
      SchemaNode {
        one_of: Some(vec![1, 2]),
        ..Default::default()
      }, // 5
      SchemaNode {
        one_of: Some(vec![3, 4]),
        ..Default::default()
      }, // 6
      SchemaNode {
        one_of: Some(vec![8, 9, 10, 11]),
        ..Default::default()
      }, // 7
      SchemaNode {
        parent: Some(7),
        all_of: Some(vec![0, 1, 3]),
        ..Default::default()
      }, // 8
      SchemaNode {
        parent: Some(7),
        all_of: Some(vec![0, 1, 4]),
        ..Default::default()
      }, // 9
      SchemaNode {
        parent: Some(7),
        all_of: Some(vec![0, 2, 3]),
        ..Default::default()
      }, // 10
      SchemaNode {
        parent: Some(7),
        all_of: Some(vec![0, 2, 4]),
        ..Default::default()
      }, // 11
    ];

    assert_eq!(actual, expected)
  }
}
