use super::Node;
use crate::documents::SchemaDocument;
use crate::error::Error;
use crate::models::DocumentSchemaItem;
use crate::utils::NodeLocation;
use std::collections::{BTreeMap, HashMap};

pub struct Document {
  identity_location: NodeLocation,
  antecedent_location: Option<NodeLocation>,
  /**
  Nodes that belong to this document, indexed by their pointer
  */
  nodes: HashMap<Vec<String>, Node>,
  referenced_locations: Vec<NodeLocation>,
}

impl Document {
  pub fn new(
    given_location: NodeLocation,
    antecedent_location: Option<NodeLocation>,
    document_node: Node,
  ) -> Result<Self, Error> {
    let node_id = document_node.select_id();

    let identity_location = if let Some(node_id) = node_id {
      let node_location = node_id.parse()?;
      if let Some(antecedent_location) = &antecedent_location {
        antecedent_location.join(&node_location)
      } else {
        node_location
      }
    } else {
      given_location.clone()
    };

    let mut nodes = HashMap::new();
    let mut referenced_locations = Vec::new();

    let mut node_queue = Vec::new();
    node_queue.push((vec![], document_node.clone()));
    while let Some((node_pointer, node)) = node_queue.pop() {
      assert!(nodes.insert(node_pointer.clone(), node.clone()).is_none());

      if let Some(node_reference) = node.select_reference() {
        let reference_location: NodeLocation = node_reference.parse()?;
        referenced_locations.push(reference_location);
      }

      for (sub_pointer, sub_node) in node.select_sub_nodes(&node_pointer) {
        if let Some(node_id) = sub_node.select_id() {
          let id_location: NodeLocation = node_id.parse()?;
          referenced_locations.push(id_location);
          /*
          if we found an embedded document then we don't include it in the nodes
          */
          continue;
        }

        node_queue.push((sub_pointer, sub_node))
      }
    }

    Ok(Self {
      identity_location,
      antecedent_location,
      nodes,
      referenced_locations,
    })
  }
}

impl SchemaDocument for Document {
  fn get_identity_location(&self) -> NodeLocation {
    self.identity_location.clone()
  }

  fn get_antecedent_location(&self) -> Option<NodeLocation> {
    self.antecedent_location.clone()
  }

  fn get_node_pointers(&self) -> Vec<Vec<String>> {
    self.nodes.keys().cloned().collect()
  }

  fn get_node_anchors(&self) -> Vec<String> {
    Default::default()
  }

  fn get_referenced_locations(&self) -> Vec<NodeLocation> {
    self.referenced_locations.clone()
  }

  fn get_schema_nodes(&self) -> BTreeMap<NodeLocation, DocumentSchemaItem> {
    self
      .nodes
      .iter()
      .map(|(pointer, node)| {
        let location = self.get_identity_location().push_pointer(pointer.clone());
        (location.clone(), node.to_document_schema_item(location))
      })
      .collect()
  }

  fn resolve_anchor(&self, _anchor: &str) -> Option<Vec<String>> {
    None
  }

  fn resolve_antecedent_anchor(&self, _anchor: &str) -> Option<Vec<String>> {
    None
  }
}
