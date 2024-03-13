use crate::models::{arena::Arena, schema::SchemaNode};

/**
 * This transformer merges all sub schemas in allOf.
 *
 * ```yaml
 * - allOf
 *   - required: ["a", "b"]
 *     objectProperties:
 *       a: 100
 *       b: 200
 *   - objectProperties:
 *       b: 300
 *       c: 400
 * ```
 *
 * will become
 *
 * ```yaml
 * - required: ["a", "b"]
 *   objectProperties:
 *     a: 100
 *     b: 1
 *     c: 400
 * - allOf
 *   - 200
 *   - 300
 * ```
 */
pub fn transform(arena: &mut Arena<SchemaNode>, key: usize) {
  let item = arena.get_item(key);

  let Some(sub_keys) = item.all_of.clone() else {
    return;
  };

  if sub_keys.len() < 2 {
    return;
  };

  // things we cannot merge
  if item
    .types
    .as_ref()
    .map(|value| value.len() > 1)
    .unwrap_or_default()
    || item.reference.is_some()
    || item.any_of.is_some()
    || item.one_of.is_some()
    || item.r#if.is_some()
    || item.then.is_some()
    || item.r#else.is_some()
    || item.not.is_some()
  {
    return;
  }

  let mut item_new = SchemaNode {
    all_of: None,
    ..item.clone()
  };

  for sub_key in sub_keys {
    let sub_item = arena.get_item(sub_key);

    // things we cannot merge
    if sub_item
      .types
      .as_ref()
      .map(|value| value.len() > 1)
      .unwrap_or_default()
      || sub_item.reference.is_some()
      || sub_item.all_of.is_some()
      || sub_item.any_of.is_some()
      || sub_item.one_of.is_some()
      || sub_item.r#if.is_some()
      || sub_item.then.is_some()
      || sub_item.r#else.is_some()
      || sub_item.not.is_some()
    {
      return;
    }

    item_new = SchemaNode {
      types: None,
      map_properties: None,
      array_items: None,
      property_names: None,
      contains: None,
      tuple_items: None,
      object_properties: None,
      pattern_properties: None,
      dependent_schemas: None,
      options: None,
      required: None,
      minimum_inclusive: None,
      minimum_exclusive: None,
      maximum_inclusive: None,
      maximum_exclusive: None,
      multiple_of: None,
      minimum_length: None,
      maximum_length: None,
      value_pattern: None,
      value_format: None,
      minimum_items: None,
      maximum_items: None,
      unique_items: None,
      minimum_properties: None,
      maximum_properties: None,

      ..item_new
    }
  }

  arena.replace_item(key, item_new);
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{arena::Arena, schema::SchemaNode};

  #[test]
  fn test_transform() {
    let mut arena = Arena::new();

    arena.add_item(SchemaNode {
      required: Some(["a"].map(|value| value.to_string()).into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      required: Some(["a", "b"].map(|value| value.to_string()).into()),
      not: Some(0),
      ..Default::default()
    });

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      SchemaNode {
        required: Some(["a"].map(|value| value.to_string()).into()),
        ..Default::default()
      },
      SchemaNode {
        required: Some(["b"].map(|value| value.to_string()).into()),
        ..Default::default()
      },
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
