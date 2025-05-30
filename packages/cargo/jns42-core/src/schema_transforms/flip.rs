/**
 * Flips oneOf and allOf types. If an allOf has a oneOf in it, this transform
 * will flip em! It will become a oneOf with a few allOfs in it.
 *
 * We can generate code for a oneOf with some allOfs in it, but for an allOf with
 * a bunch of oneOfs, we cannot generate code.
 *
 * this

```yaml
- allOf:
    - 1
    - 2
    - 3
- type: object
- oneOf:
    - 100
    - 200
- oneOf:
    - 300
    - 400
```

will become

```yaml
- oneOf:
    - 2
    - 3
    - 4
    - 5
- type: object
- allOf:
    - 1
    - 100
    - 300
- allOf:
    - 1
    - 100
    - 400
- allOf:
    - 1
    - 200
    - 300
- allOf:
    - 1
    - 200
    - 400
```
 */

macro_rules! generate_mod {
  ( $name: ident, $base_member: ident, $other_member: ident  ) => {
    pub mod $name {
      use crate::models::{ArenaSchemaItem, SchemaArena};
      use crate::utilities::product;
      use std::collections::{BTreeMap, BTreeSet};

      pub fn transform(arena: &mut SchemaArena, key: usize) {
        let item = arena.get_item(key);

        let Some(base_keys) = &item.$base_member else {
          return;
        };

        // we need 2 to be able to merge!
        if base_keys.len() < 2 {
          return;
        }

        // resolve the items
        let base_items: BTreeMap<_, _> = base_keys
          .iter()
          .map(|sub_key| (*sub_key, arena.get_item(*sub_key)))
          .collect();

        // collect all of the sub sub keys
        let other_keys: BTreeMap<_, _> = base_items
          .iter()
          .filter_map(|(sub_key, sub_item)| {
            sub_item
              .$other_member
              .as_ref()
              .map(|other_keys| (*sub_key, other_keys.clone()))
          }) // TODO
          .collect();

        // if there are no sub sub keys then we are done
        if other_keys.is_empty() {
          return;
        }

        // filter out all entries that have no sub sub
        let sub_keys: Vec<_> = base_items
          .keys()
          .copied()
          .filter(|sub_key| !other_keys.contains_key(sub_key))
          .collect();

        let mut sub_keys_new = BTreeSet::new();
        let item = item.clone();
        for set in product(other_keys.values().cloned()) {
          let sub_item = ArenaSchemaItem {
            $base_member: Some(
              sub_keys
                .iter()
                .copied()
                .chain(set.iter().copied())
                .collect(),
            ),
            ..Default::default()
          };
          let sub_key = arena.add_item(sub_item);
          assert!(sub_keys_new.insert(sub_key));
        }

        let item = ArenaSchemaItem {
          $base_member: None,
          $other_member: Some(sub_keys_new),
          ..item
        };

        arena.replace_item(key, item);
      }

      #[cfg(test)]
      mod tests {
        use super::*;

        #[test]
        fn test_transform() {
          let mut arena = SchemaArena::new();

          arena.add_item(Default::default()); // 0
          arena.add_item(Default::default()); // 1
          arena.add_item(Default::default()); // 2
          arena.add_item(Default::default()); // 3
          arena.add_item(Default::default()); // 4

          arena.add_item(ArenaSchemaItem {
            $other_member: Some([1, 2].into()),
            ..Default::default()
          }); // 5
          arena.add_item(ArenaSchemaItem {
            $other_member: Some([3, 4].into()),
            ..Default::default()
          }); // 6
          arena.add_item(ArenaSchemaItem {
            $base_member: Some([0, 5, 6].into()),
            ..Default::default()
          }); // 7

          while arena.apply_transform(transform) > 0 {
            //
          }

          let actual: Vec<_> = arena.iter().cloned().collect();
          let expected = vec![
            Default::default(), // 0
            Default::default(), // 1
            Default::default(), // 2
            Default::default(), // 3
            Default::default(), // 4
            ArenaSchemaItem {
              $other_member: Some([1, 2].into()),
              ..Default::default()
            }, // 5
            ArenaSchemaItem {
              $other_member: Some([3, 4].into()),
              ..Default::default()
            }, // 6
            ArenaSchemaItem {
              $other_member: Some([8, 9, 10, 11].into()),
              ..Default::default()
            }, // 7
            ArenaSchemaItem {
              $base_member: Some([0, 1, 3].into()),
              ..Default::default()
            }, // 8
            ArenaSchemaItem {
              $base_member: Some([0, 1, 4].into()),
              ..Default::default()
            }, // 9
            ArenaSchemaItem {
              $base_member: Some([0, 2, 3].into()),
              ..Default::default()
            }, // 10
            ArenaSchemaItem {
              $base_member: Some([0, 2, 4].into()),
              ..Default::default()
            }, // 11
          ];

          assert_eq!(actual, expected)
        }
      }
    }
  };
}

generate_mod!(all_of_one_of, all_of, one_of);
generate_mod!(all_of_any_of, all_of, any_of);

generate_mod!(any_of_all_of, any_of, all_of);
generate_mod!(any_of_one_of, any_of, one_of);

generate_mod!(one_of_all_of, one_of, all_of);
generate_mod!(one_of_any_of, one_of, any_of);
