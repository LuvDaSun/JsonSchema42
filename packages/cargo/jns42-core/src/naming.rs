#[cfg(target_arch = "wasm32")]
mod exports;

mod name_part;
mod names;
mod names_builder;
mod sentence;
mod word;

use name_part::*;
use word::*;

pub use names::*;
pub use names_builder::*;
pub use sentence::*;
