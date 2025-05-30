use crate::{models::DocumentSchemaItem, utilities::NodeLocation};
use std::collections::BTreeMap;

pub trait SchemaDocument {
  fn get_referenced_locations(&self) -> Vec<NodeLocation>;

  fn get_identity_location(&self) -> NodeLocation;
  //. gets the identity location of the antecedent
  fn get_antecedent_location(&self) -> Option<NodeLocation>;
  fn get_node_pointers(&self) -> Vec<Vec<String>>;
  fn get_node_anchors(&self) -> Vec<String>;

  /// get all schema nodes in a map indexed by their identity location
  fn get_schema_nodes(&self) -> BTreeMap<NodeLocation, DocumentSchemaItem>;

  fn resolve_anchor(&self, anchor: &str) -> Option<Vec<String>>;
  fn resolve_antecedent_anchor(&self, anchor: &str) -> Option<Vec<String>>;
}
