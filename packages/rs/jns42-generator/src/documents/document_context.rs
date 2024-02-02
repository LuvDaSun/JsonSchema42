use crate::models;
use std::{
    collections::{HashMap, HashSet},
    iter::{self, empty},
    rc::Rc,
};
use url::Url;

use super::document::{self, Document};

type DocumentFactory = dyn Fn() -> dyn Document;

pub struct DocumentContext {
    /**
     * document factories by schema identifier
     */
    factories: HashMap<Url, Box<DocumentFactory>>,

    /**
     * all documents, indexed by document id
     */
    documents: HashMap<Url, Rc<dyn Document>>,

    /**
     * maps node urls to their documents
     */
    node_documents: HashMap<Url, Url>,

    /**
     * all loaded nodes
     */
    node_cache: HashMap<Url, serde_json::Value>,

    /**
     * keep track of what we have been loading (so we only load it once)
     */
    loaded: HashSet<Url>,
}

impl DocumentContext {
    pub fn register_factory(&mut self, schema: Url, factory: Box<DocumentFactory>) {
        /*
         * don't check if the factory is already registered here so we can
         * override factories
         */
        self.factories.insert(schema, factory);
    }

    pub fn get_intermediate_data(&self) -> models::intermediate::IntermediateSchema {
        models::intermediate::IntermediateSchema {
            schemas: self.get_intermediate_schema_entries().cloned().collect(),
        }
    }

    pub fn get_intermediate_schema_entries(
        &self,
    ) -> Box<dyn Iterator<Item = &serde_json::Value> + '_> {
        Box::new(
            self.documents
                .iter()
                .flat_map(|(_id, document)| document.get_intermediate_node_entries()),
        )
    }

    pub fn get_document(&self, document_url: &Url) -> Rc<dyn Document> {
        let document = self.documents.get(document_url).unwrap().clone();

        document
    }

    pub fn get_document_for_node(&self, node_url: &Url) -> Rc<dyn Document> {
        let document_url = self.node_documents.get(node_url).unwrap();

        self.get_document(document_url)
    }
}
