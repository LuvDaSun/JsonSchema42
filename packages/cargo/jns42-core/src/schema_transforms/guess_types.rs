use crate::models::{SchemaArena, SchemaType};
use std::collections::BTreeSet;

/**
 * This transformer derives the type from options.
 */
pub fn transform(arena: &mut SchemaArena, key: usize) {
  let item = arena.get_item(key);

  if item.types.is_some() {
    return;
  }

  let mut types = BTreeSet::new();

  if let Some(options) = &item.options {
    for option in options {
      match option {
        serde_json::Value::Null => {
          types.insert(SchemaType::Null);
        }
        serde_json::Value::Bool(_) => {
          types.insert(SchemaType::Boolean);
        }
        serde_json::Value::Number(_) => {
          types.insert(SchemaType::Number);
          types.insert(SchemaType::Integer);
        }
        serde_json::Value::String(_) => {
          types.insert(SchemaType::String);
        }
        serde_json::Value::Array(_) => {
          types.insert(SchemaType::Array);
        }
        serde_json::Value::Object(_) => {
          types.insert(SchemaType::Object);
        }
      };
    }
  }

  if item.array_items.is_some() || item.tuple_items.is_some() {
    types.insert(SchemaType::Array);
  }

  if item.pattern_properties.is_some()
    || item.property_names.is_some()
    || item.object_properties.is_some()
    || item.map_properties.is_some()
    || item.required.is_some()
  {
    types.insert(SchemaType::Object);
  }

  // TODO maybe guess some more?

  let mut item_new = item.clone();

  item_new.types = Some(types.into_iter().collect());

  if *item == item_new {
    return;
  }

  arena.replace_item(key, item_new);
}

#[cfg(test)]
mod tests {
  use crate::models::ArenaSchemaItem;

  use super::*;

  #[test]
  fn test_transform() {
    let mut arena = SchemaArena::new();

    arena.add_item(ArenaSchemaItem {
      options: Some([serde_json::Value::Null].into()),
      ..Default::default()
    });

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected = vec![ArenaSchemaItem {
      types: Some([SchemaType::Null].into()),
      options: Some([serde_json::Value::Null].into()),
      ..Default::default()
    }];

    assert_eq!(actual, expected)
  }
}
