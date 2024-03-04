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
pub fn transform(arena: &mut Arena<SchemaNode>, key: usize) {
  let item = arena.get_item(key);

  if item.reference.is_some() {
    return;
  }

  let mut item_new = item.clone();

  transform_sub(&mut item_new.all_of, &mut item_new.reference);
  transform_sub(&mut item_new.any_of, &mut item_new.reference);
  transform_sub(&mut item_new.one_of, &mut item_new.reference);

  if item != &item_new {
    arena.set_item(key, item_new);
  }

  fn transform_sub(sub_keys: &mut Option<Vec<usize>>, reference: &mut Option<usize>) {
    if let Some(sub_keys_some) = sub_keys {
      match sub_keys_some.len() {
        0 => {
          *sub_keys = None;
        }
        1 => {
          if reference.is_some() {
            // if a reference was already set we are not going to overwrite
            return;
          }
          *reference = sub_keys_some.first().copied();
          *sub_keys = None;
        }
        _ => {}
      };
    }
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

    while arena.apply_transform(transform) > 0 {
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
