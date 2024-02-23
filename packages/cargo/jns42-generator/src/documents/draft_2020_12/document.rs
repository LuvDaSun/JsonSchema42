use super::Node;
use crate::{
    documents::{
        draft_2020_12::Selectors, DocumentContext, EmbeddedDocument, ReferencedDocument,
        SchemaDocument,
    },
    models::intermediate::IntermediateNode,
    utils::{json_pointer::JsonPointer, url::UrlWithPointer},
};
use std::{collections::HashMap, rc::Weak};

#[allow(dead_code)]
pub struct Document {
    document_context: Weak<DocumentContext>,
    given_url: UrlWithPointer,
    antecedent_url: Option<UrlWithPointer>,
    document_url: UrlWithPointer,
    document_node: Node,

    nodes: HashMap<JsonPointer, Node>,
    referenced_documents: Vec<ReferencedDocument>,
    embedded_documents: Vec<EmbeddedDocument>,
}

impl Document {
    pub fn new(
        document_context: Weak<DocumentContext>,
        retrieval_url: UrlWithPointer,
        given_url: UrlWithPointer,
        antecedent_url: Option<UrlWithPointer>,
        document_node: Node,
    ) -> Self {
        let node_id = document_node.select_id();
        let node_url = node_id.and_then(|node_id| {
            if let Some(antecedent_url) = &antecedent_url {
                antecedent_url.join(node_id).ok()
            } else {
                UrlWithPointer::parse(node_id).ok()
            }
        });
        let document_url = node_url.unwrap_or(given_url.clone());

        let document_node_pointer: &JsonPointer = document_url.as_ref();

        let mut nodes = HashMap::new();
        let mut referenced_documents = Vec::new();
        let mut embedded_documents = Vec::new();

        let mut node_queue = Vec::new();
        node_queue.push((document_node_pointer.clone(), document_node.clone()));
        while let Some((pointer, node)) = node_queue.pop() {
            nodes.insert(pointer.clone(), node.clone());

            if let Some(node_ref) = node.select_ref() {
                referenced_documents.push(ReferencedDocument {
                    retrieval_url: retrieval_url.join(node_ref).unwrap(),
                    given_url: document_url.join(node_ref).unwrap(),
                });
            }

            for (sub_pointer, sub_node) in node.select_sub_nodes(&pointer) {
                if let Some(sub_node_id) = sub_node.select_id() {
                    embedded_documents.push(EmbeddedDocument {
                        retrieval_url: retrieval_url.join(sub_node_id).unwrap(),
                        given_url: document_url.join(sub_node_id).unwrap(),
                    });
                    continue;
                }

                node_queue.push((sub_pointer, sub_node))
            }
        }

        Self {
            document_context,
            antecedent_url,
            given_url,
            document_url,
            document_node,
            nodes,
            referenced_documents,
            embedded_documents,
        }
    }
}

impl SchemaDocument for Document {
    fn get_document_uri(&self) -> &UrlWithPointer {
        &self.document_url
    }

    fn get_node_urls(&self) -> Box<dyn Iterator<Item = UrlWithPointer> + '_> {
        Box::new(self.nodes.keys().map(|pointer| {
            self.get_document_uri()
                .join(&format!("#{}", pointer.to_string()))
                .unwrap()
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
    ) -> Box<dyn Iterator<Item = (String, IntermediateNode)> + '_> {
        Box::new(self.nodes.iter().map(|(node_id, node)| {
            (
                node_id.to_string(),
                IntermediateNode {
                    title: node.select_title().map(|value| value.to_string()),
                    description: node.select_description().map(|value| value.to_string()),
                    // examples: node.select_examples(),
                    deprecated: node.select_deprecated(),

                    types: node
                        .select_types()
                        .map(|value| value.iter().map(|value| value.to_string()).collect()),

                    reference: node.select_reference().map(|value| value.to_string()),
                },
            )
        }))
    }
}
