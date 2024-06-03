use crate::{models::DocumentSchemaItem, utils::NodeLocation};
use std::collections::BTreeMap;

pub trait SchemaDocument {
  fn get_referenced_locations(&self) -> Vec<NodeLocation>;

  fn get_document_location(&self) -> &NodeLocation;
  fn get_antecedent_location(&self) -> Option<&NodeLocation>;
  fn get_node_locations(&self) -> Vec<NodeLocation>;

  fn get_schema_nodes(&self) -> BTreeMap<NodeLocation, DocumentSchemaItem>;

  fn resolve_anchor(&self, anchor: &str) -> Option<Vec<String>>;
  fn resolve_antecedent_anchor(&self, anchor: &str) -> Option<Vec<String>>;
}
