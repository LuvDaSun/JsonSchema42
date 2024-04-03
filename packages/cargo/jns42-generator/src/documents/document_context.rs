use super::{meta::MetaSchemaId, schema_document::SchemaDocument};
use crate::utils::{read_json_node::read_json_node, yaml::load_yaml};
use jns42_core::models::intermediate::IntermediateNode;
use jns42_core::models::intermediate::IntermediateSchema;
use jns42_core::utils::node_location::NodeLocation;
use serde_json::Value;
use std::{
  cell::RefCell,
  collections::{HashMap, HashSet},
  rc::{Rc, Weak},
};

pub struct DocumentInitializer<'a> {
  pub retrieval_url: NodeLocation,
  pub given_url: NodeLocation,
  pub antecedent_url: Option<NodeLocation>,
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
  documents: RefCell<HashMap<NodeLocation, Rc<dyn SchemaDocument>>>,

  /**
   * maps node urls to their documents
   */
  node_documents: RefCell<HashMap<NodeLocation, NodeLocation>>,

  /**
   * all loaded nodes
   */
  cache: RefCell<HashMap<NodeLocation, serde_json::Value>>,

  /**
   * keep track of what we have been loading (so we only load it once)
   */
  loaded: RefCell<HashSet<String>>,

  /**
   * maps retrieval url to document url
   */
  resolved: RefCell<HashMap<NodeLocation, NodeLocation>>,
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

  pub fn resolve_retrieval_url(&self, retrieval_url: &NodeLocation) -> Option<NodeLocation> {
    self.resolved.borrow().get(retrieval_url).cloned()
  }

  pub fn get_intermediate_document(&self) -> IntermediateSchema {
    IntermediateSchema {
      schema: "https://schema.JsonSchema42.org/jns42-intermediate/schema.json".to_string(),
      schemas: self.get_intermediate_schema_map(),
    }
  }

  pub fn get_intermediate_schema_map(&self) -> HashMap<NodeLocation, IntermediateNode> {
    let documents = self.documents.borrow();

    documents
      .iter()
      .flat_map(|(_id, document)| document.get_intermediate_node_entries())
      .collect()
  }

  pub fn get_document(&self, document_url: &NodeLocation) -> Rc<dyn SchemaDocument> {
    let documents = self.documents.borrow();

    let document = documents.get(document_url).unwrap().clone();

    document
  }

  pub fn get_document_for_node(&self, node_url: &NodeLocation) -> Rc<dyn SchemaDocument> {
    let node_documents = self.node_documents.borrow();

    let document_url = node_documents.get(node_url).unwrap();

    self.get_document(document_url)
  }

  pub async fn load_from_url(
    self: &Rc<Self>,
    retrieval_url: &NodeLocation,
    given_url: &NodeLocation,
    antecedent_url: Option<&NodeLocation>,
    default_schema_uri: &MetaSchemaId,
  ) {
    let mut queue = Default::default();
    self
      .load_from_url_with_queue(
        retrieval_url,
        given_url,
        antecedent_url,
        default_schema_uri,
        &mut queue,
      )
      .await;
    self.load_from_cache_queue(&mut queue).await;
  }

  async fn load_from_url_with_queue(
    self: &Rc<Self>,
    retrieval_url: &NodeLocation,
    given_url: &NodeLocation,
    antecedent_url: Option<&NodeLocation>,
    default_schema_uri: &MetaSchemaId,
    queue: &mut Vec<(
      NodeLocation,
      NodeLocation,
      Option<NodeLocation>,
      MetaSchemaId,
    )>,
  ) {
    let document_node_is_none = {
      let node_cache = self.cache.borrow();
      let document_node = node_cache.get(retrieval_url);
      document_node.is_none()
    };

    if document_node_is_none {
      let document_node = load_yaml(&retrieval_url.to_retrieval_location())
        .await
        .unwrap();

      self.fill_node_cache(retrieval_url, document_node.unwrap());
    }

    queue.push((
      retrieval_url.clone(),
      given_url.clone(),
      antecedent_url.cloned(),
      default_schema_uri.clone(),
    ));
  }

  pub async fn load_from_document(
    self: &Rc<Self>,
    retrieval_url: &NodeLocation,
    given_url: &NodeLocation,
    antecedent_url: Option<&NodeLocation>,
    document_node: serde_json::Value,
    default_schema_uri: &MetaSchemaId,
  ) {
    let mut queue = Default::default();
    self
      .load_from_document_with_queue(
        retrieval_url,
        given_url,
        antecedent_url,
        document_node,
        default_schema_uri,
        &mut queue,
      )
      .await;
    self.load_from_cache_queue(&mut queue).await;
  }

  async fn load_from_document_with_queue(
    self: &Rc<Self>,
    retrieval_url: &NodeLocation,
    given_url: &NodeLocation,
    antecedent_url: Option<&NodeLocation>,
    document_node: serde_json::Value,
    default_schema_uri: &MetaSchemaId,
    queue: &mut Vec<(
      NodeLocation,
      NodeLocation,
      Option<NodeLocation>,
      MetaSchemaId,
    )>,
  ) {
    let node_cache_contains_key = {
      let node_cache = self.cache.borrow();
      node_cache.contains_key(retrieval_url)
    };

    if !node_cache_contains_key {
      self.fill_node_cache(retrieval_url, document_node)
    }

    queue.push((
      retrieval_url.clone(),
      given_url.clone(),
      antecedent_url.cloned(),
      default_schema_uri.clone(),
    ));
  }

  fn fill_node_cache(&self, retrieval_url: &NodeLocation, document_node: serde_json::Value) {
    for (pointer, node) in read_json_node(&[], document_node) {
      let mut node_url = retrieval_url.clone();
      node_url.set_pointer(pointer);
      assert!(self.cache.borrow_mut().insert(node_url, node).is_none())
    }
  }

  async fn load_from_cache_queue(
    self: &Rc<Self>,
    queue: &mut Vec<(
      NodeLocation,
      NodeLocation,
      Option<NodeLocation>,
      MetaSchemaId,
    )>,
  ) {
    while let Some((retrieval_url, given_url, antecedent_url, default_schema_uri)) = queue.pop() {
      self
        .load_from_cache_with_queue(
          &retrieval_url,
          &given_url,
          antecedent_url.as_ref(),
          &default_schema_uri,
          queue,
        )
        .await;
    }
  }

  async fn load_from_cache_with_queue(
    self: &Rc<Self>,
    retrieval_url: &NodeLocation,
    given_url: &NodeLocation,
    antecedent_url: Option<&NodeLocation>,
    default_schema_uri: &MetaSchemaId,
    queue: &mut Vec<(
      NodeLocation,
      NodeLocation,
      Option<NodeLocation>,
      MetaSchemaId,
    )>,
  ) {
    if self.node_documents.borrow().contains_key(retrieval_url) {
      return;
    }

    let server_url = retrieval_url.to_retrieval_location();
    if !self.loaded.borrow_mut().insert(server_url) {
      return;
    }

    let node = self.cache.borrow().get(retrieval_url).unwrap().clone();

    let schema_uri = MetaSchemaId::discover(&node).unwrap_or_else(|| default_schema_uri.clone());
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
    let document_uri = document.get_document_uri();

    assert!(self
      .resolved
      .borrow_mut()
      .insert(retrieval_url.clone(), document_uri.clone())
      .is_none());

    assert!(self
      .documents
      .borrow_mut()
      .insert(document_uri.clone(), document.clone())
      .is_none());

    // Map node urls to this document
    for node_url in document.get_node_urls() {
      let ok = self
        .node_documents
        .borrow_mut()
        .insert(node_url.clone(), document_uri.clone())
        .is_none();
      if !ok {
        println!("{} -> {}", node_url.to_string(), document_uri.to_string());
      }
    }

    let embedded_documents = document.get_embedded_documents();
    for embedded_document in embedded_documents {
      let node = self
        .clone()
        .cache
        .borrow()
        .get(&embedded_document.retrieval_url)
        .unwrap()
        .clone();
      self
        .load_from_document_with_queue(
          &embedded_document.retrieval_url,
          &embedded_document.given_url,
          Some(document.get_document_uri()),
          node,
          default_schema_uri,
          queue,
        )
        .await;
    }

    let referenced_documents = document.get_referenced_documents();
    for referenced_document in referenced_documents {
      self
        .load_from_url_with_queue(
          &referenced_document.retrieval_url,
          &referenced_document.given_url,
          Some(document.get_document_uri()),
          default_schema_uri,
          queue,
        )
        .await;
    }
  }
}
