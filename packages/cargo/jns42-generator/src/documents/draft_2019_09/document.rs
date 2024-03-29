use crate::documents::{EmbeddedDocument, ReferencedDocument, SchemaDocument};
use jns42_core::{models::intermediate::IntermediateNode, utils::url::UrlWithPointer};

pub struct Document {}

impl Document {
  #[allow(clippy::new_without_default)]
  pub fn new() -> Self {
    Self {}
  }
}

impl SchemaDocument for Document {
  fn get_document_uri(&self) -> &UrlWithPointer {
    todo!()
  }

  fn get_node_urls(&self) -> Box<dyn Iterator<Item = UrlWithPointer> + '_> {
    todo!()
  }

  fn get_intermediate_node_entries(
    &self,
  ) -> Box<dyn Iterator<Item = (String, IntermediateNode)> + '_> {
    todo!()
  }

  fn get_referenced_documents(&self) -> &Vec<ReferencedDocument> {
    todo!()
  }

  fn get_embedded_documents(&self) -> &Vec<EmbeddedDocument> {
    todo!()
  }
}
