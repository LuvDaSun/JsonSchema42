/**
 * This transformer makes a reference if there is a single allOf, anyOf or oneOf.
 *
 * ```yaml
 * - oneOf:
 *   - 1
 * ```
 *
 * will become
 *
 * ```yaml
 * - reference: 1
 * ```
 */
macro_rules! generate_mod {
  ( $member: ident ) => {
    pub mod $member {
      use $crate::models::{arena::Arena, schema::SchemaNode};

      pub fn transform(arena: &mut Arena<SchemaNode>, key: usize) {
        let item = arena.get_item(key);

        if let Some(sub_keys) = &item.$member {
          match sub_keys.len() {
            0 => {
              let mut item = item.clone();
              item.$member = None;
              arena.replace_item(key, item);
            }
            1 => {
              if item.reference.is_some() {
                // if a reference was already set we are not going to overwrite
                return;
              }
              let mut item = item.clone();
              item.reference = sub_keys.first().copied();
              item.$member = None;
              arena.replace_item(key, item);
            }
            _ => {}
          };
        }
      }

      #[cfg(test)]
      mod tests {
        use super::*;
        use $crate::models::{arena::Arena, schema::SchemaNode};

        #[test]
        fn test_transform() {
          let mut arena = Arena::new();

          arena.add_item(SchemaNode {
            $member: Some([10].into()),
            ..Default::default()
          });

          while arena.apply_transform(transform) > 0 {
            //
          }

          let actual: Vec<_> = arena.iter().cloned().collect();
          let expected: Vec<_> = [SchemaNode {
            reference: Some(10),
            ..Default::default()
          }]
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
