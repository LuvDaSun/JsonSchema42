use super::Node;
use crate::documents::{DocumentContext, EmbeddedDocument, ReferencedDocument, SchemaDocument};
use crate::utils::node_location::NodeLocation;
use std::{collections::HashMap, rc::Weak};

pub struct Document {
  document_context: Weak<DocumentContext>,
  given_location: NodeLocation,
  antecedent_location: Option<NodeLocation>,
  document_location: NodeLocation,
  document_node: Node,
  /**
  Nodes that belong to this document, indexed by their pointer
  */
  nodes: HashMap<Vec<String>, Node>,
  referenced_documents: Vec<ReferencedDocument>,
  embedded_documents: Vec<EmbeddedDocument>,
}

impl Document {
  pub fn new(
    document_context: Weak<DocumentContext>,
    retrieval_location: NodeLocation,
    given_location: NodeLocation,
    antecedent_location: Option<NodeLocation>,
    document_node: Node,
  ) -> Self {
    let node_id = document_node.select_id();
    let node_location = node_id.and_then(|node_id| {
      if let Some(antecedent_location) = &antecedent_location {
        Some(antecedent_location.join(&node_id.parse().unwrap()))
      } else {
        node_id.parse().ok()
      }
    });
    let document_location = node_location.unwrap_or(given_location.clone());

    let mut nodes = HashMap::new();
    let mut referenced_documents = Vec::new();
    let mut embedded_documents = Vec::new();

    let mut node_queue = Vec::new();
    node_queue.push((vec![], document_node.clone()));
    while let Some((node_pointer, node)) = node_queue.pop() {
      nodes.insert(node_pointer.clone(), node.clone());

      if let Some(node_ref) = node.select_ref() {
        let reference_location = &node_ref.parse().unwrap();
        let retrieval_location = retrieval_location.clone();
        let given_location = document_location.clone();
        retrieval_location.join(reference_location);
        given_location.join(reference_location);

        referenced_documents.push(ReferencedDocument {
          retrieval_location,
          given_location,
        });
      }

      for (sub_pointer, sub_node) in node.select_sub_nodes(&node_pointer) {
        if let Some(node_id) = sub_node.select_id() {
          let id_location = &node_id.parse().unwrap();
          let retrieval_location = retrieval_location.clone();
          let given_location = document_location.clone();
          retrieval_location.join(id_location);
          given_location.join(id_location);

          embedded_documents.push(EmbeddedDocument {
            retrieval_location,
            given_location,
          });

          /*
          if we found an embedded document then we don't include it in the nodes
          */
          continue;
        }

        node_queue.push((sub_pointer, sub_node))
      }
    }

    Self {
      document_context,
      antecedent_location,
      given_location,
      document_location,
      document_node,
      nodes,
      referenced_documents,
      embedded_documents,
    }
  }
}

impl SchemaDocument for Document {
  fn get_document_location(&self) -> &NodeLocation {
    &self.document_location
  }

  fn get_node_locations(&self) -> Box<dyn Iterator<Item = NodeLocation> + '_> {
    Box::new(self.nodes.keys().map(|pointer| {
      let mut node_location = self.document_location.clone();
      node_location.push_pointer(pointer.clone());
      node_location
    }))
  }

  fn get_referenced_documents(&self) -> &Vec<ReferencedDocument> {
    &self.referenced_documents
  }

  fn get_embedded_documents(&self) -> &Vec<EmbeddedDocument> {
    &self.embedded_documents
  }
}
