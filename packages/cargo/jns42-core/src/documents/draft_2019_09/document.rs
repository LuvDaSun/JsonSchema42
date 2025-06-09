use super::Node;
use crate::documents::{DocumentContext, SchemaDocument};
use crate::error::Error;
use crate::models::DocumentSchemaItem;
use crate::utilities::NodeLocation;
use std::collections::BTreeMap;
use std::rc::Weak;

pub struct Document {
  document_context: Weak<DocumentContext>,

  identity_location: NodeLocation,
  antecedent_location: Option<NodeLocation>,
  /**
  Nodes that belong to this document, indexed by their pointer
  */
  nodes: BTreeMap<Vec<String>, Node>,
  referenced_locations: Vec<NodeLocation>,

  // maps anchors to their pointers
  anchors: BTreeMap<String, Vec<String>>,

  // pointer to the anchor
  recursive_anchor: Option<Vec<String>>,
}

impl Document {
  pub fn new(
    document_context: Weak<DocumentContext>,
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

    let mut nodes = BTreeMap::new();
    let mut referenced_locations = Vec::new();
    let mut anchors = BTreeMap::new();
    let mut recursive_anchor = None;

    let mut node_queue = Vec::new();
    node_queue.push((vec![], document_node.clone()));
    while let Some((node_pointer, node)) = node_queue.pop() {
      assert!(nodes.insert(node_pointer.clone(), node.clone()).is_none());

      if let Some(node_anchor) = node.select_anchor() {
        assert!(
          anchors
            .insert(node_anchor.to_owned(), node_pointer.clone())
            .is_none()
        );
      }

      if node.select_recursive_anchor().unwrap_or_default() {
        if recursive_anchor.is_some() {
          Err(Error::Conflict)?
        }

        recursive_anchor = Some(node_pointer.clone());
      }

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
      document_context,
      identity_location,
      antecedent_location,
      nodes,
      referenced_locations,
      anchors,
      recursive_anchor,
    })
  }

  /// resolve reference to identity location
  ///
  pub fn resolve_reference(&self, reference: &str) -> Result<NodeLocation, Error> {
    let document_context = self.document_context.upgrade().unwrap();
    let reference_location = reference.parse()?;
    let reference_location = self.identity_location.join(&reference_location);
    let node_retrieval_location =
      document_context.resolve_retrieval_location(&reference_location)?;
    let document_retrieval_location =
      document_context.resolve_document_retrieval_location(&node_retrieval_location)?;
    let document = document_context.get_document(&document_retrieval_location)?;

    if let Some(anchor) = reference_location.get_anchor() {
      if let Some(pointer) = document.resolve_anchor(anchor.as_str()) {
        let reference_location = document.get_identity_location().push_pointer(pointer);
        return Ok(reference_location);
      }
    } else {
      return Ok(reference_location);
    }

    Err(Error::ReferenceNotFound(reference_location))
  }

  /// resolve recursive reference to identity location
  ///
  pub fn resolve_recursive_reference(&self, reference: &str) -> Result<NodeLocation, Error> {
    let document_context = self.document_context.upgrade().unwrap();
    let reference_location = reference.parse()?;
    let mut antecedent_documents =
      document_context.get_document_and_antecedents(&self.get_identity_location())?;
    // we start with the document that has no antecedent
    antecedent_documents.reverse();

    for document in antecedent_documents {
      let reference_location = document.get_identity_location().join(&reference_location);
      if let Some(anchor) = reference_location.get_anchor() {
        if let Some(pointer) = document.resolve_antecedent_anchor(anchor.as_str()) {
          let reference_location = document.get_identity_location().push_pointer(pointer);
          return Ok(reference_location);
        };
      } else {
        return Err(Error::Unknown);
      }
    }

    Err(Error::ReferenceNotFound(reference_location))
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
        (
          location.clone(),
          node.to_document_schema_item(location, self),
        )
      })
      .collect()
  }

  fn resolve_anchor(&self, anchor: &str) -> Option<Vec<String>> {
    self.anchors.get(anchor).cloned()
  }

  fn resolve_antecedent_anchor(&self, _anchor: &str) -> Option<Vec<String>> {
    self.recursive_anchor.as_ref().cloned()
  }
}
