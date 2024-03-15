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
  let required_new = required
    .iter()
    .filter(|value| !exclude_required.contains(value))
    .cloned()
    .collect();

  let item_new = SchemaNode {
    not: None,
    required: Some(required_new),
    ..item.clone()
  };

  arena.replace_item(key, item_new);
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{arena::Arena, schema::SchemaNode};

  #[test]
  fn test_transform() {
    let mut arena = Arena::new();

    arena.add_item(SchemaNode {
      required: Some(["a"].map(|value| value.to_string()).into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      required: Some(["a", "b"].map(|value| value.to_string()).into()),
      not: Some(0),
      ..Default::default()
    });

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      SchemaNode {
        required: Some(["a"].map(|value| value.to_string()).into()),
        ..Default::default()
      },
      SchemaNode {
        required: Some(["b"].map(|value| value.to_string()).into()),
        ..Default::default()
      },
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
