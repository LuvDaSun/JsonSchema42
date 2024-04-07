use crate::models::{arena::Arena, schema_item::SchemaItem};

pub fn transform(arena: &mut Arena<SchemaItem>, key: usize) {
  let item = arena.get_item(key);

  let mut item_new = item.clone();

  macro_rules! resolve_single_key {
    ($member: ident) => {
      if let Some(sub_key) = item_new.$member {
        let sub_key_resolved = arena.resolve_entry(sub_key).0;
        item_new.$member = Some(sub_key_resolved)
      }
    };
  }

  macro_rules! resolve_array_keys {
    ($member: ident) => {
      if let Some(sub_keys) = item_new.$member {
        let sub_keys_resolved = sub_keys
          .iter()
          .map(|sub_key| arena.resolve_entry(*sub_key).0)
          .collect();
        item_new.$member = Some(sub_keys_resolved);
      }
    };
  }

  macro_rules! resolve_object_keys {
    ($member: ident) => {
      if let Some(sub_entries) = item_new.$member {
        let sub_entries_resolved = sub_entries
          .iter()
          .map(|(sub_name, sub_key)| (sub_name.clone(), arena.resolve_entry(*sub_key).0))
          .collect();
        item_new.$member = Some(sub_entries_resolved);
      }
    };
  }

  resolve_single_key!(reference);
  resolve_single_key!(r#if);
  resolve_single_key!(then);
  resolve_single_key!(r#else);
  resolve_single_key!(not);
  resolve_single_key!(map_properties);
  resolve_single_key!(property_names);
  resolve_single_key!(array_items);
  resolve_single_key!(contains);

  resolve_array_keys!(all_of);
  resolve_array_keys!(any_of);
  resolve_array_keys!(one_of);

  resolve_array_keys!(tuple_items);

  resolve_object_keys!(dependent_schemas);
  resolve_object_keys!(object_properties);
  resolve_object_keys!(pattern_properties);
  resolve_object_keys!(pattern_properties);

  if *item == item_new {
    return;
  }

  arena.replace_item(key, item_new);
}
