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

  // we keep the found reference here! This is se from allOf, anyOf and oneOf. If it is already
  // set, then this means that we found 2! in that case we don't change anything.
  let mut reference = None;

  if let Some(sub_keys) = &item.all_of {
    match sub_keys.len() {
      0 => {
        let item = SchemaNode {
          all_of: None,
          ..item.clone()
        };
        arena.set_item(key, item);
        return;
      }
      1 => {
        if reference.is_some() {
          return;
        }
        reference = sub_keys.first().copied();
      }
      _ => return,
    };
  }

  if let Some(sub_keys) = &item.any_of {
    match sub_keys.len() {
      0 => {
        let item = SchemaNode {
          any_of: None,
          ..item.clone()
        };
        arena.set_item(key, item);
        return;
      }
      1 => {
        if reference.is_some() {
          return;
        }
        reference = sub_keys.first().copied();
      }
      _ => return,
    };
  }

  if let Some(sub_keys) = &item.one_of {
    match sub_keys.len() {
      0 => {
        let item = SchemaNode {
          one_of: None,
          ..item.clone()
        };
        arena.set_item(key, item);
        return;
      }
      1 => {
        if reference.is_some() {
          return;
        }
        reference = sub_keys.first().copied();
      }
      _ => return,
    };
  }

  let Some(reference) = reference else {
    return;
  };

  let item = SchemaNode {
    reference: Some(reference),
    all_of: None,
    any_of: None,
    one_of: None,
    ..item.clone()
  };
  arena.set_item(key, item);
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
