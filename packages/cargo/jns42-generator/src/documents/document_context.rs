use super::{meta::MetaSchemaId, schema_document::SchemaDocument};
use crate::{
    models,
    utils::{read_json_node::read_json_node, url::normalize_url, yaml::load_yaml},
};
use async_recursion::async_recursion;
use serde_json::Value;
use std::{
    cell::RefCell,
    collections::{HashMap, HashSet},
    rc::{Rc, Weak},
};
use url::Url;

pub struct DocumentInitializer<'a> {
    pub retrieval_url: Url,
    pub given_url: Url,
    pub antecedent_url: Option<Url>,
    pub document_node: &'a Value,
}

pub type DocumentFactory =
    dyn Fn(Weak<DocumentContext>, DocumentInitializer) -> Rc<dyn SchemaDocument>;

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
            node_cache.contains_key(&normalize_url(retrieval_url))
        };

        if !node_cache_contains_key {
            self.fill_node_cache(retrieval_url, document_node)
        }

        self.load_from_cache(retrieval_url, given_url, antecedent_url, default_schema_uri)
            .await;
    }

    fn fill_node_cache(self: &Rc<Self>, retrieval_url: &Url, document_node: serde_json::Value) {
        for (pointer, node) in read_json_node("".into(), document_node) {
            let node_url = retrieval_url.join(&format!("#{}", pointer)).unwrap();
            assert!(self
                .node_cache
                .borrow_mut()
                .insert(normalize_url(&node_url), node)
                .is_none())
        }
    }

    #[async_recursion(?Send)]
    async fn load_from_cache<'a>(
        self: &'a Rc<Self>,
        retrieval_url: &'a Url,
        given_url: &'a Url,
        antecedent_url: Option<&'a Url>,
        default_schema_uri: &'a MetaSchemaId,
    ) {
        if !self
            .loaded
            .borrow_mut()
            .insert(normalize_url(retrieval_url))
        {
            return;
        }

        let node = self
            .node_cache
            .borrow()
            .get(&normalize_url(retrieval_url))
            .unwrap()
            .clone();

        let schema_uri =
            MetaSchemaId::discover(&node).unwrap_or_else(|| default_schema_uri.clone());
        let factory = self.factories.get(&schema_uri).unwrap();

        let document = factory(
            Rc::downgrade(self),
            DocumentInitializer {
                retrieval_url: retrieval_url.clone(),
                given_url: given_url.clone(),
                antecedent_url: antecedent_url.cloned(),
                document_node: &node,
            },
        );
        let document_uri = normalize_url(&document.get_document_uri());
        let document_uri_string = document_uri.as_str();

        assert!(self
            .documents
            .borrow_mut()
            .insert(normalize_url(&document_uri), document.clone())
            .is_none());

        for node_url in document.get_node_urls() {
            let document_node_url_previous = self
                .node_documents
                .borrow()
                .get(&normalize_url(&node_url))
                .map(normalize_url);

            if let Some(document_node_url_previous) = document_node_url_previous {
                let document_node_url_previous_string = document_node_url_previous.as_str();

                if document_node_url_previous_string.starts_with(document_uri_string) {
                    continue;
                }

                if document_uri_string.starts_with(document_node_url_previous_string) {
                    assert!(self
                        .node_documents
                        .borrow_mut()
                        .insert(normalize_url(&node_url), normalize_url(&document_uri))
                        .is_some());
                    continue;
                }

                unreachable!("duplicate node");
            }
            assert!(self
                .node_documents
                .borrow_mut()
                .insert(normalize_url(&node_url), normalize_url(&document_uri))
                .is_none());
        }

        let embedded_documents = document.clone().get_embedded_documents(retrieval_url);
        for embedded_document in embedded_documents {
            let node = self
                .clone()
                .node_cache
                .borrow()
                .get(&normalize_url(&embedded_document.node_url))
                .unwrap()
                .clone();
            self.load_from_document(
                &embedded_document.retrieval_url,
                &embedded_document.given_url,
                Some(&document.get_document_uri()),
                node,
                default_schema_uri,
            )
            .await;
        }

        let referenced_documents = document.clone().get_referenced_documents(retrieval_url);
        for referenced_document in referenced_documents {
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
