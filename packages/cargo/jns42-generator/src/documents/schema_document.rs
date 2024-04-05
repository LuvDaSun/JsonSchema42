use jns42_core::{models::intermediate::IntermediateNode, utils::node_location::NodeLocation};

pub struct EmbeddedDocument {
  pub retrieval_url: NodeLocation,
  pub given_url: NodeLocation,
}

pub struct ReferencedDocument {
  pub retrieval_url: NodeLocation,
  pub given_url: NodeLocation,
}

pub trait SchemaDocument {
  fn get_referenced_documents(&self) -> &Vec<ReferencedDocument>;
  fn get_embedded_documents(&self) -> &Vec<EmbeddedDocument>;

  fn get_document_uri(&self) -> &NodeLocation;
  fn get_node_urls(&self) -> Box<dyn Iterator<Item = NodeLocation> + '_>;

  fn get_intermediate_node_entries(
    &self,
  ) -> Box<dyn Iterator<Item = (NodeLocation, IntermediateNode)> + '_>;
}
