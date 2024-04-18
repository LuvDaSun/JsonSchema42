use super::Node;
use crate::documents::{DocumentContext, EmbeddedDocument, ReferencedDocument, SchemaDocument};
use crate::error::Error;
use crate::models::IntermediateNode;
use crate::utils::node_location::NodeLocation;
use std::collections::{BTreeMap, HashMap};
use std::rc::Weak;

pub struct Document {
  _document_context: Weak<DocumentContext>,
  // given_location: NodeLocation,
  // antecedent_location: Option<NodeLocation>,
  document_location: NodeLocation,
  // document_node: Node,
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

    let mut node_queue = Vec::new();
    node_queue.push((vec![], document_node.clone()));
    while let Some((node_pointer, node)) = node_queue.pop() {
      nodes.insert(node_pointer.clone(), node.clone());

      if let Some(node_ref) = node.select_ref() {
        let reference_location = &node_ref.parse()?;
        let retrieval_location = retrieval_location.join(reference_location);
        let given_location = given_location.join(reference_location);

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
      _document_context: document_context,
      // antecedent_location,
      // given_location,
      document_location,
      // document_node,
      nodes,
      referenced_documents,
      embedded_documents,
    })
  }
}

impl SchemaDocument for Document {
  fn get_document_location(&self) -> &NodeLocation {
    &self.document_location
  }

  fn get_node_locations(&self) -> Vec<NodeLocation> {
    self
      .nodes
      .keys()
      .map(|pointer| {
        let mut node_location = self.document_location.clone();
        node_location.push_pointer(pointer.clone());
        node_location
      })
      .collect()
  }

  fn get_referenced_documents(&self) -> &Vec<ReferencedDocument> {
    &self.referenced_documents
  }

  fn get_embedded_documents(&self) -> &Vec<EmbeddedDocument> {
    &self.embedded_documents
  }

  fn get_intermediate_node_entries(&self) -> BTreeMap<NodeLocation, IntermediateNode> {
    self
      .nodes
      .iter()
      .map(|(pointer, node)| {
        let mut location = self.get_document_location().clone();
        location.push_pointer(pointer);
        (
          location.clone(),
          IntermediateNode {
            id: Some(location.to_string()),
            name: None,
            exact: Some(true),
            parent: None,
            primary: Some(true),

            // meta
            title: node.select_title().map(|value| value.to_string()),
            description: node.select_description().map(|value| value.to_string()),
            examples: node.select_examples().cloned(),
            deprecated: node.select_deprecated(),

            // types
            types: node.select_types(),

            // assertions
            options: node.select_options(),

            minimum_inclusive: node.select_minimum_inclusive().cloned(),
            minimum_exclusive: node.select_minimum_exclusive().cloned(),
            maximum_inclusive: node.select_maximum_inclusive().cloned(),
            maximum_exclusive: node.select_maximum_exclusive().cloned(),
            multiple_of: node.select_multiple_of().cloned(),
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

            reference: node.select_reference().map(|value| {
              let reference_location = value.parse().unwrap();
              location.join(&reference_location).to_string()
            }),

            // sub nodes
            r#if: map_entry_location(&location, node.select_if_entry(pointer)),
            then: map_entry_location(&location, node.select_then_entry(pointer)),
            r#else: map_entry_location(&location, node.select_else_entry(pointer)),
            not: map_entry_location(&location, node.select_not_entry(pointer)),
            contains: map_entry_location(&location, node.select_contains_entry(pointer)),
            array_items: map_entry_location(&location, node.select_array_items_entry(pointer)),
            property_names: map_entry_location(
              &location,
              node.select_property_names_entry(pointer),
            ),
            map_properties: map_entry_location(
              &location,
              node.select_map_properties_entry(pointer),
            ),

            all_of: map_entry_locations_vec(&location, node.select_all_of_entries(pointer)),
            any_of: map_entry_locations_vec(&location, node.select_any_of_entries(pointer)),
            one_of: map_entry_locations_vec(&location, node.select_one_of_entries(pointer)),
            tuple_items: map_entry_locations_vec(
              &location,
              node.select_tuple_items_entries(pointer),
            ),

            dependent_schemas: map_entry_locations_map(
              &location,
              node.select_dependent_schemas_entries(pointer),
            ),
            object_properties: map_entry_locations_map(
              &location,
              node.select_object_properties_entries(pointer),
            ),
            pattern_properties: map_entry_locations_map(
              &location,
              node.select_pattern_properties_entries(pointer),
            ),
          },
        )
      })
      .collect()
  }
}

fn map_entry_location(
  location: &NodeLocation,
  entry: Option<(Vec<String>, Node)>,
) -> Option<String> {
  entry.map(|(pointer, _node)| {
    let mut sub_location = location.clone();
    sub_location.set_pointer(pointer.clone());
    sub_location.to_string()
  })
}

fn map_entry_locations_vec(
  location: &NodeLocation,
  entries: Option<Vec<(Vec<String>, Node)>>,
) -> Option<Vec<String>> {
  entries.map(|value| {
    value
      .iter()
      .map(|(pointer, _node)| {
        let mut sub_location = location.clone();
        sub_location.set_pointer(pointer.clone());
        sub_location.to_string()
      })
      .collect()
  })
}

fn map_entry_locations_map(
  location: &NodeLocation,
  entries: Option<Vec<(Vec<String>, Node)>>,
) -> Option<HashMap<String, String>> {
  entries.map(|value| {
    value
      .iter()
      .map(|(pointer, _node)| {
        let mut sub_location = location.clone();
        sub_location.set_pointer(pointer.clone());
        (
          pointer.last().unwrap().to_string(),
          sub_location.to_string(),
        )
      })
      .collect()
  })
}
