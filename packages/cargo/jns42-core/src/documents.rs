mod document_context;
mod error;
mod meta;
mod schema_document;

pub use document_context::*;
pub use error::*;
pub use meta::*;
pub use schema_document::*;

pub mod draft_04;
pub mod draft_06;
pub mod draft_07;
pub mod draft_2019_09;
pub mod draft_2020_12;
pub mod oas_v3_0;
pub mod oas_v3_1;
pub mod swagger_v2;

#[cfg(target_arch = "wasm32")]
impl crate::exports::jns42::core::documents::Guest for crate::Host {
  type DocumentContext = DocumentContextHost;
  type DocumentContextBuilder = DocumentContextBuilderHost;
}
