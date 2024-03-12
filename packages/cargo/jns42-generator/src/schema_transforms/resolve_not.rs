use std::collections::HashSet;

use crate::models::{arena::Arena, schema::SchemaNode};

/**
 * This transformer turns resolves the not field
 *
 * ```yaml
 * - required:
 *   - a
 *   - b
 *   not: 1
 * - required
 *   - a
 *
 *
 * will become
 *
 * ```yaml
 * - required:
 *   - b
 * - required
 *   - a
 * ```
 */
pub fn transform(arena: &mut Arena<SchemaNode>, key: usize) {
  let item = arena.get_item(key);

  let Some(not) = item.not else {
    return;
  };

  let Some(required) = &item.required else {
    return;
  };

  let sub_item = arena.get_item(not);

  let Some(exclude_required) = &sub_item.required else {
    return;
  };

  let exclude_required: HashSet<_> = exclude_required.iter().collect();
  let required_new: Vec<_> = required
    .iter()
    .filter(|value| !exclude_required.contains(value))
    .cloned()
    .collect();

  let item_new = SchemaNode {
    not: None,
    required: Some(required_new),
    ..item.clone()
  };

  arena.set_item(key, item_new);
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{arena::Arena, schema::SchemaNode};

  #[test]
  fn test_transform() {
    let mut arena = Arena::new();

    arena.add_item(SchemaNode {
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
      SchemaNode {
        one_of: Some([1, 3].into()),
        ..Default::default()
      },
      SchemaNode {
        all_of: Some([100, 200].into()),
        ..Default::default()
      },
      SchemaNode {
        not: Some(100),
        ..Default::default()
      },
      SchemaNode {
        all_of: Some([2, 300].into()),
        ..Default::default()
      },
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
