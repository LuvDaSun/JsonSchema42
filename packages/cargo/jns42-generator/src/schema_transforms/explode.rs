use crate::models::{arena::Arena, schema::SchemaNode};

pub fn explode_transform(arena: &mut Arena<SchemaNode>, key: usize) {
    let _item = arena.get_item(key);
}
