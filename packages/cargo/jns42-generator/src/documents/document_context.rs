use crate::{models, utils::yaml::load_yaml};
use std::{
    collections::{HashMap, HashSet},
    rc::Rc,
};
use url::Url;

use super::{document::Document, schema_document::SchemaDocument};

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
    pub fn register_factory(&mut self, schema: &Url, factory: Box<DocumentFactory>) {
        /*
         * don't check if the factory is already registered here so we can
         * override factories
         */
        self.factories.insert(schema.clone(), factory);
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

    pub async fn load_from_url(
        &mut self,
        retrieval_url: &Url,
        given_url: &Url,
        antecedent_url: Option<&Url>,
        default_schema_id: &Url,
    ) {
        let document_node = self.node_cache.get(retrieval_url);

        if document_node.is_none() {
            // TODO remove unwrap
            let document_node = load_yaml(retrieval_url).await.unwrap();

            self.fill_node_cache(retrieval_url, Rc::new(document_node));
        }

        self.load_from_cache(retrieval_url, given_url, antecedent_url, default_schema_id);
    }

    pub async fn load_from_document(
        &mut self,
        _retrieval_url: &Url,
        _given_url: &Url,
        _antecedent_url: Option<&Url>,
        _document_node: Rc<serde_json::Value>,
        _default_schema_id: &Url,
    ) {
        todo!()
    }

    fn fill_node_cache(&mut self, _retrieval_url: &Url, _document_nodee: Rc<serde_json::Value>) {
        todo!()
    }

    fn load_from_cache(
        &mut self,
        _retrieval_url: &Url,
        _given_url: &Url,
        _antecedent_url: Option<&Url>,
        _default_schema_id: &Url,
    ) {
        todo!()
    }

    async fn load_from_schema_document(
        &mut self,
        retrieval_url: &Url,
        document: impl SchemaDocument,
        default_schema_id: &Url,
    ) {
        for embedded_document in document.get_embedded_documents(retrieval_url) {
            self.load_from_document(
                &embedded_document.retrieval_url,
                &embedded_document.given_url,
                Some(document.get_document_id()),
                embedded_document.node.clone(),
                default_schema_id,
            )
            .await;
        }

        for referenced_document in document.get_referenced_documents(retrieval_url) {
            self.load_from_url(
                &referenced_document.retrieval_url,
                &referenced_document.given_url,
                Some(document.get_document_id()),
                default_schema_id,
            )
            .await;
        }
    }
}
