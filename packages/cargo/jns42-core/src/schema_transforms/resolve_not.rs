use crate::models::{ArenaSchemaItem, SchemaArena};
use std::collections::HashSet;

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
pub fn transform(arena: &mut SchemaArena, key: usize) {
  let item = arena.get_item(key);

  let Some(not) = item.not else {
    return;
  };

  let mut item_new = ArenaSchemaItem {
    not: None,
    ..item.clone()
  };

  if let Some(required) = &item.required {
    let sub_item = arena.get_item(not);

    if let Some(exclude_required) = &sub_item.required {
      let exclude_required: HashSet<_> = exclude_required.iter().collect();
      let required_new = required
        .iter()
        .filter(|value| !exclude_required.contains(value))
        .cloned()
        .collect();

      item_new.required = Some(required_new);
    };
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
      required: Some(["a"].map(|value| value.to_string()).into()),
      ..Default::default()
    });

    arena.add_item(ArenaSchemaItem {
      required: Some(["a", "b"].map(|value| value.to_string()).into()),
      not: Some(0),
      ..Default::default()
    });

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      ArenaSchemaItem {
        required: Some(["a"].map(|value| value.to_string()).into()),
        ..Default::default()
      },
      ArenaSchemaItem {
        required: Some(["b"].map(|value| value.to_string()).into()),
        ..Default::default()
      },
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
