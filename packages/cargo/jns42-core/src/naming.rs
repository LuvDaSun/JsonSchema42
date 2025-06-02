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

#[cfg(target_arch = "wasm32")]
impl crate::exports::jns42::core::naming::Guest for crate::Host {
  type Names = NamesHost;
  type NamesBuilder = NamesBuilderHost;
  type Sentence = SentenceHost;
}
