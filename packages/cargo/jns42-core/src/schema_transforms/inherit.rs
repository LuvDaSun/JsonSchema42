macro_rules! generate_mod {
  ($member: ident) => {
    pub mod $member {
      use crate::models::{arena::Arena, schema::SchemaItem};

      /**
       * This function inherits inheritable properties from a item to it's $member items. This
       * is done by stripping inheritable fields from the item and adding them to a base item.
       * The $member-s are then replaced by an all of of the original value and the base item.
       *
       * example:
       * ```yaml
       * - required:
       *   - a
       * - required:
       *   - b
       * - $member:
       *   - 0
       *   - 1
       *   required:
       *   - c
       * ```
       *
       * will become
       *
       * ```yaml
       * - required
       *   - a
       * - required
       *   - b
       * - $member
       *   - 4
       *   - 5
       * - required:
       *   - c
       * - allOf
       *   - 0
       *   - 3
       * - allOf
       *   - 1
       *   - 3
       * ```
       *
       */
      pub fn transform(arena: &mut Arena<SchemaItem>, key: usize) {
        let item = arena.get_item(key);

        let Some(sub_keys) = item.$member.clone() else {
          return;
        };

        // if we have at least on inheritable property
        if item.types.is_none()
          && item.map_properties.is_none()
          && item.array_items.is_none()
          && item.property_names.is_none()
          && item.contains.is_none()
          && item.tuple_items.is_none()
          && item.object_properties.is_none()
          && item.pattern_properties.is_none()
          && item.dependent_schemas.is_none()
          && item.options.is_none()
          && item.required.is_none()
          && item.minimum_inclusive.is_none()
          && item.minimum_exclusive.is_none()
          && item.maximum_inclusive.is_none()
          && item.maximum_exclusive.is_none()
          && item.multiple_of.is_none()
          && item.minimum_length.is_none()
          && item.maximum_length.is_none()
          && item.value_pattern.is_none()
          && item.value_format.is_none()
          && item.minimum_items.is_none()
          && item.maximum_items.is_none()
          && item.unique_items.is_none()
          && item.minimum_properties.is_none()
          && item.maximum_properties.is_none()
        {
          return;
        }

        let item = item.clone();

        // the base item has no meta or non inheritable properties
        let base_item_new = SchemaItem {
          name: None,
          primary: None,
          parent: None,
          id: None,
          title: None,
          description: None,
          examples: None,
          deprecated: None,
          reference: None,
          all_of: None,
          any_of: None,
          one_of: None,
          r#if: None,
          then: None,
          r#else: None,
          not: None,

          ..item.clone()
        };

        let base_key_new = arena.add_item(base_item_new);

        let sub_keys_new = sub_keys
          .into_iter()
          .map(|sub_key| {
            let sub_item_new = SchemaItem {
              all_of: Some([sub_key, base_key_new].into()),

              ..Default::default()
            };

            arena.add_item(sub_item_new)
          })
          .collect();

        // the new sub item is an all of of the base and the previous sub item

        let item_new = SchemaItem {
          $member: Some(sub_keys_new),

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

          ..item.clone()
        };

        arena.replace_item(key, item_new);
      }

      #[cfg(test)]
      mod tests {
        use super::*;

        #[test]
        fn test_transform() {
          let mut arena = Arena::new();

          arena.add_item(SchemaItem {
            required: Some(["a"].map(|value| value.into()).into()),
            ..Default::default()
          });

          arena.add_item(SchemaItem {
            required: Some(["b"].map(|value| value.into()).into()),
            ..Default::default()
          });

          arena.add_item(SchemaItem {
            $member: Some([0, 1].into()),
            required: Some(["c"].map(|value| value.into()).into()),
            ..Default::default()
          });

          while arena.apply_transform(transform) > 0 {
            //
          }

          let actual: Vec<_> = arena.iter().cloned().collect();
          let expected = vec![
            SchemaItem {
              required: Some(["a"].map(|value| value.into()).into()),
              ..Default::default()
            },
            SchemaItem {
              required: Some(["b"].map(|value| value.into()).into()),
              ..Default::default()
            },
            SchemaItem {
              $member: Some([4, 5].into()),
              ..Default::default()
            },
            SchemaItem {
              required: Some(["c"].map(|value| value.into()).into()),
              ..Default::default()
            },
            SchemaItem {
              all_of: Some([0, 3].into()),
              ..Default::default()
            },
            SchemaItem {
              all_of: Some([1, 3].into()),
              ..Default::default()
            },
          ];

          assert_eq!(actual, expected)
        }
      }
    }
  };
}

generate_mod!(all_of);
generate_mod!(any_of);
generate_mod!(one_of);

pub mod reference {
  use crate::models::{arena::Arena, schema::SchemaItem};

  /**
   * This function inherits inheritable properties from a item to a referenced item. This
   * is done by stripping inheritable fields from the item and adding them to a base item.
   * The reference is then replaces by an all of of the original reference and the base item.
   *
   * example:
   * ```yaml
   * - required:
   *   - a
   *   - b
   * - reference: 0
   *   required:
   *   - b
   *   - c
   * ```
   *
   * will become
   *
   * ```yaml
   * - required
   *   - a
   *   - b
   * - reference: 3
   * - required:
   *   - b
   *   - c
   * - allOf
   *   - 0
   *   - 2
   * ```
   *
   */
  pub fn transform(arena: &mut Arena<SchemaItem>, key: usize) {
    let item = arena.get_item(key);

    let Some(sub_key) = item.reference else {
      return;
    };

    // if we have at least on inheritable property
    if item.types.is_none()
      && item.map_properties.is_none()
      && item.array_items.is_none()
      && item.property_names.is_none()
      && item.contains.is_none()
      && item.tuple_items.is_none()
      && item.object_properties.is_none()
      && item.pattern_properties.is_none()
      && item.dependent_schemas.is_none()
      && item.options.is_none()
      && item.required.is_none()
      && item.minimum_inclusive.is_none()
      && item.minimum_exclusive.is_none()
      && item.maximum_inclusive.is_none()
      && item.maximum_exclusive.is_none()
      && item.multiple_of.is_none()
      && item.minimum_length.is_none()
      && item.maximum_length.is_none()
      && item.value_pattern.is_none()
      && item.value_format.is_none()
      && item.minimum_items.is_none()
      && item.maximum_items.is_none()
      && item.unique_items.is_none()
      && item.minimum_properties.is_none()
      && item.maximum_properties.is_none()
    {
      return;
    }

    let item = item.clone();

    // the base item has no meta or non inheritable properties
    let base_item_new = SchemaItem {
      name: None,
      primary: None,
      parent: None,
      id: None,
      title: None,
      description: None,
      examples: None,
      deprecated: None,
      reference: None,
      all_of: None,
      any_of: None,
      one_of: None,
      r#if: None,
      then: None,
      r#else: None,
      not: None,

      ..item.clone()
    };

    let base_key_new = arena.add_item(base_item_new);

    // the new sub item is an all of of the base and the previous sub item
    let sub_item_new = SchemaItem {
      all_of: Some([sub_key, base_key_new].into()),

      ..Default::default()
    };

    let sub_key_new = arena.add_item(sub_item_new);

    let item_new = SchemaItem {
      reference: Some(sub_key_new),

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

      ..item.clone()
    };

    arena.replace_item(key, item_new);
  }

  #[cfg(test)]
  mod tests {
    use super::*;

    #[test]
    fn test_transform() {
      let mut arena = Arena::new();

      arena.add_item(SchemaItem {
        required: Some(["a", "b"].map(|value| value.into()).into()),
        ..Default::default()
      });

      arena.add_item(SchemaItem {
        reference: Some(0),
        required: Some(["b", "c"].map(|value| value.into()).into()),
        ..Default::default()
      });

      while arena.apply_transform(transform) > 0 {
        //
      }

      let actual: Vec<_> = arena.iter().cloned().collect();
      let expected = vec![
        SchemaItem {
          required: Some(["a", "b"].map(|value| value.into()).into()),
          ..Default::default()
        },
        SchemaItem {
          reference: Some(3),
          ..Default::default()
        },
        SchemaItem {
          required: Some(["b", "c"].map(|value| value.into()).into()),
          ..Default::default()
        },
        SchemaItem {
          all_of: Some([0, 2].into()),
          ..Default::default()
        },
      ];

      assert_eq!(actual, expected)
    }
  }
}
