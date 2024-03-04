use crate::models::{arena::Arena, schema::SchemaNode};
use std::iter::once;

pub fn flatten_transform(arena: &mut Arena<SchemaNode>, key: usize) {
  let item = arena.get_item(key);

  let mut item_new = item.clone();

  transform(arena, &mut item_new, |item| &item.all_of);
  transform(arena, &mut item_new, |item| &item.any_of);
  transform(arena, &mut item_new, |item| &item.one_of);

  if item != &item_new {
    arena.set_item(key, item_new);
  }

  fn transform(
    arena: &Arena<SchemaNode>,
    item: &mut SchemaNode,
    sub_keys_getter: impl Fn(&SchemaNode) -> &Option<Vec<usize>>,
  ) {
    if let Some(sub_keys) = sub_keys_getter(item) {
      item.all_of = Some(
        sub_keys
          .iter()
          .copied()
          .map(|sub_key| (sub_key, arena.get_item(sub_key)))
          .flat_map(|(sub_key, sub_item)| {
            if let Some(sub_sub_keys) = sub_keys_getter(sub_item) {
              sub_sub_keys.clone()
            } else {
              once(sub_key).collect()
            }
          })
          .collect(),
      );
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{arena::Arena, schema::SchemaNode};

  #[test]
  fn test_flatten_transform() {
    let mut arena = Arena::new();

    arena.add_item(SchemaNode {
      all_of: Some([4, 5].into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      all_of: Some([6, 7].into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      all_of: Some([1, 2].into()),
      ..Default::default()
    });

    arena.add_item(Default::default());
    arena.add_item(Default::default());
    arena.add_item(Default::default());
    arena.add_item(Default::default());
    arena.add_item(Default::default());
    arena.add_item(Default::default());

    while arena.apply_transform(flatten_transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      SchemaNode {
        all_of: Some([4, 5].into()),
        ..Default::default()
      },
      SchemaNode {
        all_of: Some([6, 7].into()),
        ..Default::default()
      },
      SchemaNode {
        all_of: Some([4, 5, 6, 7, 8, 9].into()),
        ..Default::default()
      },
      Default::default(),
      Default::default(),
      Default::default(),
      Default::default(),
      Default::default(),
      Default::default(),
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
