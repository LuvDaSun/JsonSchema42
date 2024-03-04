use crate::models::{arena::Arena, schema::SchemaNode};

pub fn flatten_transform(arena: &mut Arena<SchemaNode>, key: usize) {
  let item = arena.get_item(key);

  let mut item_new = item.clone();

  if let Some(sub_keys) = &item.all_of {
    item_new.all_of = Some(
      sub_keys
        .iter()
        .copied()
        .map(|sub_key| (sub_key, arena.get_item(*sub_key)))
        .flat_map(|(sub_key, sub_item)| Some(*sub_key))
        .collect(),
    );
  }

  if let Some(sub_keys) = &item.any_of {
    //
  }

  if let Some(sub_keys) = &item.one_of {
    //
  }

  if item != &item_new {
    arena.set_item(key, item_new);
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
      all_of: Some([100, 200].into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      any_of: Some([300, 400].into()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      one_of: Some([0, 1, 500, 600].into()),
      ..Default::default()
    });

    while arena.apply_transform(flatten_transform) > 0 {
      //
    }

    let actual: Vec<_> = arena.iter().cloned().collect();
    let expected: Vec<_> = [
      SchemaNode {
        all_of: Some([100, 200].into()),
        ..Default::default()
      },
      SchemaNode {
        all_of: Some([300, 400].into()),
        ..Default::default()
      },
      SchemaNode {
        all_of: Some([100, 200, 300, 400, 500, 600].into()),
        ..Default::default()
      },
    ]
    .into();

    assert_eq!(actual, expected)
  }
}
