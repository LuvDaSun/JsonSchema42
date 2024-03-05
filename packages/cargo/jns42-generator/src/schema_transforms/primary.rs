use crate::models::{arena::Arena, schema::SchemaNode};

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
pub fn transform(arena: &mut Arena<SchemaNode>, key: usize) {
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

    let child_item = SchemaNode {
      primary: Some(true),
      ..child_item.clone()
    };

    arena.set_item(child_key, child_item);
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{arena::Arena, schema::SchemaNode};

  #[test]
  fn test_transform() {
    let mut arena = Arena::new();

    arena.add_item(SchemaNode {
      primary: Some(true),
      all_of: Some([1].into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      all_of: Some([2].into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      ..Default::default()
    });

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected = vec![
      SchemaNode {
        primary: Some(true),
        all_of: Some([1].into()),
        ..Default::default()
      },
      SchemaNode {
        primary: Some(true),
        all_of: Some([2].into()),
        ..Default::default()
      },
      SchemaNode {
        primary: Some(true),
        ..Default::default()
      },
    ];

    assert_eq!(actual, expected)
  }
}
