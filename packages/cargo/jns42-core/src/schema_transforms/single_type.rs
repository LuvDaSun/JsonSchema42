use crate::models::{arena::Arena, schema::SchemaItem};
use std::iter::once;

/**
 * This transformer makes the types array into a single type. This is achieved by creating a
 * few new types with a single type and putting them in a oneOf.
 *
 * ```yaml
 * - types:
 *   - number
 *   - string
 * ```
 *
 * will become
 *
 * ```yaml
 * - oneOf:
 *   - 1
 *   - 2
 * - parent: 0
 *   types:
 *   - number
 * - parent: 0
 *   types:
 *   - string
 * ```
 */
pub fn transform(arena: &mut Arena<SchemaItem>, key: usize) {
  let item = arena.get_item(key);

  let Some(types) = &item.types else {
    return;
  };

  match types.len() {
    0 => {
      // if types is empty then we should just set it to None
      let item = SchemaItem {
        types: None,
        ..item.clone()
      };
      arena.replace_item(key, item);
    }
    1 => {
      // only one type, this is what we want! let's do nothing
    }
    _ => {
      let item = SchemaItem {
        types: None,
        one_of: Some(
          types
            .clone()
            .into_iter()
            .map(|r#type| {
              arena.add_item(SchemaItem {
                parent: Some(key),
                name: Some(r#type.to_string()),
                types: Some(once(r#type).collect()),
                ..Default::default()
              })
            })
            .collect(),
        ),
        ..Default::default()
      };
      arena.replace_item(key, item);
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{
    arena::Arena,
    schema::{SchemaItem, SchemaType},
  };

  #[test]
  fn test_transform() {
    let mut arena = Arena::new();

    arena.add_item(SchemaItem {
      types: Some(vec![SchemaType::String, SchemaType::Number]),
      ..Default::default()
    });

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected = vec![
      SchemaItem {
        one_of: Some([1, 2].into()),
        ..Default::default()
      },
      SchemaItem {
        parent: Some(0),
        name: Some("string".to_string()),
        types: Some(vec![SchemaType::String]),
        ..Default::default()
      },
      SchemaItem {
        parent: Some(0),
        name: Some("number".to_string()),
        types: Some(vec![SchemaType::Number]),
        ..Default::default()
      },
    ];

    assert_eq!(actual, expected)
  }
}
