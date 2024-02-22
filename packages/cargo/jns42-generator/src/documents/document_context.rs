use crate::{
    models,
    utils::{read_json_node::read_json_node, url::normalize_url, yaml::load_yaml},
};
use serde_json::Value;
use std::{
    cell::RefCell,
    collections::{HashMap, HashSet},
    rc::Rc,
};
use url::Url;

use super::{meta::MetaSchemaId, schema_document::SchemaDocument};

pub struct DocumentInitializer<'a> {
    pub retrieval_url: Url,
    pub given_url: Url,
    pub antecedent_url: Option<Url>,
    pub document_node: &'a Value,
}

pub type DocumentFactory =
    dyn Fn(Rc<DocumentContext>, DocumentInitializer) -> Rc<dyn SchemaDocument>;

#[derive(Default)]
pub struct DocumentContext {
    /**
     * document factories by schema identifier
     */
    factories: HashMap<MetaSchemaId, Box<DocumentFactory>>,

    /**
     * all documents, indexed by document id
     */
    documents: RefCell<HashMap<Url, Rc<dyn SchemaDocument>>>,

    /**
     * maps node urls to their documents
     */
    node_documents: RefCell<HashMap<Url, Url>>,

    /**
     * all loaded nodes
     */
    node_cache: RefCell<HashMap<Url, serde_json::Value>>,

    /**
     * keep track of what we have been loading (so we only load it once)
     */
    loaded: RefCell<HashSet<Url>>,
}

impl DocumentContext {
    pub fn new() -> Self {
        Default::default()
    }

    pub fn register_factory(&mut self, schema: &MetaSchemaId, factory: Box<DocumentFactory>) {
        /*
         * don't check if the factory is already registered here so we can
         * override factories
         */
        self.factories.insert(schema.clone(), factory);
    }

    #[allow(dead_code)]
    pub fn get_intermediate_data(&self) -> models::intermediate::IntermediateSchema {
        models::intermediate::IntermediateSchema {
            schemas: self.get_intermediate_schema_entries(),
        }
    }

    pub fn get_intermediate_schema_entries(&self) -> Vec<serde_json::Value> {
        let documents = self.documents.borrow();

        documents
            .iter()
            .flat_map(|(_id, document)| document.get_intermediate_node_entries())
            .collect()
    }

    #[allow(dead_code)]
    pub fn get_document(&self, document_url: &Url) -> Rc<dyn SchemaDocument> {
        let documents = self.documents.borrow();

        let document = documents.get(&normalize_url(document_url)).unwrap().clone();

        document
    }

    #[allow(dead_code)]
    pub fn get_document_for_node(&self, node_url: &Url) -> Rc<dyn SchemaDocument> {
        let node_documents = self.node_documents.borrow();

        let document_url = node_documents.get(&normalize_url(node_url)).unwrap();

        self.get_document(document_url)
    }

    pub async fn load_from_url(
        self: &Rc<Self>,
        retrieval_url: &Url,
        given_url: &Url,
        antecedent_url: Option<&Url>,
        default_schema_uri: &MetaSchemaId,
    ) {
        let document_node_is_none = {
            let node_cache = self.node_cache.borrow();
            let document_node = node_cache.get(&normalize_url(retrieval_url));
            document_node.is_none()
        };

        if document_node_is_none {
            let document_node = load_yaml(retrieval_url).await.unwrap();

            self.fill_node_cache(retrieval_url, document_node.unwrap());
        }

        self.load_from_cache(retrieval_url, given_url, antecedent_url, default_schema_uri)
            .await;
    }

    #[allow(dead_code)]
    pub async fn load_from_document(
        self: &Rc<Self>,
        retrieval_url: &Url,
        given_url: &Url,
        antecedent_url: Option<&Url>,
        document_node: serde_json::Value,
        default_schema_uri: &MetaSchemaId,
    ) {
        let node_cache_contains_key = {
            let node_cache = self.node_cache.borrow();
            node_cache.contains_key(retrieval_url)
        };

        if !node_cache_contains_key {
            self.fill_node_cache(retrieval_url, document_node)
        }

        self.load_from_cache(retrieval_url, given_url, antecedent_url, default_schema_uri)
            .await;
    }

    fn fill_node_cache(self: &Rc<Self>, retrieval_url: &Url, document_node: serde_json::Value) {
        let mut node_cache_mut = self.node_cache.borrow_mut();
        for (pointer, node) in read_json_node("".into(), document_node) {
            let node_url = retrieval_url.join(&format!("#{}", pointer)).unwrap();
            assert!(node_cache_mut
                .insert(normalize_url(&node_url), node)
                .is_none())
        }
    }

    async fn load_from_cache(
        self: &Rc<Self>,
        retrieval_url: &Url,
        given_url: &Url,
        antecedent_url: Option<&Url>,
        default_schema_uri: &MetaSchemaId,
    ) {
        let node_cache = self.node_cache.borrow();
        let mut loaded_mut = self.loaded.borrow_mut();
        let mut documents_mut = self.documents.borrow_mut();
        let mut node_documents_mut = self.node_documents.borrow_mut();

        if !loaded_mut.insert(normalize_url(retrieval_url)) {
            return;
        }

        let node = node_cache.get(&normalize_url(retrieval_url)).unwrap();

        let schema_uri = MetaSchemaId::discover(node).unwrap_or_else(|| default_schema_uri.clone());
        let factory = self.factories.get(&schema_uri).unwrap();

        let document = factory(
            self.clone(),
            DocumentInitializer {
                retrieval_url: retrieval_url.clone(),
                given_url: given_url.clone(),
                antecedent_url: antecedent_url.cloned(),
                document_node: node,
            },
        );
        let document_uri = document.get_document_uri();
        let document_uri_string = document_uri.as_str();

        assert!(documents_mut
            .insert(normalize_url(&document_uri), document.clone())
            .is_none());

        for node_url in document.get_node_urls() {
            let document_node_url_previous = node_documents_mut.get(&normalize_url(&node_url));

            if let Some(document_node_url_previous) = document_node_url_previous {
                let document_node_url_previous_string = document_node_url_previous.as_str();

                if document_node_url_previous_string.starts_with(document_uri_string) {
                    continue;
                }

                if document_uri_string.starts_with(document_node_url_previous_string) {
                    assert!(node_documents_mut
                        .insert(normalize_url(&node_url), normalize_url(&document_uri))
                        .is_some());
                    continue;
                }

                unreachable!("duplicate node");
            }
            assert!(node_documents_mut
                .insert(normalize_url(&node_url), normalize_url(&document_uri))
                .is_none());
        }
    }

    #[allow(dead_code)]
    async fn load_from_schema_document(
        self: &Rc<Self>,
        retrieval_url: &Url,
        document: impl SchemaDocument,
        default_schema_uri: &MetaSchemaId,
    ) {
        for embedded_document in document.get_embedded_documents(retrieval_url) {
            self.load_from_document(
                &embedded_document.retrieval_url,
                &embedded_document.given_url,
                Some(&document.get_document_uri()),
                embedded_document.node.clone(),
                default_schema_uri,
            )
            .await;
        }

        for referenced_document in document.get_referenced_documents(retrieval_url) {
            self.load_from_url(
                &referenced_document.retrieval_url,
                &referenced_document.given_url,
                Some(&document.get_document_uri()),
                default_schema_uri,
            )
            .await;
        }
    }
}
