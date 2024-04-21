use crate::models::{ArenaSchemaItem, SchemaArena};
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
pub fn transform(arena: &mut SchemaArena, key: usize) {
  let item = arena.get_item(key);

  // ew got nothing to do if there are no types
  let Some(types) = &item.types else {
    return;
  };

  // we would overwrite this, so let's not!
  if item.one_of.is_some() {
    return;
  }

  match types.len() {
    0 => {
      // if types is empty then we should just set it to None
      let item = ArenaSchemaItem {
        types: None,
        ..item.clone()
      };
      arena.replace_item(key, item);
    }
    1 => {
      // only one type, this is what we want! let's do nothing
    }
    _ => {
      // we will be creating a new schema with every type as an element in one_of
      let item = item.clone();
      let item = ArenaSchemaItem {
        types: None,
        one_of: Some(
          types
            .clone()
            .into_iter()
            .map(|r#type| {
              arena.add_item(ArenaSchemaItem {
                parent: Some(key),
                name: Some(r#type.to_string()),
                types: Some(once(r#type).collect()),
                ..Default::default()
              })
            })
            .collect(),
        ),
        ..item
      };
      arena.replace_item(key, item);
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::SchemaType;

  #[test]
  fn test_transform() {
    let mut arena = SchemaArena::new();

    arena.add_item(ArenaSchemaItem {
      types: Some(vec![SchemaType::String, SchemaType::Number]),
      ..Default::default()
    });

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected = vec![
      ArenaSchemaItem {
        one_of: Some([1, 2].into()),
        ..Default::default()
      },
      ArenaSchemaItem {
        parent: Some(0),
        name: Some("string".to_string()),
        types: Some(vec![SchemaType::String]),
        ..Default::default()
      },
      ArenaSchemaItem {
        parent: Some(0),
        name: Some("number".to_string()),
        types: Some(vec![SchemaType::Number]),
        ..Default::default()
      },
    ];

    assert_eq!(actual, expected)
  }
}
