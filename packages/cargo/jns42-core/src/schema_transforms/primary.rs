use crate::models::{SchemaArena, SchemaItem};

/**
 * This sets the primary field on all relevant schemas
 *
 * ```yaml
 * - primary: true
 *   allOf: 1
 * - {}
 * ```
 *
 * will become
 *
 * ```yaml
 * - primary: true
 *   allOf: 1
 * - primary: true
 * ```
 */
pub fn transform(arena: &mut SchemaArena, key: usize) {
  let item = arena.get_item(key);

  let Some(primary) = item.primary else {
    return;
  };

  if !primary {
    return;
  }

  let item = item.clone();

  // set all children to primary
  for child_key in item.get_children() {
    let child_item = arena.get_item(child_key);

    let child_item = SchemaItem {
      primary: Some(true),
      ..child_item.clone()
    };

    arena.replace_item(child_key, child_item);
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_transform() {
    let mut arena = SchemaArena::new();

    arena.add_item(SchemaItem {
      primary: Some(true),
      all_of: Some([1].into()),
      ..Default::default()
    });

    arena.add_item(SchemaItem {
      all_of: Some([2].into()),
      ..Default::default()
    });

    arena.add_item(SchemaItem {
      ..Default::default()
    });

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected = vec![
      SchemaItem {
        primary: Some(true),
        all_of: Some([1].into()),
        ..Default::default()
      },
      SchemaItem {
        primary: Some(true),
        all_of: Some([2].into()),
        ..Default::default()
      },
      SchemaItem {
        primary: Some(true),
        ..Default::default()
      },
    ];

    assert_eq!(actual, expected)
  }
}
