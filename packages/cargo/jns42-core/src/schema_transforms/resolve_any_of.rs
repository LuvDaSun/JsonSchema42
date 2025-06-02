use crate::models::{ArenaSchemaItem, SchemaArena};
use itertools::Itertools;
use std::collections::BTreeMap;
use std::{cell::RefCell, collections::BTreeSet};

pub fn transform(arena: &mut SchemaArena, key: u32) {
  let item = arena.get_item(key).clone();

  let Some(sub_keys) = item.any_of.clone() else {
    return;
  };

  if sub_keys.len() < 2 {
    return;
  };

  // things we cannot merge
  if item.types.is_some()
    || item.reference.is_some()
    || item.all_of.is_some()
    || item.one_of.is_some()
    || item.r#if.is_some()
    || item.then.is_some()
    || item.r#else.is_some()
    || item.not.is_some()
  {
    return;
  }

  let sub_entries: BTreeMap<_, _> = sub_keys
    .into_iter()
    .map(|key| (key, arena.get_item(key).clone()))
    .collect();

  for sub_item in sub_entries.values() {
    if sub_item
      .types
      .as_ref()
      .map(|value| value.len())
      .unwrap_or_default()
      != 1
      || item.reference.is_some()
      || item.all_of.is_some()
      || item.one_of.is_some()
      || item.r#if.is_some()
      || item.then.is_some()
      || item.r#else.is_some()
      || item.not.is_some()
    {
      return;
    }
  }

  let grouped_sub_entries = sub_entries
    .into_iter()
    .map(|(key, item)| (*item.types.as_ref().unwrap().first().unwrap(), key, item))
    .sorted_by_key(|(r#type, _key, _item)| *r#type)
    .chunk_by(|(r#type, _key, _item)| *r#type);

  let grouped_sub_entries = grouped_sub_entries
    .into_iter()
    .map(|(r#type, group)| (r#type, group.map(|(_type, key, item)| (key, item))));

  let mut sub_keys_new = BTreeSet::new();

  // this is so that the following closures don't have to be FnMut
  let arena = RefCell::new(arena);

  let merge_key = |key: &u32, other_key: &u32| {
    if key == other_key {
      return *key;
    }

    let item_new = ArenaSchemaItem {
      any_of: Some([*key, *other_key].into()),
      ..Default::default()
    };

    arena.borrow_mut().add_item(item_new)
  };

  for (r#type, sub_entries) in grouped_sub_entries.into_iter() {
    let sub_entries: BTreeMap<_, _> = sub_entries.collect();
    if sub_entries.len() < 2 {
      for sub_key in sub_entries.keys() {
        sub_keys_new.insert(*sub_key);
      }
      continue;
    }

    let mut sub_item_new = ArenaSchemaItem {
      exact: Some(false),
      types: Some(vec![r#type]),
      ..Default::default()
    };

    for sub_item in sub_entries.values() {
      sub_item_new = sub_item_new.intersection(sub_item, &merge_key);
    }

    let sub_key_new = arena.borrow_mut().add_item(sub_item_new);
    sub_keys_new.insert(sub_key_new);
  }

  let item_new = ArenaSchemaItem {
    exact: Some(false),
    any_of: None,
    one_of: Some(sub_keys_new),
    ..item.clone()
  };

  arena.borrow_mut().replace_item(key, item_new);
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::SchemaType;

  #[test]
  fn test_utility() {
    let mut arena = SchemaArena::from_iter([
      ArenaSchemaItem {
        types: Some([SchemaType::Never].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::Any].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        any_of: Some([2, 0].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        any_of: Some([2, 1].into()),
        ..Default::default()
      }, // 4
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      ArenaSchemaItem {
        types: Some([SchemaType::Never].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::Any].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([2, 0].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([2, 1].into()),
        ..Default::default()
      }, // 4
    ]
    .into();

    assert_eq!(actual, expected)
  }

  #[test]
  fn test_primitive() {
    let mut arena = SchemaArena::from_iter([
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        any_of: Some([0, 1].into()),
        ..Default::default()
      }, // 4
      ArenaSchemaItem {
        any_of: Some([2, 3].into()),
        ..Default::default()
      }, // 5
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([0, 1].into()),
        ..Default::default()
      }, // 4
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([6].into()),
        ..Default::default()
      }, // 5
      ArenaSchemaItem {
        exact: Some(false),
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 6
    ]
    .into();

    assert_eq!(actual, expected)
  }

  #[test]
  fn test_tuple() {
    let mut arena = SchemaArena::from_iter([
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        types: Some([SchemaType::Array].into()),
        tuple_items: Some([0, 1].into()),
        ..Default::default()
      }, // 4
      ArenaSchemaItem {
        types: Some([SchemaType::Array].into()),
        tuple_items: Some([2, 3].into()),
        ..Default::default()
      }, // 5
      ArenaSchemaItem {
        any_of: Some([4, 5].into()),
        ..Default::default()
      }, // 6
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        types: Some([SchemaType::Array].into()),
        tuple_items: Some([0, 1].into()),
        ..Default::default()
      }, // 4
      ArenaSchemaItem {
        types: Some([SchemaType::Array].into()),
        tuple_items: Some([2, 3].into()),
        ..Default::default()
      }, // 5
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([9].into()),
        ..Default::default()
      }, // 6
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([0, 2].into()),
        ..Default::default()
      }, // 7
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([10].into()),
        ..Default::default()
      }, // 8
      ArenaSchemaItem {
        exact: Some(false),
        types: Some([SchemaType::Array].into()),
        tuple_items: Some([7, 8].into()),
        ..Default::default()
      }, // 9
      ArenaSchemaItem {
        exact: Some(false),
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 10
    ]
    .into();

    assert_eq!(actual, expected)
  }

  #[test]
  fn test_array() {
    let mut arena = SchemaArena::from_iter([
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::Array].into()),
        array_items: Some(0),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        types: Some([SchemaType::Array].into()),
        array_items: Some(1),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        any_of: Some([2, 3].into()),
        ..Default::default()
      }, // 4
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::Array].into()),
        array_items: Some(0),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        types: Some([SchemaType::Array].into()),
        array_items: Some(1),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([6].into()),
        ..Default::default()
      }, // 4
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([0, 1].into()),
        ..Default::default()
      }, // 5
      ArenaSchemaItem {
        exact: Some(false),
        types: Some([SchemaType::Array].into()),
        array_items: Some(5),
        ..Default::default()
      }, // 6
    ]
    .into();

    assert_eq!(actual, expected)
  }

  #[test]
  fn test_object() {
    let mut arena = SchemaArena::from_iter([
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        object_properties: Some([("a".to_owned(), 0), ("b".to_owned(), 1)].into()),
        ..Default::default()
      }, // 4
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        required: Some(["b".to_owned()].into()),
        object_properties: Some([("b".to_owned(), 2), ("c".to_owned(), 3)].into()),
        ..Default::default()
      }, // 5
      ArenaSchemaItem {
        any_of: Some([4, 5].into()),
        ..Default::default()
      }, // 6
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        object_properties: Some([("a".to_owned(), 0), ("b".to_owned(), 1)].into()),
        ..Default::default()
      }, // 4
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        required: Some(["b".to_owned()].into()),
        object_properties: Some([("b".to_owned(), 2), ("c".to_owned(), 3)].into()),
        ..Default::default()
      }, // 5
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([8].into()),
        ..Default::default()
      }, // 6
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([9].into()),
        ..Default::default()
      }, // 7
      ArenaSchemaItem {
        exact: Some(false),
        types: Some([SchemaType::Object].into()),
        required: Some(["b".to_owned()].into()),
        object_properties: Some(
          [
            ("a".to_owned(), 0),
            ("b".to_owned(), 7),
            ("c".to_owned(), 3),
          ]
          .into(),
        ),
        ..Default::default()
      }, // 8
      ArenaSchemaItem {
        exact: Some(false),
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 9
    ]
    .into();

    assert_eq!(actual, expected)
  }

  #[test]
  fn test_map() {
    let mut arena = SchemaArena::from_iter([
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        property_names: Some(0),
        map_properties: Some(1),
        ..Default::default()
      }, // 4
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        property_names: Some(2),
        map_properties: Some(3),
        ..Default::default()
      }, // 5
      ArenaSchemaItem {
        any_of: Some([4, 5].into()),
        ..Default::default()
      }, // 6
    ]);

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        types: Some([SchemaType::Number].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        property_names: Some(0),
        map_properties: Some(1),
        ..Default::default()
      }, // 4
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        property_names: Some(2),
        map_properties: Some(3),
        ..Default::default()
      }, // 5
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([9].into()),
        ..Default::default()
      }, // 6
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([10].into()),
        ..Default::default()
      }, // 7
      ArenaSchemaItem {
        exact: Some(false),
        one_of: Some([1, 3].into()),
        ..Default::default()
      }, // 8
      ArenaSchemaItem {
        exact: Some(false),
        types: Some([SchemaType::Object].into()),
        property_names: Some(7),
        map_properties: Some(8),
        ..Default::default()
      }, // 9
      ArenaSchemaItem {
        exact: Some(false),
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 10
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
