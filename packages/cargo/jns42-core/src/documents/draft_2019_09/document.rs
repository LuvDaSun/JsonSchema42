use super::Node;
use crate::documents::{DocumentContext, EmbeddedDocument, ReferencedDocument, SchemaDocument};
use crate::error::Error;
use crate::models::DocumentSchemaItem;
use crate::utils::node_location::NodeLocation;
use std::collections::{BTreeMap, HashMap};
use std::rc::Weak;

pub struct Document {
  document_context: Weak<DocumentContext>,

  document_location: NodeLocation,
  antecedent_location: Option<NodeLocation>,
  /**
  Nodes that belong to this document, indexed by their pointer
  */
  nodes: HashMap<Vec<String>, Node>,
  referenced_documents: Vec<ReferencedDocument>,
  embedded_documents: Vec<EmbeddedDocument>,

  // maps anchors to their pointers
  anchors: HashMap<String, Vec<String>>,

  // pointer to the anchor
  recursive_anchor: Option<Vec<String>>,
}

impl Document {
  pub fn new(
    document_context: Weak<DocumentContext>,
    retrieval_location: NodeLocation,
    given_location: NodeLocation,
    antecedent_location: Option<NodeLocation>,
    document_node: Node,
  ) -> Result<Self, Error> {
    let node_id = document_node.select_id();

    let document_location = if let Some(node_id) = node_id {
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
    let mut referenced_documents = Vec::new();
    let mut embedded_documents = Vec::new();
    let mut anchors = HashMap::new();
    let mut recursive_anchor = None;

    let mut node_queue = Vec::new();
    node_queue.push((vec![], document_node.clone()));
    while let Some((node_pointer, node)) = node_queue.pop() {
      assert!(nodes.insert(node_pointer.clone(), node.clone()).is_none());

      if let Some(node_anchor) = node.select_anchor() {
        assert!(anchors
          .insert(node_anchor.to_owned(), node_pointer.clone())
          .is_none());
      }

      if node.select_recursive_anchor().unwrap_or_default() {
        if recursive_anchor.is_some() {
          Err(Error::Conflict)?
        }

        recursive_anchor = Some(node_pointer.clone());
      }

      if let Some(node_reference) = node.select_reference() {
        let reference_location = &node_reference.parse()?;
        let retrieval_location = retrieval_location.join(reference_location);
        let given_location = given_location.join(reference_location);

        let retrieval_location = retrieval_location.set_root();
        let given_location = given_location.set_root();

        referenced_documents.push(ReferencedDocument {
          retrieval_location,
          given_location,
        });
      }

      for (sub_pointer, sub_node) in node.select_sub_nodes(&node_pointer) {
        if let Some(node_id) = sub_node.select_id() {
          let id_location = &node_id.parse()?;
          let retrieval_location = retrieval_location.join(id_location);
          let given_location = given_location.join(id_location);

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

    Ok(Self {
      document_context,
      document_location,
      antecedent_location,
      nodes,
      referenced_documents,
      embedded_documents,
      anchors,
      recursive_anchor,
    })
  }

  pub fn resolve_reference(&self, reference: &str) -> Result<NodeLocation, Error> {
    let document_context = self.document_context.upgrade().unwrap();
    let reference_location = reference.parse()?;
    let reference_location = self.document_location.join(&reference_location);
    let document_location = document_context.resolve_document_location(&reference_location);
    let document = document_context.get_document(&document_location)?;

    if let Some(anchor) = reference_location.get_anchor() {
      if let Some(pointer) = document.resolve_anchor(anchor) {
        let reference_location = document.get_document_location().push_pointer(pointer);
        return Ok(reference_location);
      }
    } else {
      return Ok(reference_location);
    }

    Err(Error::NotFound)
  }

  pub fn resolve_recursive_reference(&self, reference: &str) -> Result<NodeLocation, Error> {
    let document_context = self.document_context.upgrade().unwrap();
    let reference_location = reference.parse()?;
    let mut antecedent_documents =
      document_context.get_document_and_antecedents(self.get_document_location())?;
    // we start with the document that has no antecedent
    antecedent_documents.reverse();

    for document in antecedent_documents {
      let reference_location = document.get_document_location().join(&reference_location);
      if let Some(anchor) = reference_location.get_anchor() {
        if let Some(pointer) = document.resolve_antecedent_anchor(anchor) {
          let reference_location = document.get_document_location().push_pointer(pointer);
          return Ok(reference_location);
        };
      } else {
        return Err(Error::Unknown);
      }
    }

    Err(Error::NotFound)
  }
}

impl SchemaDocument for Document {
  fn get_document_location(&self) -> &NodeLocation {
    &self.document_location
  }

  fn get_antecedent_location(&self) -> Option<&NodeLocation> {
    self.antecedent_location.as_ref()
  }

  fn get_node_locations(&self) -> Vec<NodeLocation> {
    self
      .nodes
      .keys()
      .map(|pointer| self.document_location.push_pointer(pointer.clone()))
      .collect()
  }

  fn get_referenced_documents(&self) -> &Vec<ReferencedDocument> {
    &self.referenced_documents
  }

  fn get_embedded_documents(&self) -> &Vec<EmbeddedDocument> {
    &self.embedded_documents
  }

  fn get_schema_nodes(&self) -> BTreeMap<NodeLocation, DocumentSchemaItem> {
    self
      .nodes
      .iter()
      .map(|(pointer, node)| {
        let location = self.get_document_location().push_pointer(pointer);
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
