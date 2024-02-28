use crate::{models::intermediate::IntermediateNode, utils::url::UrlWithPointer};

pub struct EmbeddedDocument {
  pub retrieval_url: UrlWithPointer,
  pub given_url: UrlWithPointer,
}

pub struct ReferencedDocument {
  pub retrieval_url: UrlWithPointer,
  pub given_url: UrlWithPointer,
}

pub trait SchemaDocument {
  fn get_referenced_documents(&self) -> &Vec<ReferencedDocument>;
  fn get_embedded_documents(&self) -> &Vec<EmbeddedDocument>;

  fn get_document_uri(&self) -> &UrlWithPointer;
  fn get_node_urls(&self) -> Box<dyn Iterator<Item = UrlWithPointer> + '_>;

  fn get_intermediate_node_entries(
    &self,
  ) -> Box<dyn Iterator<Item = (String, IntermediateNode)> + '_>;
}
