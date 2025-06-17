use crate::models::{ArenaSchemaItem, SchemaArena};
use std::collections::BTreeSet;

/**
 * This transformer turns resolves the not field.
 * TODO in some cases the not can be represented as an allOf
 *
 * ```yaml
 * - required:
 *   - a
 *   - b
 *   not: 1
 * - required
 *   - a
 * ```
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

  let sub_item = arena.get_item(not);

  if sub_item.reference.is_some() || sub_item.all_of.is_some() || sub_item.not.is_some() {
    return;
  }

  let mut item_new = ArenaSchemaItem {
    not: None,
    exact: Some(false), // TODO well we could make this exact in some cases
    ..item.clone()
  };

  if let Some(required) = &item.required {
    if let Some(exclude_required) = &sub_item.required {
      let exclude_required: BTreeSet<_> = exclude_required.iter().collect();
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
    let mut arena = SchemaArena::from_iter([
      ArenaSchemaItem {
        required: Some(["a"].map(str::to_owned).into()),
        ..Default::default()
      },
      ArenaSchemaItem {
        required: Some(["a", "b"].map(str::to_owned).into()),
        not: Some(0),
        ..Default::default()
      },
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      ArenaSchemaItem {
        required: Some(["a"].map(str::to_owned).into()),
        ..Default::default()
      },
      ArenaSchemaItem {
        exact: Some(false),
        required: Some(["b"].map(str::to_owned).into()),
        ..Default::default()
      },
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
