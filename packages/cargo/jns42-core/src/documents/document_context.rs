use super::{meta::MetaSchemaId, schema_document::SchemaDocument};
use crate::documents;
use crate::{
  models::IntermediateSchema,
  utils::{node_location::NodeLocation, read_json_node::read_json_node},
};
use std::{
  cell::RefCell,
  collections::HashMap,
  rc::{Rc, Weak},
};

pub struct DocumentConfiguration<'a> {
  pub retrieval_url: NodeLocation,
  pub given_url: NodeLocation,
  pub antecedent_url: Option<NodeLocation>,
  pub document_node: &'a serde_json::Value,
}

pub type DocumentFactory =
  dyn Fn(Weak<DocumentContext>, DocumentConfiguration) -> Rc<dyn SchemaDocument>;

pub type Queue = Vec<(
  NodeLocation,
  NodeLocation,
  Option<NodeLocation>,
  MetaSchemaId,
)>;

/**
This class loads document nodes and documents. Every node has a few locations:
- Node location

  This is the main identifier for the node

- Retrieval location

  This is the physical location of the node we often use this as a primary identifier

- Document location

  This is the node location of the document this node belongs to

- Antecedent location

  This is the antecedent (reason) for the node, (or empty if no antecedent). Antecedent
  can be a referencing document, or the embedding document.

- Given location

  This is an expected location for a node that is often derived from the antecedent and the
  JSON pointer to the node.


*/
#[derive(Default)]
pub struct DocumentContext {
  /**
  Maps node retrieval urls to their documents. Every node has a location that is an identifier. Thi
  map maps that identifier to the identifier of a document.
  */
  node_documents: RefCell<HashMap<NodeLocation, NodeLocation>>,

  /**
  Keeps all loaded nodes. Nodes are retrieved and then stored in this cache. Then we work
  exclusively from this cache. The key is the retrieval location of the node.
  */
  node_cache: RefCell<HashMap<NodeLocation, serde_json::Value>>,

  /**
   * all documents, indexed by the document node id of the document
   */
  documents: RefCell<HashMap<NodeLocation, Rc<dyn SchemaDocument>>>,

  /**
  This map maps document retrieval locations to document root locations
   */
  document_resolved: RefCell<HashMap<NodeLocation, NodeLocation>>,

  /**
   * document factories by schema identifier
   */
  factories: HashMap<MetaSchemaId, Box<DocumentFactory>>,
}

impl DocumentContext {
  pub fn new() -> Self {
    Default::default()
  }

  pub fn into_rc(self) -> Rc<Self> {
    Rc::new(self)
  }

  pub fn register_well_known_factories(&mut self) {
    self.register_factory(
      &MetaSchemaId::Draft202012,
      Box::new(move |context, configuration| {
        Rc::new(documents::draft_2020_12::Document::new(
          context,
          configuration.retrieval_url,
          configuration.given_url,
          configuration.antecedent_url,
          configuration.document_node.clone().into(),
        ))
      }),
    );
    // context.register_factory(
    //   &MetaSchemaId::Draft201909,
    //   Box::new(move |_context, _initializer| Rc::new(documents::draft_2019_09::Document::new())),
    // );
    // context.register_factory(
    //   &MetaSchemaId::Draft07,
    //   Box::new(move |_context, _initializer| Rc::new(documents::draft_07::Document::new())),
    // );
    // context.register_factory(
    //   &MetaSchemaId::Draft06,
    //   Box::new(move |_context, _initializer| Rc::new(documents::draft_06::Document::new())),
    // );
    // context.register_factory(
    //   &MetaSchemaId::Draft04,
    //   Box::new(move |_context, _initializer| Rc::new(documents::draft_04::Document::new())),
    // );
    // context.register_factory(
    //   &MetaSchemaId::Draft04,
    //   Box::new(move |_context, _initializer| Rc::new(documents::oas_v3_1::Document::new())),
    // );
    // context.register_factory(
    //   &MetaSchemaId::Draft04,
    //   Box::new(move |_context, _initializer| Rc::new(documents::oas_v3_0::Document::new())),
    // );
    // context.register_factory(
    //   &MetaSchemaId::Draft04,
    //   Box::new(move |_context, _initializer| Rc::new(documents::swagger_v2::Document::new())),
    // );
  }

  pub fn register_factory(&mut self, schema: &MetaSchemaId, factory: Box<DocumentFactory>) {
    /*
     * don't check if the factory is already registered here so we can
     * override factories
     */
    self.factories.insert(schema.clone(), factory);
  }

  pub fn resolve_document_retrieval_url(
    &self,
    document_retrieval_url: &NodeLocation,
  ) -> Option<NodeLocation> {
    self
      .document_resolved
      .borrow()
      .get(document_retrieval_url)
      .cloned()
  }

  pub fn get_intermediate_document(&self) -> IntermediateSchema {
    let schemas = self
      .documents
      .borrow()
      .values()
      .flat_map(|document| document.get_intermediate_node_entries())
      .collect();

    IntermediateSchema {
      schema: "https://schema.JsonSchema42.org/jns42-intermediate/schema.json".to_string(),
      schemas,
    }
  }

  /**
  Load nodes from a location. The retrieval location is the physical location of the node,
  it should be a root location
  */
  pub async fn load_from_location(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    default_schema_uri: &MetaSchemaId,
  ) {
    assert!(retrieval_location.is_root());

    let mut queue = Default::default();
    self
      .load_from_location_with_queue(
        retrieval_location,
        given_location,
        antecedent_location,
        default_schema_uri,
        &mut queue,
      )
      .await;
    self.load_from_queue(&mut queue).await;
  }

  async fn load_from_location_with_queue(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    default_schema_uri: &MetaSchemaId,
    queue: &mut Queue,
  ) {
    /*
    If the document is not in the cache
    */
    if !self.node_cache.borrow().contains_key(retrieval_location) {
      /*
      retrieve the document
      */
      let fetch_location = &retrieval_location.to_fetch_string();
      let data = crate::utils::fetch_file::local_fetch_file(fetch_location)
        .await
        .unwrap();
      let document_node = serde_json::from_str(&data).unwrap();

      /*
      populate the cache with this document
      */
      self.fill_node_cache(retrieval_location, document_node);
    }

    queue.push((
      retrieval_location.clone(),
      given_location.clone(),
      antecedent_location.cloned(),
      default_schema_uri.clone(),
    ));
  }

  /**
  Load nodes from a document. The retrieval location dopes not have to be root (may contain
  a hash). The document_node provided here is the actual document that is identified by the
  retrieval_location and the given_location.
  */
  pub async fn load_from_node(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    node: serde_json::Value,
    default_schema_uri: &MetaSchemaId,
  ) {
    let mut queue = Default::default();
    self
      .load_from_node_with_queue(
        retrieval_location,
        given_location,
        antecedent_location,
        node,
        default_schema_uri,
        &mut queue,
      )
      .await;
    self.load_from_queue(&mut queue).await;
  }

  async fn load_from_node_with_queue(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    node: serde_json::Value,
    default_schema_uri: &MetaSchemaId,
    queue: &mut Queue,
  ) {
    /*
    If the document is not in the cache
    */
    if !self.node_cache.borrow().contains_key(retrieval_location) {
      self.fill_node_cache(retrieval_location, node)
    }

    queue.push((
      retrieval_location.clone(),
      given_location.clone(),
      antecedent_location.cloned(),
      default_schema_uri.clone(),
    ));
  }

  /**
  the retrieval location is the location of the document node. The document node may be
  a part of a bigger document, if this is the case then it's retrieval url is not
  root.
  */
  fn fill_node_cache(&self, retrieval_location: &NodeLocation, document_node: serde_json::Value) {
    /*
    we add every node in the tree to the cache
    */
    for (pointer, node) in read_json_node(&[], document_node) {
      let mut node_url = retrieval_location.clone();
      /*
      The retrieval url a unique, physical location where we can retrieve this node. The physical
      location of all nodes in the documents can be derived from the pointer and the retrieval_url
      of the document. It is possible that the retrieval url of the document is not root (has
      a hash). That is ok, then the pointer to the node is appended to the pointer of the document
      */
      node_url.push_pointer(pointer);

      if let Some(node_previous) = self.node_cache.borrow().get(retrieval_location) {
        /*
        If a node is already in the cache we won't override. We assume that this is the same node
        as it has the same identifier. This might happen if we load an embedded document first
        and then we load a document that contains the embedded document.
        */
        assert_eq!(node, *node_previous);
      } else {
        assert!(self
          .node_cache
          .borrow_mut()
          .insert(node_url, node)
          .is_none());
      }
    }
  }

  /**
  Load documents from queue, drain the queue
  */
  async fn load_from_queue(self: &Rc<Self>, queue: &mut Queue) {
    /*
    This here will drain the queue.
    */
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

  /**
  Load document and possibly adding data to the queue. This function is responsible for
  instantiating the documents. And also the load referenced and embedded documents by adding
  them to the queue.
  */
  async fn load_from_cache_with_queue(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    default_schema_uri: &MetaSchemaId,
    #[allow(clippy::ptr_arg)] queue: &mut Queue,
  ) {
    if self
      .node_documents
      .borrow()
      .contains_key(retrieval_location)
    {
      return;
    }

    /*
    this has it's own scope so node_cache is dropped when we don't need it anymore.
    */
    let document = {
      let node_cache = self.node_cache.borrow();
      let node = node_cache.get(retrieval_location).unwrap();
      let schema_uri = MetaSchemaId::discover(node).unwrap_or_else(|| default_schema_uri.clone());

      let factory = self.factories.get(&schema_uri).unwrap();

      factory(
        Rc::downgrade(self),
        DocumentConfiguration {
          retrieval_url: retrieval_location.clone(),
          given_url: given_location.clone(),
          antecedent_url: antecedent_location.cloned(),
          document_node: node,
        },
      )
    };
    let document_location = document.get_document_location();

    assert!(self
      .document_resolved
      .borrow_mut()
      .insert(retrieval_location.clone(), document_location.clone())
      .is_none());

    assert!(self
      .documents
      .borrow_mut()
      .insert(document_location.clone(), document.clone())
      .is_none());

    // Map node urls to this document
    for node_location in document.get_node_locations() {
      /*
      Inserts all node locations that belong to this document. We only expect locations
      that are part of this document and not part of embedded documents. So every node_location
      should be unique.
      */
      assert!(self
        .node_documents
        .borrow_mut()
        .insert(node_location.clone(), document_location.clone())
        .is_none());
    }

    let embedded_documents = document.get_embedded_documents();
    for embedded_document in embedded_documents {
      /*
      Find the node in the cache, it should be there, because the embedded document is always
      a descendant of this document. This document is cached, and so are all it's descendants.
      */
      let node = self
        .node_cache
        .borrow()
        .get(&embedded_document.retrieval_location)
        .unwrap()
        .clone();
      self
        .load_from_node_with_queue(
          &embedded_document.retrieval_location,
          &embedded_document.given_location,
          Some(document_location),
          node,
          default_schema_uri,
          queue,
        )
        .await;
    }

    let referenced_documents = document.get_referenced_documents();
    for referenced_document in referenced_documents {
      self
        .load_from_location_with_queue(
          &referenced_document.retrieval_location,
          &referenced_document.given_location,
          Some(document_location),
          default_schema_uri,
          queue,
        )
        .await;
    }
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[tokio::test]
  async fn document_context_load_from_location() {
    let document_context = DocumentContext::new().into_rc();

    document_context
      .load_from_location(
        &"https://api.chucknorris.io/jokes/random".parse().unwrap(),
        &"https://api.chucknorris.io/jokes/random".parse().unwrap(),
        None,
        &MetaSchemaId::Unknown,
      )
      .await
  }
}
