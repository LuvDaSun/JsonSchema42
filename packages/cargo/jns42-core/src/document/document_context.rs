use crate::utils::{node_location::NodeLocation, read_json_node::read_json_node};
use std::{
  cell::RefCell,
  collections::{HashMap, HashSet},
  rc::Rc,
};

/**
This class loads document nodes and documents. Every node has a few locations:
- Node location

  This is the main identifier for the node

- Retrieval location

  This is the physical location of the node

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
  Maps node urls to their documents. Every node has a location that is an identifier. Thi
  map maps that identifier to the identifier of a document.
  */
  node_documents: RefCell<HashMap<NodeLocation, NodeLocation>>,

  /**
  Keeps all loaded nodes. Nodes are retrieved and then stored in this cache. Then we work
  exclusively from this cache.
  */
  cache: RefCell<HashMap<NodeLocation, serde_json::Value>>,

  /**
  Keep track of what we have loaded so far. We store the fetch locations here, this is the
  location without the hash that can be used to fetch the document from a server or file system.
  */
  loaded: RefCell<HashSet<String>>,
}

impl DocumentContext {
  pub fn new() -> Rc<Self> {
    Rc::new(Default::default())
  }

  /**
  Load nodes from a location. The retrieval location is the physical location of the node,
  it should not contain a hash.
  */
  pub async fn load_from_location(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    // default_schema_uri: &MetaSchemaId,
  ) {
    let mut queue = Default::default();
    self
      .load_from_location_with_queue(
        retrieval_location,
        given_location,
        antecedent_location,
        // default_schema_uri,
        &mut queue,
      )
      .await;
    self.load_from_cache_queue(&mut queue).await;
  }

  async fn load_from_location_with_queue(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    // default_schema_uri: &MetaSchemaId,
    queue: &mut Vec<(
      NodeLocation,
      NodeLocation,
      Option<NodeLocation>,
      // MetaSchemaId,
    )>,
  ) {
    let document_node_is_none = {
      let node_cache = self.cache.borrow();
      let document_node = node_cache.get(retrieval_location);
      document_node.is_none()
    };

    if document_node_is_none {
      let data = crate::utils::fetch_file::local_fetch_file(&retrieval_location.to_fetch_string())
        .await
        .unwrap();
      let document_node = serde_json::from_str(&data).unwrap();

      self.fill_node_cache(retrieval_location, document_node);
    }

    queue.push((
      retrieval_location.clone(),
      given_location.clone(),
      antecedent_location.cloned(),
      // default_schema_uri.clone(),
    ));
  }

  pub async fn _load_from_document(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    document_node: serde_json::Value,
    // default_schema_uri: &MetaSchemaId,
  ) {
    let mut queue = Default::default();
    self
      .load_from_document_with_queue(
        retrieval_location,
        given_location,
        antecedent_location,
        document_node,
        // default_schema_uri,
        &mut queue,
      )
      .await;
    self.load_from_cache_queue(&mut queue).await;
  }

  async fn load_from_document_with_queue(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    given_location: &NodeLocation,
    antecedent_location: Option<&NodeLocation>,
    document_node: serde_json::Value,
    // default_schema_uri: &MetaSchemaId,
    queue: &mut Vec<(
      NodeLocation,
      NodeLocation,
      Option<NodeLocation>,
      // MetaSchemaId,
    )>,
  ) {
    let node_cache_contains_key = {
      let node_cache = self.cache.borrow();
      node_cache.contains_key(retrieval_location)
    };

    if !node_cache_contains_key {
      self.fill_node_cache(retrieval_location, document_node)
    }

    queue.push((
      retrieval_location.clone(),
      given_location.clone(),
      antecedent_location.cloned(),
      // default_schema_uri.clone(),
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
      // MetaSchemaId,
    )>,
  ) {
    while let Some((
      retrieval_url,
      given_url,
      antecedent_url,
      // default_schema_uri,
    )) = queue.pop()
    {
      self
        .load_from_cache_with_queue(
          &retrieval_url,
          &given_url,
          antecedent_url.as_ref(),
          // &default_schema_uri,
          queue,
        )
        .await;
    }
  }

  async fn load_from_cache_with_queue(
    self: &Rc<Self>,
    retrieval_location: &NodeLocation,
    _given_location: &NodeLocation,
    _antecedent_location: Option<&NodeLocation>,
    // default_schema_uri: &MetaSchemaId,
    #[allow(clippy::ptr_arg)] _queue: &mut Vec<(
      NodeLocation,
      NodeLocation,
      Option<NodeLocation>,
      // MetaSchemaId,
    )>,
  ) {
    if self
      .node_documents
      .borrow()
      .contains_key(retrieval_location)
    {
      return;
    }

    let server_url = retrieval_location.to_fetch_string();
    if !self.loaded.borrow_mut().insert(server_url) {
      return;
    }

    let _node = self.cache.borrow().get(retrieval_location);

    /*

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
        println!("{} -> {}", node_url, document_uri);
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

    */
  }
}

#[cfg(test)]
mod tests {
  use super::*;

  #[tokio::test]
  async fn document_context_load_from_location() {
    let document_context = DocumentContext::new();

    document_context
      .load_from_location(
        &"https://api.chucknorris.io/jokes/random".parse().unwrap(),
        &"https://api.chucknorris.io/jokes/random".parse().unwrap(),
        None,
      )
      .await
  }
}
