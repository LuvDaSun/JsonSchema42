use crate::{
    models,
    utils::{read_json_node::read_json_node, schema::discover_schema_uri, yaml::load_yaml},
};
use std::{
    collections::{HashMap, HashSet},
    rc::Rc,
};
use url::Url;

use super::{document::Document, meta::MetaSchemaId, schema_document::SchemaDocument};

type DocumentFactory = dyn Fn() -> Rc<dyn Document>;

pub struct DocumentContext {
    /**
     * document factories by schema identifier
     */
    factories: HashMap<MetaSchemaId, Box<DocumentFactory>>,

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
    pub fn new() -> Self {
        Self {
            factories: Default::default(),
            documents: Default::default(),
            node_documents: Default::default(),
            node_cache: Default::default(),
            loaded: Default::default(),
        }
    }

    pub fn register_factory(&mut self, schema: &MetaSchemaId, factory: Box<DocumentFactory>) {
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
        default_schema_uri: &MetaSchemaId,
    ) {
        let document_node = self.node_cache.get(retrieval_url);

        if document_node.is_none() {
            // TODO remove unwrap
            let document_node = load_yaml(retrieval_url).await.unwrap();

            self.fill_node_cache(retrieval_url, document_node.unwrap());
        }

        self.load_from_cache(retrieval_url, given_url, antecedent_url, default_schema_uri);
    }

    pub async fn load_from_document(
        &mut self,
        retrieval_url: &Url,
        given_url: &Url,
        antecedent_url: Option<&Url>,
        document_node: serde_json::Value,
        default_schema_uri: &MetaSchemaId,
    ) {
        if !self.node_cache.contains_key(retrieval_url) {
            self.fill_node_cache(retrieval_url, document_node)
        }

        self.load_from_cache(retrieval_url, given_url, antecedent_url, default_schema_uri)
            .await;
    }

    fn fill_node_cache(&mut self, retrieval_url: &Url, document_node: serde_json::Value) {
        for (pointer, node) in read_json_node("".into(), document_node) {
            let node_url = retrieval_url.join(&format!("#{}", pointer)).unwrap();
            assert!(self.node_cache.insert(node_url, node).is_none())
        }
    }

    async fn load_from_cache(
        &mut self,
        retrieval_url: &Url,
        _given_url: &Url,
        _antecedent_url: Option<&Url>,
        default_schema_uri: &MetaSchemaId,
    ) {
        if !self.loaded.insert(retrieval_url.clone()) {
            return;
        }

        let node = self.node_cache.get(retrieval_url).unwrap();

        let schema_uri = discover_schema_uri(&node).unwrap_or_else(|| default_schema_uri.clone());
        let factory = self.factories.get(&schema_uri).unwrap();

        let document = factory();
        let document_uri = document.get_document_uri();
        let document_uri_string = document_uri.as_str();

        assert!(self
            .documents
            .insert(document_uri.clone(), document.clone())
            .is_none());

        for node_url in document.get_node_urls() {
            let document_node_url_previous = self.node_documents.get(node_url);

            if let Some(document_node_url_previous) = document_node_url_previous {
                let document_node_url_previous_string = document_node_url_previous.as_str();

                if document_node_url_previous_string.starts_with(document_uri_string) {
                    continue;
                }

                if document_uri_string.starts_with(document_node_url_previous_string) {
                    assert!(self
                        .node_documents
                        .insert(node_url.clone(), document_uri.clone())
                        .is_some());
                    continue;
                }

                unreachable!("duplicate node");
            }
            assert!(self
                .node_documents
                .insert(node_url.clone(), document_uri.clone())
                .is_none());
        }

        todo!()
    }

    async fn _load_from_schema_document(
        &mut self,
        retrieval_url: &Url,
        document: impl SchemaDocument,
        default_schema_uri: &MetaSchemaId,
    ) {
        for embedded_document in document.get_embedded_documents(retrieval_url) {
            self.load_from_document(
                &embedded_document.retrieval_url,
                &embedded_document.given_url,
                Some(document.get_document_uri()),
                embedded_document.node.clone(),
                default_schema_uri,
            )
            .await;
        }

        for referenced_document in document.get_referenced_documents(retrieval_url) {
            self.load_from_url(
                &referenced_document.retrieval_url,
                &referenced_document.given_url,
                Some(document.get_document_uri()),
                default_schema_uri,
            )
            .await;
        }
    }
}
