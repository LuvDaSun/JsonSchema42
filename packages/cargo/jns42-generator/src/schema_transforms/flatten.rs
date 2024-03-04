use crate::models::{arena::Arena, schema::SchemaNode};
use std::iter::once;

pub fn transform(arena: &mut Arena<SchemaNode>, key: usize) {
  let item = arena.get_item(key);

  let mut item_new = item.clone();

  macro_rules! transform_member {
    ( $member: ident ) => {
      if let Some(sub_keys) = &item.$member {
        item_new.$member = Some(
          sub_keys
            .iter()
            .copied()
            .map(|sub_key| (sub_key, arena.get_item(sub_key)))
            .flat_map(|(sub_key, sub_item)| {
              if let Some(sub_sub_keys) = &sub_item.$member {
                sub_sub_keys.clone()
              } else {
                once(sub_key).collect()
              }
            })
            .collect(),
        );
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
  fn test_transform() {
    let mut arena = Arena::new();

    arena.add_item(SchemaNode {
      // 0
      all_of: Some([3, 4].into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      // 1
      all_of: Some([5, 6].into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      // 2
      all_of: Some([0, 1, 7, 8].into()),
      ..Default::default()
    });

    arena.add_item(Default::default()); // 3
    arena.add_item(Default::default()); // 4
    arena.add_item(Default::default()); // 5
    arena.add_item(Default::default()); // 6
    arena.add_item(Default::default()); // 7
    arena.add_item(Default::default()); // 8

    while arena.apply_transform(transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      SchemaNode {
        all_of: Some([3, 4].into()),
        ..Default::default()
      },
      SchemaNode {
        all_of: Some([5, 6].into()),
        ..Default::default()
      },
      SchemaNode {
        all_of: Some([3, 4, 5, 6, 7, 8].into()),
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
