mod arena;
mod banner;
mod fetch_text;
mod json_value;
mod merge;
mod node_cache;
mod node_location;
mod product;

pub use arena::*;
pub use banner::*;
pub use fetch_text::*;
pub use json_value::*;
pub use merge::*;
pub use node_cache::*;
pub use node_location::*;
pub use product::*;

#[cfg(target_arch = "wasm32")]
impl crate::exports::jns42::core::utilities::Guest for crate::Host {
  fn banner(prefix: String, version: String) -> String {
    banner(&prefix, &version)
  }
}
