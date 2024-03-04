use crate::models::{arena::Arena, schema::SchemaNode};

/**
 * This transformer makes a reference if there is a single allOf, anyOf or oneOf.
 *
 * ```yaml
 * - oneOf:
 *   - 1
 * ```
 *
 * will become
 *
 * ```yaml
 * - reference: 1
 * ```
 */
pub fn reference_transform(arena: &mut Arena<SchemaNode>, key: usize) {
  let item = arena.get_item(key);

  if item.reference.is_some() {
    return;
  }

  let mut item_new = item.clone();

  macro_rules! transform_member {
    ( $member: ident ) => {
      if let Some(sub_keys) = &item_new.$member {
        match sub_keys.len() {
          0 => {
            item_new.$member = None;
          }
          1 => {
            if item_new.reference.is_some() {
              // if a reference was already set we are not going to overwrite
              return;
            }
            item_new.reference = sub_keys.first().copied();
            item_new.$member = None;
          }
          _ => {}
        };
      }
    };
  }

  transform_member!(all_of);
  transform_member!(any_of);
  transform_member!(one_of);

  if item != &item_new {
    arena.set_item(key, item_new);
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{arena::Arena, schema::SchemaNode};

  #[test]
  fn test_reference_transform() {
    let mut arena = Arena::new();

    arena.add_item(SchemaNode {
      all_of: Some([10].into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      any_of: Some([11].into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      one_of: Some([12].into()),
      ..Default::default()
    });

    while arena.apply_transform(reference_transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      SchemaNode {
        reference: Some(10),
        ..Default::default()
      },
      SchemaNode {
        reference: Some(11),
        ..Default::default()
      },
      SchemaNode {
        reference: Some(12),
        ..Default::default()
      },
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
