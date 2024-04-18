use super::Node;
use crate::documents::{DocumentContext, EmbeddedDocument, ReferencedDocument, SchemaDocument};
use crate::error::Error;
use crate::models::DocumentSchemaItem;
use crate::utils::node_location::NodeLocation;
use std::collections::{BTreeMap, BTreeSet, HashMap};
use std::iter::empty;
use std::rc::Weak;

pub struct Document {
  document_context: Weak<DocumentContext>,
  // given_location: NodeLocation,
  document_location: NodeLocation,
  antecedent_location: Option<NodeLocation>,
  // document_node: Node,
  /**
  Nodes that belong to this document, indexed by their pointer
  */
  nodes: HashMap<Vec<String>, Node>,
  referenced_documents: Vec<ReferencedDocument>,
  embedded_documents: Vec<EmbeddedDocument>,
  anchors: HashMap<String, Vec<String>>,
  dynamic_anchors: HashMap<String, Vec<String>>,
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
    let mut dynamic_anchors = HashMap::new();

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

      if let Some(node_anchor) = node.select_anchor() {
        anchors.insert(node_anchor.to_owned(), node_pointer.clone());
      }

      if let Some(node_dynamic_anchor) = node.select_dynamic_anchor() {
        dynamic_anchors.insert(node_dynamic_anchor.to_owned(), node_pointer.clone());
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
      antecedent_location,
      // given_location,
      document_location,
      // document_node,
      nodes,
      referenced_documents,
      embedded_documents,
      anchors,
      dynamic_anchors,
    })
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
    empty()
      .chain(self.nodes.keys().map(|pointer| {
        let mut node_location = self.document_location.clone();
        node_location.push_pointer(pointer.clone());
        node_location
      }))
      .chain(self.anchors.keys().map(|anchor| {
        let mut node_location = self.document_location.clone();
        node_location.set_anchor(anchor.clone());
        node_location
      }))
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
        let mut location = self.get_document_location().clone();
        location.push_pointer(pointer);

        let reference = None
          .or_else(|| {
            node.select_reference().map(|value| {
              let reference_location = value.parse().unwrap();
              location.join(&reference_location)
            })
          })
          .or_else(|| {
            node.select_dynamic_reference().map(|value| {
              let document_context = self.document_context.upgrade().unwrap();
              // get antecedents
              let mut documents = document_context
                .get_document_and_antecedents(&self.document_location)
                .unwrap();
              documents.reverse();
              let dynamic_reference_location = value.parse().unwrap();

              for document in documents {
                let document_location = document.get_document_location().clone();
                let location = document_location.join(&dynamic_reference_location);

                if document.has_node(
                  &location
                    .get_hash()
                    .into_iter()
                    .map(|value| value.to_owned())
                    .collect::<Vec<_>>(),
                ) {
                  return location;
                }
              }

              panic!("not found");
            })
          });

        (
          location.clone(),
          DocumentSchemaItem {
            location: Some(location.clone()),
            name: None,
            exact: Some(true),
            parent: None,
            primary: Some(true),

            // meta
            title: node.select_title().map(|value| value.to_owned()),
            description: node.select_description().map(|value| value.to_owned()),
            examples: node.select_examples().cloned(),
            deprecated: node.select_deprecated(),

            // types
            types: node.select_types(),

            // assertions
            options: {
              let value: Vec<_> = empty()
                .chain(node.select_const().into_iter().cloned())
                .chain(node.select_enum().into_iter().flatten())
                .collect();
              if value.is_empty() {
                None
              } else {
                Some(value)
              }
            },

            minimum_inclusive: node.select_minimum_inclusive().cloned(),
            minimum_exclusive: node.select_minimum_exclusive().cloned(),
            maximum_inclusive: node.select_maximum_inclusive().cloned(),
            maximum_exclusive: node.select_maximum_exclusive().cloned(),
            multiple_of: node.select_multiple_of().cloned(),
            minimum_length: node.select_minimum_length(),
            maximum_length: node.select_maximum_length(),
            value_pattern: node.select_value_pattern().map(|value| value.to_owned()),
            value_format: node.select_value_format().map(|value| value.to_owned()),
            maximum_items: node.select_maximum_items(),
            minimum_items: node.select_minimum_items(),
            unique_items: node.select_unique_items(),
            minimum_properties: node.select_minimum_properties(),
            maximum_properties: node.select_maximum_properties(),
            required: node
              .select_required()
              .map(|value| value.iter().map(|value| (*value).to_owned()).collect()),

            reference,

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

            all_of: map_entry_locations_set(&location, node.select_all_of_entries(pointer)),
            any_of: map_entry_locations_set(&location, node.select_any_of_entries(pointer)),
            one_of: map_entry_locations_set(&location, node.select_one_of_entries(pointer)),
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

  fn has_node(&self, hash: &[String]) -> bool {
    self.nodes.contains_key(hash)
  }
}

fn map_entry_location(
  location: &NodeLocation,
  entry: Option<(Vec<String>, Node)>,
) -> Option<NodeLocation> {
  entry.map(|(pointer, _node)| {
    let mut sub_location = location.clone();
    sub_location.set_pointer(pointer.clone());
    sub_location
  })
}

fn map_entry_locations_vec(
  location: &NodeLocation,
  entries: Option<Vec<(Vec<String>, Node)>>,
) -> Option<Vec<NodeLocation>> {
  entries.map(|value| {
    value
      .iter()
      .map(|(pointer, _node)| {
        let mut sub_location = location.clone();
        sub_location.set_pointer(pointer.clone());
        sub_location
      })
      .collect()
  })
}

fn map_entry_locations_set(
  location: &NodeLocation,
  entries: Option<Vec<(Vec<String>, Node)>>,
) -> Option<BTreeSet<NodeLocation>> {
  entries.map(|value| {
    value
      .iter()
      .map(|(pointer, _node)| {
        let mut sub_location = location.clone();
        sub_location.set_pointer(pointer.clone());
        sub_location
      })
      .collect()
  })
}

fn map_entry_locations_map(
  location: &NodeLocation,
  entries: Option<Vec<(Vec<String>, Node)>>,
) -> Option<HashMap<String, NodeLocation>> {
  entries.map(|value| {
    value
      .iter()
      .map(|(pointer, _node)| {
        let mut sub_location = location.clone();
        sub_location.set_pointer(pointer.clone());
        (pointer.last().unwrap().to_owned(), sub_location)
      })
      .collect()
  })
}
