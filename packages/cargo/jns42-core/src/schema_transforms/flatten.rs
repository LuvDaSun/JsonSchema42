macro_rules! generate_mod {
  ( $member: ident ) => {
    pub mod $member {
      use crate::models::SchemaArena;
      use std::iter;

      pub fn transform(arena: &mut SchemaArena, key: u32) {
        let item = arena.get_item(key);

        let mut item_new = item.clone();
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
                  iter::once(sub_key).collect()
                }
              })
              .collect(),
          );
        }

        if item != &item_new {
          arena.replace_item(key, item_new);
        }
      }

      #[cfg(test)]
      mod tests {
        use super::*;
        use crate::models::ArenaSchemaItem;

        #[test]
        fn test_transform() {
          let mut arena = SchemaArena::new();

          arena.add_item(ArenaSchemaItem {
            // 0
            $member: Some([3, 4].into()),
            ..Default::default()
          });

          arena.add_item(ArenaSchemaItem {
            // 1
            $member: Some([5, 6].into()),
            ..Default::default()
          });

          arena.add_item(ArenaSchemaItem {
            // 2
            $member: Some([0, 1, 7, 8].into()),
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
            ArenaSchemaItem {
              $member: Some([3, 4].into()),
              ..Default::default()
            },
            ArenaSchemaItem {
              $member: Some([5, 6].into()),
              ..Default::default()
            },
            ArenaSchemaItem {
              $member: Some([3, 4, 5, 6, 7, 8].into()),
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
    }
  };
}

generate_mod!(all_of);
generate_mod!(any_of);
generate_mod!(one_of);
