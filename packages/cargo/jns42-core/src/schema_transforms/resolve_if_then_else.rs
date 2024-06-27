use crate::models::{ArenaSchemaItem, SchemaArena};
use std::collections::BTreeSet;

/**
 * This transformer turns if-then-else into a one-of
 *
 * ```yaml
 * - if: 100
 *   then: 200
 *   else : 300
 * ```
 *
 * will become
 *
 * ```yaml
 * - oneOf
 *   - 2
 *   - 3
 * - not: 100
 * - allOf:
 *   - 100
 *   - 200
 * - allOf:
 *   - 1
 *   - 300
 * ```
 */
pub fn transform(arena: &mut SchemaArena, key: usize) {
  let item = arena.get_item(key);

  if item.one_of.is_some() {
    return;
  }

  let Some(r#if) = item.r#if else {
    return;
  };

  let item = item.clone();

  let mut sub_keys = BTreeSet::new();

  if let Some(then) = item.then {
    let new_sub_item = ArenaSchemaItem {
      name: Some("if-then".to_owned()),
      all_of: Some([r#if, then].into()),
      ..Default::default()
    };
    let new_sub_key = arena.add_item(new_sub_item);
    sub_keys.insert(new_sub_key);
  }

  if let Some(r#else) = item.r#else {
    let new_sub_sub_item = ArenaSchemaItem {
      name: Some("if-not".to_owned()),
      not: Some(r#if),
      ..Default::default()
    };
    let new_sub_sub_key = arena.add_item(new_sub_sub_item);

    let new_sub_item = ArenaSchemaItem {
      name: Some("if-else".to_owned()),
      all_of: Some([new_sub_sub_key, r#else].into()),
      ..Default::default()
    };
    let new_sub_key = arena.add_item(new_sub_item);
    sub_keys.insert(new_sub_key);
  }

  let item_new = ArenaSchemaItem {
    r#if: None,
    then: None,
    r#else: None,
    one_of: Some(sub_keys),
    ..item
  };

  arena.replace_item(key, item_new);
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_transform() {
    let mut arena = SchemaArena::new();

    arena.add_item(ArenaSchemaItem {
      r#if: Some(100),
      then: Some(200),
      r#else: Some(300),
      ..Default::default()
    });

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      ArenaSchemaItem {
        one_of: Some([1, 3].into()),
        ..Default::default()
      },
      ArenaSchemaItem {
        all_of: Some([100, 200].into()),
        ..Default::default()
      },
      ArenaSchemaItem {
        not: Some(100),
        ..Default::default()
      },
      ArenaSchemaItem {
        all_of: Some([2, 300].into()),
        ..Default::default()
      },
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
