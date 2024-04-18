use crate::{models::IntermediateSchemaItem, utils::node_location::NodeLocation};
use std::collections::BTreeMap;

pub struct EmbeddedDocument {
  pub retrieval_location: NodeLocation,
  pub given_location: NodeLocation,
}

pub struct ReferencedDocument {
  pub retrieval_location: NodeLocation,
  pub given_location: NodeLocation,
}

pub trait SchemaDocument {
  fn get_referenced_documents(&self) -> &Vec<ReferencedDocument>;
  fn get_embedded_documents(&self) -> &Vec<EmbeddedDocument>;

  fn get_document_location(&self) -> &NodeLocation;
  fn get_node_locations(&self) -> Vec<NodeLocation>;

  fn get_schema_nodes(&self) -> BTreeMap<NodeLocation, IntermediateSchemaItem>;
}
