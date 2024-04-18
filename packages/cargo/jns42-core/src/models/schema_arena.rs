use super::{schema_item::SchemaItem, BoxedSchemaTransform, SchemaTransform};
use crate::utils::arena::Arena;
use std::iter::empty;

pub type SchemaArena = Arena<SchemaItem>;

impl Arena<SchemaItem> {
  /// Resolves the final entry for a given schema key, following any alias chains.
  ///
  /// This method iteratively follows the alias chain for a given key until it reaches
  /// an item that does not have an alias. It returns both the resolved key and a reference
  /// to the resolved `SchemaItem`.
  ///
  /// # Parameters
  /// - `key`: The initial `usize` to resolve.
  ///
  /// # Returns
  /// A tuple containing the resolved `usize` and a reference to the resolved `SchemaItem`.
  pub fn resolve_entry(&self, key: usize) -> (usize, &SchemaItem) {
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

  /// Retrieves the ancestors of a given schema item by its key.
  ///
  /// This method returns an iterator over the ancestors of the specified item,
  /// starting from the item itself and moving up to the root.
  ///
  /// # Parameters
  /// - `key`: The `usize` of the item whose ancestors are to be retrieved.
  ///
  /// # Returns
  /// An iterator over tuples containing the `usize` and a reference to the `SchemaItem`
  /// for each ancestor, including the item itself.
  pub fn get_ancestors(&self, key: usize) -> impl DoubleEndedIterator<Item = (usize, &SchemaItem)> {
    let mut result = Vec::new();

    let mut key_maybe = Some(key);
    while let Some(key) = key_maybe {
      let item = self.get_item(key);
      result.push((key, item));

      key_maybe = item.parent;
    }

    result.into_iter()
  }

  /// Checks if a given schema item has a specific ancestor.
  ///
  /// # Parameters
  /// - `key`: The `usize` of the item to check.
  /// - `ancestor_key`: The `usize` of the potential ancestor.
  ///
  /// # Returns
  /// `true` if the item identified by `key` has the ancestor identified by `ancestor_key`,
  /// otherwise `false`.
  pub fn has_ancestor(&self, key: usize, ancestor_key: usize) -> bool {
    self
      .get_ancestors(key)
      .any(|(key, _item)| key == ancestor_key)
  }

  /// Generates an iterator over the name parts of a schema item and its ancestors.
  ///
  /// This method constructs an iterator that yields the name parts (path and hash) of
  /// the specified schema item and its ancestors, in reverse order (from the root ancestor
  /// to the item itself).
  ///
  /// # Parameters
  /// - `key`: The `usize` of the item whose name parts are to be retrieved.
  ///
  /// # Returns
  /// An iterator over string slices (`&str`) representing the name parts.
  pub fn get_name_parts(&self, key: usize) -> impl Iterator<Item = &str> {
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

  /// Applies a series of transformations to the schema items within the arena.
  ///
  /// This method iterates over each transformation provided and applies it to the arena.
  /// The transformations are applied in the order they are provided.
  ///
  /// # Parameters
  /// - `transforms`: A reference to a vector of `SchemaTransform` instances to be applied.
  ///
  /// # Returns
  /// The number of transformations applied.
  pub fn transform(&mut self, transforms: &Vec<SchemaTransform>) -> usize {
    self.apply_transform(|arena: &mut Arena<SchemaItem>, key: usize| {
      for transform in transforms {
        let transform: BoxedSchemaTransform = transform.into();
        transform(arena, key)
      }
    })
  }
}
