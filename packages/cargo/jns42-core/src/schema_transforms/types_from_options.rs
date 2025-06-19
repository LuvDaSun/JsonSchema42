use crate::models::{SchemaArena, SchemaType};
use std::collections::BTreeSet;

/**
 * This transformer derives the type from options.
 */
pub fn transform(arena: &mut SchemaArena, key: usize) {
  let item = arena.get_item(key);

  if item
    .types
    .as_ref()
    .map(|value| value.len())
    .unwrap_or_default()
    > 0
  {
    return;
  }

  let Some(options) = &item.options else { return };
  if options.is_empty() {
    return;
  }

  let mut item_new = item.clone();

  let types: BTreeSet<_> = options
    .iter()
    .map(|option| match option {
      serde_json::Value::Null => SchemaType::Null,
      serde_json::Value::Bool(_) => SchemaType::Boolean,
      serde_json::Value::Number(_) => SchemaType::Number,
      serde_json::Value::String(_) => SchemaType::String,
      serde_json::Value::Array(_) => SchemaType::Array,
      serde_json::Value::Object(_) => SchemaType::Object,
    })
    .collect();

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
