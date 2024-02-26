use crate::models::{arena::Arena, schema::SchemaNode};
use std::iter::once;

// WIP
pub fn single_type_transform(arena: &mut Arena<SchemaNode>, key: usize) {
    let item = arena.get_item(key);

    if let Some(types) = &item.types {
        match types.len() {
            0 => {
                // if types is empty then we should just set it to None
                let mut item = item.clone();
                item.types = None;
                arena.set_item(key, item);
            }
            1 => {
                // only one type, this is what we want! let's do nothing
            }
            _ => {
                let mut item_new: SchemaNode = Default::default();
                item_new.one_of = Some(
                    types
                        .clone()
                        .into_iter()
                        .map(|r#type| {
                            let item_new = SchemaNode {
                                types: Some(once(r#type).collect()),
                                ..Default::default()
                            };
                            arena.add_item(item_new)
                        })
                        .collect(),
                );
                arena.set_item(key, item_new);
            }
        }
    }
}
