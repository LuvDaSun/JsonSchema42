use super::schema_document::SchemaDocument;
use crate::documents::{self, discover_meta_schema};
use crate::error::Error;
use crate::models::IntermediateNode;
use crate::utils::{node_location::NodeLocation, read_json_node::read_json_node};
use std::collections::BTreeMap;
use std::future::Future;
use std::pin::Pin;
use std::{
  cell::RefCell,
  collections::HashMap,
  rc::{Rc, Weak},
};

pub struct DocumentConfiguration<'a> {
  pub retrieval_location: NodeLocation,
  pub given_location: NodeLocation,
  pub antecedent_location: Option<NodeLocation>,
  pub document_node: &'a serde_json::Value,
}

pub type DocumentFactory =
  dyn Fn(Weak<DocumentContext>, DocumentConfiguration) -> Rc<dyn SchemaDocument>;

type Queue = Vec<(NodeLocation, NodeLocation, Option<NodeLocation>, String)>;

type FetchFile = Box<dyn Fn(String) -> Pin<Box<dyn Future<Output = Result<String, Error>>>>>;

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
pub struct DocumentContext {
  /**
  Maps node retrieval locations to their documents. Every node has a location that is an identifier. Thi
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
  factories: HashMap<String, Box<DocumentFactory>>,

  // TODO this should be a &str
  fetch_file: FetchFile,
}

impl DocumentContext {
  #[cfg(not(target_os = "unknown"))]
  pub fn new() -> Rc<Self> {
    Rc::new(Self {
      node_documents: Default::default(),
      node_cache: Default::default(),
      documents: Default::default(),
      document_resolved: Default::default(),
      factories: Default::default(),
      fetch_file: Box::new(|location: String| {
        Box::pin(async move { crate::utils::fetch_file::fetch_file(location.as_str()).await })
      }),
    })
  }

  pub fn new_hosted() -> Rc<Self> {
    Rc::new(Self {
      node_documents: Default::default(),
      node_cache: Default::default(),
      documents: Default::default(),
      document_resolved: Default::default(),
      factories: Default::default(),
      fetch_file: Box::new(|location: String| {
        Box::pin(
          async move { crate::utils::fetch_file::fetch_file_hosted(location.as_str()).await },
        )
      }),
    })
  }

  pub fn register_well_known_factories(self: &mut Rc<Self>) -> Result<(), Error> {
    self.register_factory(
      documents::draft_2020_12::META_SCHEMA_ID,
      Box::new(|context, configuration| {
        Rc::new(
          documents::draft_2020_12::Document::new(
            context,
            configuration.retrieval_location,
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.clone().into(),
          )
          .unwrap(),
        )
      }),
    )?;
    // context.register_factory(
    //   documents::draft_2019_09::META_SCHEMA_ID,
    //   Box::new( |_context, _initializer| Rc::new(documents::draft_2019_09::Document::new())),
    // );
    // context.register_factory(
    //  documents::draft_07::META_SCHEMA_ID,
    //   Box::new(|_context, _initializer| Rc::new(documents::draft_07::Document::new())),
    // );
    // context.register_factory(
    //  documents::draft_06::META_SCHEMA_ID,
    //   Box::new(|_context, _initializer| Rc::new(documents::draft_06::Document::new())),
    // );
    self.register_factory(
      documents::draft_04::META_SCHEMA_ID,
      Box::new(|_context, configuration| {
        Rc::new(
          documents::draft_04::Document::new(
            configuration.retrieval_location,
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.clone().into(),
          )
          .unwrap(),
        )
      }),
    )?;
    // context.register_factory(
    //   &MetaSchemaId::OasV31,
    //   Box::new(|_context, _initializer| Rc::new(documents::oas_v3_1::Document::new())),
    // );
    // context.register_factory(
    //   &MetaSchemaId::OasV30,
    //   Box::new(|_context, _initializer| Rc::new(documents::oas_v3_0::Document::new())),
    // );
    // context.register_factory(
    //   &MetaSchemaId::SwaggerV2,
    //   Box::new(|_context, _initializer| Rc::new(documents::swagger_v2::Document::new())),
    // );
    Ok(())
  }

  pub fn register_factory(
    self: &mut Rc<Self>,
    schema: &str,
    factory: Box<DocumentFactory>,
  ) -> Result<(), Error> {
    /*
    don't check if the factory is already registered here so we can
    override factories
    */
    Rc::get_mut(self)
      .ok_or(Error::Unknown)?
      .factories
      .insert(schema.to_owned(), factory);

    Ok(())
  }

  pub fn resolve_document_retrieval_location(
    &self,
    document_retrieval_location: &NodeLocation,
  ) -> Option<NodeLocation> {
    self
      .document_resolved
      .borrow()
      .get(document_retrieval_location)
      .cloned()
  }

  pub fn get_schema_nodes(&self) -> BTreeMap<NodeLocation, IntermediateNode> {
    self
      .documents
      .borrow()
      .values()
      .flat_map(|document| document.get_schema_nodes())
      .collect()
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
    default_meta_schema_id: &str,
  ) -> Result<(), Error> {
    if !retrieval_location.is_root() {
      Err(Error::NotARoot)?
    }

    let mut queue = Default::default();
    self
      .load_from_location_with_queue(
        retrieval_location,
        given_location,
        antecedent_location,
        default_meta_schema_id,
        &mut queue,
      )
      .await?;

    self.load_from_queue(&mut queue).await?;

    Ok(())
  }

  async fn load_from_location_with_queue(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    default_meta_schema_id: &str,
    queue: &mut Queue,
  ) -> Result<(), Error> {
    /*
    If the document is not in the cache
    */
    if !self.node_cache.borrow().contains_key(retrieval_location) {
      /*
      retrieve the document
      */
      let fetch_location = retrieval_location.to_fetch_string();
      let data = (self.fetch_file)(fetch_location).await?;
      let document_node = serde_yaml::from_str(&data)?;

      /*
      populate the cache with this document
      */
      self.fill_node_cache(retrieval_location, document_node)?;
    }

    queue.push((
      retrieval_location.clone(),
      given_location.clone(),
      antecedent_location.cloned(),
      default_meta_schema_id.to_owned(),
    ));

    Ok(())
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
    default_meta_schema_id: &str,
  ) -> Result<(), Error> {
    let mut queue = Default::default();

    self
      .load_from_node_with_queue(
        retrieval_location,
        given_location,
        antecedent_location,
        node,
        default_meta_schema_id,
        &mut queue,
      )
      .await?;

    self.load_from_queue(&mut queue).await?;

    Ok(())
  }

  async fn load_from_node_with_queue(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    node: serde_json::Value,
    default_meta_schema_id: &str,
    queue: &mut Queue,
  ) -> Result<(), Error> {
    /*
    If the document is not in the cache
    */
    if !self.node_cache.borrow().contains_key(retrieval_location) {
      self.fill_node_cache(retrieval_location, node)?
    }

    queue.push((
      retrieval_location.clone(),
      given_location.clone(),
      antecedent_location.cloned(),
      default_meta_schema_id.to_owned(),
    ));

    Ok(())
  }

  /**
  the retrieval location is the location of the document node. The document node may be
  a part of a bigger document, if this is the case then it's retrieval location is not
  root.
  */
  fn fill_node_cache(
    &self,
    retrieval_location: &NodeLocation,
    document_node: serde_json::Value,
  ) -> Result<(), Error> {
    /*
    we add every node in the tree to the cache
    */
    for (pointer, node) in read_json_node(&[], document_node) {
      let mut node_location = retrieval_location.clone();
      /*
      The retrieval location a unique, physical location where we can retrieve this node. The physical
      location of all nodes in the documents can be derived from the pointer and the retrieval_location
      of the document. It is possible that the retrieval location of the document is not root (has
      a hash). That is ok, then the pointer to the node is appended to the pointer of the document
      */
      node_location.push_pointer(pointer);

      let mut node_cache = self.node_cache.borrow_mut();
      if let Some(node_previous) = node_cache.get(&node_location) {
        /*
        If a node is already in the cache we won't override. We assume that this is the same node
        as it has the same identifier. This might happen if we load an embedded document first
        and then we load a document that contains the embedded document.
        */
        if node != *node_previous {
          Err(Error::NotTheSame)?
        }
      } else {
        node_cache.insert(node_location, node);
      }
    }

    Ok(())
  }

  /**
  Load documents from queue, drain the queue
  */
  async fn load_from_queue(self: &Rc<Self>, queue: &mut Queue) -> Result<(), Error> {
    /*
    This here will drain the queue.
    */
    while let Some((
      retrieval_location,
      given_location,
      antecedent_location,
      default_meta_schema_id,
    )) = queue.pop()
    {
      self
        .load_from_cache_with_queue(
          &retrieval_location,
          &given_location,
          antecedent_location.as_ref(),
          &default_meta_schema_id,
          queue,
        )
        .await?;
    }

    Ok(())
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
    default_meta_schema_id: &str,
    queue: &mut Queue,
  ) -> Result<(), Error> {
    if self
      .node_documents
      .borrow()
      .contains_key(retrieval_location)
    {
      return Ok(());
    }

    /*
    this has it's own scope so node_cache is dropped when we don't need it anymore.
    */
    let document = {
      let node_cache = self.node_cache.borrow();
      let node = node_cache.get(retrieval_location).ok_or(Error::NotFound)?;
      let meta_schema_id = discover_meta_schema(node).unwrap_or(default_meta_schema_id);

      let factory = self.factories.get(meta_schema_id).ok_or(Error::NotFound)?;

      factory(
        Rc::downgrade(self),
        DocumentConfiguration {
          retrieval_location: retrieval_location.clone(),
          given_location: given_location.clone(),
          antecedent_location: antecedent_location.cloned(),
          document_node: node,
        },
      )
    };
    let document_location = document.get_document_location();

    if self
      .document_resolved
      .borrow_mut()
      .insert(retrieval_location.clone(), document_location.clone())
      .is_some()
    {
      Err(Error::Conflict)?;
    }

    if self
      .documents
      .borrow_mut()
      .insert(document_location.clone(), document.clone())
      .is_some()
    {
      Err(Error::Conflict)?;
    }

    // Map node locations to this document
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
        .ok_or(Error::NotFound)?
        .clone();
      self
        .load_from_node_with_queue(
          &embedded_document.retrieval_location,
          &embedded_document.given_location,
          Some(document_location),
          node,
          default_meta_schema_id,
          queue,
        )
        .await?;
    }

    let referenced_documents = document.get_referenced_documents();
    for referenced_document in referenced_documents {
      self
        .load_from_location_with_queue(
          &referenced_document.retrieval_location,
          &referenced_document.given_location,
          Some(document_location),
          default_meta_schema_id,
          queue,
        )
        .await?;
    }

    Ok(())
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[async_std::test]
  async fn test_load_empty_node() {
    let mut document_context = DocumentContext::new();
    document_context.register_well_known_factories().unwrap();

    document_context
      .load_from_node(
        &"/schema.json#".parse().unwrap(),
        &"/schema.json#".parse().unwrap(),
        None,
        serde_json::Value::Object(Default::default()),
        documents::draft_2020_12::META_SCHEMA_ID,
      )
      .await
      .unwrap();

    let _intermediate_document = document_context.get_schema_nodes();
  }
}
