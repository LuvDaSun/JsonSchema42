mod schema_arena;
mod schema_item;
mod schema_transform;
mod schema_type;

pub use schema_arena::*;
pub use schema_item::*;
pub use schema_transform::*;
pub use schema_type::*;

#[cfg(target_arch = "wasm32")]
impl crate::exports::jns42::core::models::Guest for crate::Host {
  type SchemaArena = SchemaArenaHost;
}
