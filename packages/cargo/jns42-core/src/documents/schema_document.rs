use crate::{models::DocumentSchemaItem, utils::node_location::NodeLocation};
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
  fn get_antecedent_location(&self) -> Option<&NodeLocation>;
  fn get_node_locations(&self) -> Vec<NodeLocation>;

  fn get_schema_nodes(&self) -> BTreeMap<NodeLocation, DocumentSchemaItem>;

  fn resolve_alias(&self, alias: &[String]) -> Option<Vec<String>>;
  fn resolve_dynamic_alias(&self, alias: &[String]) -> Option<Vec<String>>;
}
