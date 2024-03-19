use super::{
  arena::Arena,
  schema::{SchemaKey, SchemaNode},
};
use std::iter::empty;

impl Arena<SchemaNode> {
  pub fn get_ancestors(
    &self,
    key: SchemaKey,
  ) -> impl DoubleEndedIterator<Item = (SchemaKey, &SchemaNode)> {
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
          .chain(item.id.as_ref().map(|id| {
            empty()
              .chain(id.get_url().path_segments().into_iter().flatten())
              .chain(id.get_pointer().as_ref().iter().map(|value| value.as_str()))
          }))
          .flatten()
          .chain(item.name.as_deref())
          .filter(|part| !part.is_empty())
      })
      .collect();

    ancestors.into_iter().rev().flatten()
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::utils::url::UrlWithPointer;

  #[test]
  fn test_get_name_parts() {
    let mut arena = Arena::new();

    arena.add_item(SchemaNode {
      id: Some(UrlWithPointer::parse("http://id.com#/a/0").unwrap()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      parent: Some(0),
      id: Some(UrlWithPointer::parse("http://id.com#/b/1").unwrap()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      parent: Some(1),
      name: Some("2".to_string()),
      ..Default::default()
    });

    arena.add_item(SchemaNode {
      parent: Some(2),
      name: Some("3".to_string()),
      ..Default::default()
    });

    assert_eq!(arena.get_name_parts(0).collect::<Vec<_>>(), vec!["a", "0"]);
    assert_eq!(arena.get_name_parts(1).collect::<Vec<_>>(), vec!["b", "1"]);
    assert_eq!(
      arena.get_name_parts(2).collect::<Vec<_>>(),
      vec!["b", "1", "2"]
    );
    assert_eq!(
      arena.get_name_parts(3).collect::<Vec<_>>(),
      vec!["b", "1", "2", "3"]
    );
  }
}
