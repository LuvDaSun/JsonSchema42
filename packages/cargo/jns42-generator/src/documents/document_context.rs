use crate::{
    models,
    utils::{
        read_json_node::read_json_node, schema::discover_schema_uri, url::normalize_url,
        yaml::load_yaml,
    },
};
use serde_json::Value;
use std::{
    cell::{Ref, RefCell, RefMut},
    collections::{HashMap, HashSet},
    rc::Rc,
};
use url::Url;

use super::{document::Document, meta::MetaSchemaId, schema_document::SchemaDocument};

pub struct DocumentInitializer {
    pub retrieval_url: Url,
    pub given_url: Url,
    pub antecedent_url: Option<Url>,
    pub document_node: Value,
}

pub type DocumentFactory = dyn Fn(DocumentContext, DocumentInitializer) -> Rc<dyn Document>;

#[derive(Default)]
struct Inner {
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

#[derive(Clone, Default)]
pub struct DocumentContext(Rc<RefCell<Inner>>);

impl DocumentContext {
    pub fn new() -> Self {
        Default::default()
    }

    fn borrow(&self) -> Ref<Inner> {
        self.0.borrow()
    }

    fn borrow_mut(&mut self) -> RefMut<Inner> {
        self.0.borrow_mut()
    }

    pub fn register_factory(&mut self, schema: &MetaSchemaId, factory: Box<DocumentFactory>) {
        let mut inner_mut = self.borrow_mut();
        /*
         * don't check if the factory is already registered here so we can
         * override factories
         */
        inner_mut.factories.insert(schema.clone(), factory);
    }

    #[allow(dead_code)]
    pub fn get_intermediate_data(&self) -> models::intermediate::IntermediateSchema {
        models::intermediate::IntermediateSchema {
            schemas: self.get_intermediate_schema_entries(),
        }
    }

    pub fn get_intermediate_schema_entries(&self) -> Vec<serde_json::Value> {
        let inner = self.borrow();

        inner
            .documents
            .iter()
            .flat_map(|(_id, document)| document.get_intermediate_node_entries())
            .cloned()
            .collect()
    }

    #[allow(dead_code)]
    pub fn get_document(&self, document_url: &Url) -> Rc<dyn Document> {
        let inner = self.borrow();

        let document = inner
            .documents
            .get(&normalize_url(document_url))
            .unwrap()
            .clone();

        document
    }

    #[allow(dead_code)]
    pub fn get_document_for_node(&self, node_url: &Url) -> Rc<dyn Document> {
        let inner = self.borrow();

        let document_url = inner.node_documents.get(&normalize_url(node_url)).unwrap();

        self.get_document(document_url)
    }

    pub async fn load_from_url(
        &mut self,
        retrieval_url: &Url,
        given_url: &Url,
        antecedent_url: Option<&Url>,
        default_schema_uri: &MetaSchemaId,
    ) {
        let document_node_is_none = {
            let inner = self.borrow();
            let document_node = inner.node_cache.get(&normalize_url(retrieval_url));
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
        &mut self,
        retrieval_url: &Url,
        given_url: &Url,
        antecedent_url: Option<&Url>,
        document_node: serde_json::Value,
        default_schema_uri: &MetaSchemaId,
    ) {
        let node_cache_contains_key = {
            let inner = self.borrow();
            inner.node_cache.contains_key(retrieval_url)
        };

        if !node_cache_contains_key {
            self.fill_node_cache(retrieval_url, document_node)
        }

        self.load_from_cache(retrieval_url, given_url, antecedent_url, default_schema_uri)
            .await;
    }

    fn fill_node_cache(&mut self, retrieval_url: &Url, document_node: serde_json::Value) {
        for (pointer, node) in read_json_node("".into(), document_node) {
            let node_url = retrieval_url.join(&format!("#{}", pointer)).unwrap();
            assert!(self
                .borrow_mut()
                .node_cache
                .insert(normalize_url(&node_url), node)
                .is_none())
        }
    }

    async fn load_from_cache(
        &mut self,
        retrieval_url: &Url,
        given_url: &Url,
        antecedent_url: Option<&Url>,
        default_schema_uri: &MetaSchemaId,
    ) {
        let self_clone = self.clone();
        let mut inner_mut = self.borrow_mut();

        if !inner_mut.loaded.insert(normalize_url(retrieval_url)) {
            return;
        }

        let node = inner_mut
            .node_cache
            .get(&normalize_url(retrieval_url))
            .unwrap();

        let schema_uri = discover_schema_uri(node).unwrap_or_else(|| default_schema_uri.clone());
        let factory = inner_mut.factories.get(&schema_uri).unwrap();

        let document = factory(
            self_clone,
            DocumentInitializer {
                retrieval_url: retrieval_url.clone(),
                given_url: given_url.clone(),
                antecedent_url: antecedent_url.cloned(),
                document_node: node.clone(),
            },
        );
        let document_uri = document.get_document_uri();
        let document_uri_string = document_uri.as_str();

        assert!(inner_mut
            .documents
            .insert(normalize_url(document_uri), document.clone())
            .is_none());

        for node_url in document.get_node_urls() {
            let document_node_url_previous = inner_mut.node_documents.get(&normalize_url(node_url));

            if let Some(document_node_url_previous) = document_node_url_previous {
                let document_node_url_previous_string = document_node_url_previous.as_str();

                if document_node_url_previous_string.starts_with(document_uri_string) {
                    continue;
                }

                if document_uri_string.starts_with(document_node_url_previous_string) {
                    assert!(inner_mut
                        .node_documents
                        .insert(normalize_url(node_url), normalize_url(document_uri))
                        .is_some());
                    continue;
                }

                unreachable!("duplicate node");
            }
            assert!(inner_mut
                .node_documents
                .insert(normalize_url(node_url), normalize_url(document_uri))
                .is_none());
        }
    }

    #[allow(dead_code)]
    async fn load_from_schema_document(
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
