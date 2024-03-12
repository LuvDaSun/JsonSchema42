pub mod reference {
  use crate::models::{arena::Arena, schema::SchemaNode};

  pub fn transform(arena: &mut Arena<SchemaNode>, key: usize) {
    let item = arena.get_item(key);

    todo!()
  }

  #[cfg(test)]
  mod tests {
    use super::*;

    #[test]
    fn test_transform() {
      let mut arena = Arena::new();

      arena.add_item(SchemaNode {
        ..Default::default()
      });

      arena.add_item(SchemaNode {
        minimum_inclusive: Some(0.0),
        reference: Some(0),
        ..Default::default()
      });

      while arena.apply_transform(transform) > 0 {
        //
      }

      let actual: Vec<_> = arena.iter().cloned().collect();
      let expected = vec![
        SchemaNode {
          ..Default::default()
        },
        SchemaNode {
          reference: Some(3),
          ..Default::default()
        },
        SchemaNode {
          minimum_inclusive: Some(0.0),
          ..Default::default()
        },
        SchemaNode {
          parent: Some(0),
          all_of: Some([0, 2].into()),
          ..Default::default()
        },
      ];

      assert_eq!(actual, expected)
    }
  }
}
