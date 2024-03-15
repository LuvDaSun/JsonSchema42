use crate::models::{arena::Arena, schema::SchemaNode};
use std::cell::RefCell;

/**
 * This transformer merges all sub schemas in allOf.
 *
 * ```yaml
 * - allOf
 *   - required: ["a", "b"]
 *     objectProperties:
 *       a: 100
 *       b: 200
 *   - objectProperties:
 *       b: 300
 *       c: 400
 * ```
 *
 * will become
 *
 * ```yaml
 * - required: ["a", "b"]
 *   objectProperties:
 *     a: 100
 *     b: 1
 *     c: 400
 * - allOf
 *   - 200
 *   - 300
 * ```
 */
pub fn transform(arena: &mut Arena<SchemaNode>, key: usize) {
  let item = arena.get_item(key);

  let Some(sub_keys) = item.all_of.clone() else {
    return;
  };

  if sub_keys.len() < 2 {
    return;
  };

  // things we cannot merge
  if item
    .types
    .as_ref()
    .map(|value| value.len())
    .unwrap_or_default()
    > 1
    || item.reference.is_some()
    || item.any_of.is_some()
    || item.one_of.is_some()
    || item.r#if.is_some()
    || item.then.is_some()
    || item.r#else.is_some()
    || item.not.is_some()
  {
    return;
  }

  let mut item_new = SchemaNode {
    all_of: None,
    ..item.clone()
  };

  // this is so that the following closures don't have to be FnMut
  let arena = RefCell::new(arena);

  let merge_key = |key: &usize, other_key: &usize| {
    if key == other_key {
      return *key;
    }

    let item_new = SchemaNode {
      all_of: Some([*key, *other_key].into()),
      ..Default::default()
    };

    arena.borrow_mut().add_item(item_new)
  };

  for sub_key in sub_keys {
    let arena = arena.borrow_mut();
    let sub_item = arena.get_item(sub_key);

    // things we cannot merge
    if sub_item
      .types
      .as_ref()
      .map(|value| value.len())
      .unwrap_or_default()
      > 1
      || sub_item.reference.is_some()
      || sub_item.all_of.is_some()
      || sub_item.any_of.is_some()
      || sub_item.one_of.is_some()
      || sub_item.r#if.is_some()
      || sub_item.then.is_some()
      || sub_item.r#else.is_some()
      || sub_item.not.is_some()
    {
      return;
    }

    item_new = item_new.intersection(sub_item, &merge_key);
  }

  let arena = arena.into_inner();

  arena.replace_item(key, item_new);
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{
    arena::Arena,
    schema::{SchemaNode, SchemaType},
  };

  #[test]
  fn test_utility() {
    let mut arena = Arena::from_iter([
      SchemaNode {
        types: Some([SchemaType::Never].into()),
        ..Default::default()
      }, // 0
      SchemaNode {
        types: Some([SchemaType::Any].into()),
        ..Default::default()
      }, // 1
      SchemaNode {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 2
      SchemaNode {
        all_of: Some([2, 0].into()),
        ..Default::default()
      }, // 3
      SchemaNode {
        all_of: Some([2, 1].into()),
        ..Default::default()
      }, // 4
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      SchemaNode {
        types: Some([SchemaType::Never].into()),
        ..Default::default()
      }, // 0
      SchemaNode {
        types: Some([SchemaType::Any].into()),
        ..Default::default()
      }, // 1
      SchemaNode {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 2
      SchemaNode {
        types: Some([SchemaType::Never].into()),
        ..Default::default()
      }, // 3
      SchemaNode {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 4
    ]
    .into();

    assert_eq!(actual, expected)
  }

  #[test]
  fn test_primitive() {
    let mut arena = Arena::from_iter([
      SchemaNode {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      SchemaNode {
        all_of: Some([0, 1].into()),
        ..Default::default()
      }, // 3
      SchemaNode {
        all_of: Some([1, 2].into()),
        ..Default::default()
      }, // 4
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      SchemaNode {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      SchemaNode {
        types: Some([SchemaType::Never].into()),
        ..Default::default()
      }, // 3
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 4
    ]
    .into();

    assert_eq!(actual, expected)
  }

  #[test]
  fn test_tuple() {
    let mut arena = Arena::from_iter([
      SchemaNode {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 3
      SchemaNode {
        types: Some([SchemaType::Array].into()),
        tuple_items: Some([0, 1].into()),
        ..Default::default()
      }, // 4
      SchemaNode {
        types: Some([SchemaType::Array].into()),
        tuple_items: Some([2, 3].into()),
        ..Default::default()
      }, // 5
      SchemaNode {
        all_of: Some([4, 5].into()),
        ..Default::default()
      }, // 6
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      SchemaNode {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 3
      SchemaNode {
        types: Some([SchemaType::Array].into()),
        tuple_items: Some([0, 1].into()),
        ..Default::default()
      }, // 4
      SchemaNode {
        types: Some([SchemaType::Array].into()),
        tuple_items: Some([2, 3].into()),
        ..Default::default()
      }, // 5
      SchemaNode {
        types: Some([SchemaType::Array].into()),
        tuple_items: Some([7, 8].into()),
        ..Default::default()
      }, // 6
      SchemaNode {
        types: Some([SchemaType::Never].into()),
        ..Default::default()
      }, // 7
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 8
    ]
    .into();

    assert_eq!(actual, expected)
  }

  #[test]
  fn test_array() {
    let mut arena = Arena::from_iter([
      SchemaNode {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      SchemaNode {
        types: Some([SchemaType::Array].into()),
        array_items: Some(0),
        ..Default::default()
      }, // 2
      SchemaNode {
        types: Some([SchemaType::Array].into()),
        array_items: Some(1),
        ..Default::default()
      }, // 3
      SchemaNode {
        all_of: Some([2, 3].into()),
        ..Default::default()
      }, // 4
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      SchemaNode {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      SchemaNode {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      SchemaNode {
        types: Some([SchemaType::Array].into()),
        array_items: Some(0),
        ..Default::default()
      }, // 2
      SchemaNode {
        types: Some([SchemaType::Array].into()),
        array_items: Some(1),
        ..Default::default()
      }, // 3
      SchemaNode {
        types: Some([SchemaType::Array].into()),
        array_items: Some(5),
        ..Default::default()
      }, // 4
      SchemaNode {
        types: Some([SchemaType::Never].into()),
        ..Default::default()
      }, // 5
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
