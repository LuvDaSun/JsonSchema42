use super::Node;
use crate::documents::{
  draft_2020_12::Selectors, DocumentContext, EmbeddedDocument, ReferencedDocument, SchemaDocument,
};
use crate::{models::IntermediateNode, utils::node_location::NodeLocation};
use std::{collections::HashMap, rc::Weak};

pub struct Document {
  _document_context: Weak<DocumentContext>,
  _given_url: NodeLocation,
  _antecedent_url: Option<NodeLocation>,
  document_url: NodeLocation,
  _document_node: Node,

  nodes: HashMap<Vec<String>, Node>,
  referenced_documents: Vec<ReferencedDocument>,
  embedded_documents: Vec<EmbeddedDocument>,
}

impl Document {
  pub fn new(
    document_context: Weak<DocumentContext>,
    retrieval_url: NodeLocation,
    given_url: NodeLocation,
    antecedent_url: Option<NodeLocation>,
    document_node: Node,
  ) -> Self {
    let node_id = document_node.select_id();
    let node_url = node_id.and_then(|node_id| {
      if let Some(antecedent_url) = &antecedent_url {
        Some(antecedent_url.join(&node_id.parse().unwrap()))
      } else {
        node_id.parse().ok()
      }
    });
    let document_url = node_url.unwrap_or(given_url.clone());

    let document_node_pointer: Vec<String> = document_url
      .get_pointer()
      .unwrap_or_default()
      .into_iter()
      .map(|value| value.to_string())
      .collect();

    let mut nodes = HashMap::new();
    let mut referenced_documents = Vec::new();
    let mut embedded_documents = Vec::new();

    let mut node_queue = Vec::new();
    node_queue.push((document_node_pointer.clone(), document_node.clone()));
    while let Some((pointer, node)) = node_queue.pop() {
      nodes.insert(pointer.clone(), node.clone());

      if let Some(node_ref) = node.select_ref() {
        let node_ref = &node_ref.parse().unwrap();
        referenced_documents.push(ReferencedDocument {
          retrieval_url: retrieval_url.join(node_ref),
          given_url: document_url.join(node_ref),
        });
      }

      for (sub_pointer, sub_node) in node.select_sub_nodes(&pointer) {
        if let Some(sub_node_id) = sub_node.select_id() {
          let sub_node_id = &sub_node_id.parse().unwrap();
          embedded_documents.push(EmbeddedDocument {
            retrieval_url: retrieval_url.join(sub_node_id),
            given_url: document_url.join(sub_node_id),
          });
          continue;
        }

        node_queue.push((sub_pointer, sub_node))
      }
    }

    Self {
      _document_context: document_context,
      _antecedent_url: antecedent_url,
      _given_url: given_url,
      document_url,
      _document_node: document_node,
      nodes,
      referenced_documents,
      embedded_documents,
    }
  }
}

impl SchemaDocument for Document {
  fn get_document_uri(&self) -> &NodeLocation {
    &self.document_url
  }

  fn get_node_urls(&self) -> Box<dyn Iterator<Item = NodeLocation> + '_> {
    Box::new(self.nodes.keys().map(|pointer| {
      let mut url = self.get_document_uri().clone();
      url.set_pointer(pointer.clone());
      url
    }))
  }

  fn get_referenced_documents(&self) -> &Vec<ReferencedDocument> {
    &self.referenced_documents
  }

  fn get_embedded_documents(&self) -> &Vec<EmbeddedDocument> {
    &self.embedded_documents
  }

  fn get_intermediate_node_entries(
    &self,
  ) -> Box<dyn Iterator<Item = (NodeLocation, IntermediateNode)> + '_> {
    Box::new(self.nodes.iter().map(|(pointer, node)| {
      let mut node_url = self.get_document_uri().clone();
      node_url.set_pointer(pointer.clone());
      (
        node_url.clone(),
        IntermediateNode {
          // meta
          title: node.select_title().map(|value| value.to_string()),
          description: node.select_description().map(|value| value.to_string()),
          examples: None, // TODO
          deprecated: node.select_deprecated(),

          // types
          types: node.select_types(),

          // assertions
          options: None, // TODO

          minimum_inclusive: node.select_minimum_inclusive(),
          minimum_exclusive: node.select_minimum_exclusive(),
          maximum_inclusive: node.select_maximum_inclusive(),
          maximum_exclusive: node.select_maximum_exclusive(),
          multiple_of: node.select_multiple_of(),
          minimum_length: node.select_minimum_length(),
          maximum_length: node.select_maximum_length(),
          value_pattern: node.select_value_pattern().map(|value| value.to_string()),
          value_format: node.select_value_format().map(|value| value.to_string()),
          maximum_items: node.select_maximum_items(),
          minimum_items: node.select_minimum_items(),
          unique_items: node.select_unique_items(),
          minimum_properties: node.select_minimum_properties(),
          maximum_properties: node.select_maximum_properties(),
          required: node
            .select_required()
            .map(|value| value.iter().map(|value| value.to_string()).collect()),

          // applicators
          reference: node.select_reference().map(|value| value.to_string()),

          r#if: node.select_if_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),
          then: node.select_then_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),
          r#else: node.select_else_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),
          not: node.select_not_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),

          contains: node.select_contains_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),

          array_items: node.select_array_items_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),
          property_names: node.select_property_names_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),
          map_properties: node.select_map_properties_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),

          all_of: node.select_all_of_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),
          any_of: node.select_any_of_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),
          one_of: node.select_one_of_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),
          tuple_items: node.select_tuple_items_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                sub_url.to_string()
              })
              .collect()
          }),

          dependent_schemas: node.select_dependent_schemas_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                (pointer.last().unwrap().to_string(), sub_url.to_string())
              })
              .collect()
          }),
          object_properties: node.select_object_properties_entries(pointer).map(|value| {
            value
              .iter()
              .map(|(pointer, _node)| {
                let mut sub_url = node_url.clone();
                sub_url.set_pointer(pointer.clone());
                (pointer.last().unwrap().to_string(), sub_url.to_string())
              })
              .collect()
          }),
          pattern_properties: node
            .select_pattern_properties_entries(pointer)
            .map(|value| {
              value
                .iter()
                .map(|(pointer, _node)| {
                  let mut sub_url = node_url.clone();
                  sub_url.set_pointer(pointer.clone());
                  (pointer.last().unwrap().to_string(), sub_url.to_string())
                })
                .collect()
            }),
        },
      )
    }))
  }
}
