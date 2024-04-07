use super::{
  arena::Arena,
  schema_item::{SchemaItem, SchemaKey},
};
use crate::schema_transforms::{BoxedSchemaTransform, SchemaTransform};
use std::iter::empty;

impl Arena<SchemaItem> {
  pub fn resolve_entry(&self, key: SchemaKey) -> (SchemaKey, &SchemaItem) {
    let mut resolved_key = key;
    let mut resolved_item = self.get_item(resolved_key);

    loop {
      let Some(alias_key) = resolved_item.get_alias_key() else {
        break;
      };
      resolved_key = alias_key;
      resolved_item = self.get_item(resolved_key);
    }

    (resolved_key, resolved_item)
  }

  pub fn get_ancestors(
    &self,
    key: SchemaKey,
  ) -> impl DoubleEndedIterator<Item = (SchemaKey, &SchemaItem)> {
    let mut result = Vec::new();

    let mut key_maybe = Some(key);
    while let Some(key) = key_maybe {
      let item = self.get_item(key);
      result.push((key, item));

      key_maybe = item.parent;
    }

    result.into_iter()
  }

  pub fn has_ancestor(&self, key: SchemaKey, ancestor_key: SchemaKey) -> bool {
    self
      .get_ancestors(key)
      .any(|(key, _item)| key == ancestor_key)
  }

  pub fn get_name_parts(&self, key: SchemaKey) -> impl Iterator<Item = &str> {
    let ancestors: Vec<_> = self
      .get_ancestors(key)
      .map(|(_key, item)| item)
      .scan(None, |state, item| {
        let item_previous = *state;
        *state = Some(item);
        Some((item_previous, item))
      })
      .take_while(|(item_previous, _item)| {
        if let Some(item_previous) = item_previous {
          item_previous.id.is_none()
        } else {
          true
        }
      })
      .map(|(_item_previous, item)| {
        empty()
          .chain(
            item
              .id
              .as_ref()
              .map(|id| empty().chain(id.get_path()).chain(id.get_hash())),
          )
          .flatten()
          .chain(item.name.as_deref())
          .filter(|part| !part.is_empty())
      })
      .collect();

    ancestors.into_iter().rev().flatten()
  }

  pub fn transform(&mut self, transforms: &Vec<SchemaTransform>) -> usize {
    self.apply_transform(|arena: &mut Arena<SchemaItem>, key: usize| {
      for transform in transforms {
        let transform: BoxedSchemaTransform = transform.into();
        transform(arena, key)
      }
    })
  }
}
