use crate::documents::{
    draft_2020_12::Selectors, DocumentContext, EmbeddedDocument, ReferencedDocument, SchemaDocument,
};
use serde_json::Value;
use std::{
    collections::HashMap,
    rc::{Rc, Weak},
};
use url::Url;

use super::Node;

#[allow(dead_code)]
pub struct Document {
    document_context: Weak<DocumentContext>,
    antecedent_url: Option<Url>,
    given_url: Url,
    document_node: Node,
    document_node_pointer: String,
    nodes: HashMap<String, Node>,
}

impl Document {
    pub fn new(
        document_context: Weak<DocumentContext>,
        given_url: Url,
        antecedent_url: Option<Url>,
        document_node: Node,
    ) -> Self {
        let document_node_pointer = "".to_string();
        let nodes = document_node
            .select_all_sub_nodes_and_self(&document_node_pointer)
            .into_iter()
            .collect();

        Self {
            document_context,
            antecedent_url,
            given_url,
            document_node,
            document_node_pointer,
            nodes,
        }
    }
}

impl SchemaDocument for Document {
    fn get_document_uri(&self) -> Url {
        let node_id = self.document_node.select_id();

        let node_url = node_id.and_then(|node_id| {
            if let Some(antecedent_url) = &self.antecedent_url {
                antecedent_url.join(node_id).ok()
            } else {
                Url::parse(node_id).ok()
            }
        });

        node_url.unwrap_or(self.given_url.clone())
    }

    fn get_node_urls(&self) -> Box<dyn Iterator<Item = Url> + '_> {
        Box::new(self.nodes.keys().map(|pointer| {
            self.get_document_uri()
                .join(&format!("#{}", pointer))
                .unwrap()
        }))
    }

    fn get_referenced_documents(self: Rc<Self>, retrieval_url: &Url) -> Vec<ReferencedDocument> {
        self.nodes
            .iter()
            .filter_map(|(pointer, node)| node.select_ref().map(|node_ref| (pointer, node_ref)))
            .map(|(_pointer, node_ref)| ReferencedDocument {
                retrieval_url: retrieval_url.join(node_ref).unwrap(),
                given_url: self.get_document_uri().join(node_ref).unwrap(),
            })
            .collect()
    }

    fn get_embedded_documents(self: Rc<Self>, retrieval_url: &Url) -> Vec<EmbeddedDocument> {
        self.nodes
            .iter()
            .filter_map(|(pointer, node)| node.select_id().map(|node_id| (pointer, node_id)))
            .map(|(pointer, node_id)| EmbeddedDocument {
                retrieval_url: retrieval_url.join(node_id).unwrap(),
                given_url: self.get_document_uri().join(node_id).unwrap(),
                node_url: self
                    .get_document_uri()
                    .join(&format!("#{}", pointer))
                    .unwrap(),
            })
            .collect()
    }

    fn get_intermediate_node_entries(&self) -> Box<dyn Iterator<Item = Value> + '_> {
        todo!()
    }
}