use super::schema_document::SchemaDocument;
use crate::documents::{self, discover_meta_schema};
use crate::error::Error;
use crate::models::DocumentSchemaItem;
use crate::utils::NodeCache;
use crate::utils::NodeLocation;
use std::collections::BTreeMap;
use std::{
  cell::RefCell,
  collections::HashMap,
  rc::{Rc, Weak},
};

pub struct DocumentConfiguration {
  pub retrieval_location: NodeLocation,
  pub given_location: NodeLocation,
  pub antecedent_location: Option<NodeLocation>,
  pub document_node: serde_json::Value,
}

pub type DocumentFactory =
  dyn Fn(Weak<DocumentContext>, DocumentConfiguration) -> Rc<dyn SchemaDocument>;

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
  cache: RefCell<NodeCache>,

  /**
  Maps node retrieval locations to their documents. Every node has a location that is an identifier. Thi
  map maps that identifier to the identifier of a document.
  */
  node_documents: RefCell<HashMap<NodeLocation, NodeLocation>>,

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
}

impl DocumentContext {
  pub fn new() -> Rc<Self> {
    Rc::new(Self {
      cache: Default::default(),
      node_documents: Default::default(),
      documents: Default::default(),
      document_resolved: Default::default(),
      factories: Default::default(),
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
    self.register_factory(
      documents::draft_2019_09::META_SCHEMA_ID,
      Box::new(|context, configuration| {
        Rc::new(
          documents::draft_2019_09::Document::new(
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
    self.register_factory(
      documents::draft_07::META_SCHEMA_ID,
      Box::new(|_context, configuration| {
        Rc::new(
          documents::draft_07::Document::new(
            configuration.retrieval_location,
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.clone().into(),
          )
          .unwrap(),
        )
      }),
    )?;
    self.register_factory(
      documents::draft_06::META_SCHEMA_ID,
      Box::new(|_context, configuration| {
        Rc::new(
          documents::draft_06::Document::new(
            configuration.retrieval_location,
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.clone().into(),
          )
          .unwrap(),
        )
      }),
    )?;
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
    self.register_factory(
      documents::oas_v3_1::META_SCHEMA_ID,
      Box::new(|context, configuration| {
        Rc::new(
          documents::oas_v3_1::Document::new(
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
    self.register_factory(
      documents::oas_v3_0::META_SCHEMA_ID,
      Box::new(|_context, configuration| {
        Rc::new(
          documents::oas_v3_0::Document::new(
            configuration.retrieval_location,
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.clone().into(),
          )
          .unwrap(),
        )
      }),
    )?;
    self.register_factory(
      documents::swagger_v2::META_SCHEMA_ID,
      Box::new(|_context, configuration| {
        Rc::new(
          documents::swagger_v2::Document::new(
            configuration.retrieval_location,
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.clone().into(),
          )
          .unwrap(),
        )
      }),
    )?;
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

  pub fn get_schema_nodes(&self) -> BTreeMap<NodeLocation, DocumentSchemaItem> {
    self
      .documents
      .borrow()
      .values()
      .flat_map(|document| document.get_schema_nodes())
      .collect()
  }

  pub fn resolve_document_location(&self, node_location: &NodeLocation) -> NodeLocation {
    self
      .node_documents
      .borrow()
      .get(node_location)
      .unwrap()
      .clone()
  }

  pub fn get_document(
    &self,
    document_location: &NodeLocation,
  ) -> Result<Rc<dyn SchemaDocument>, Error> {
    let document_location = document_location.clone();

    let documents = self.documents.borrow();
    let result = documents.get(&document_location).ok_or(Error::NotFound)?;
    let result = result.clone();

    Ok(result)
  }

  pub fn get_document_and_antecedents(
    &self,
    document_location: &NodeLocation,
  ) -> Result<Vec<Rc<dyn SchemaDocument>>, Error> {
    let mut results = Vec::new();
    let mut document_location = document_location.clone();

    loop {
      let result = self.get_document(&document_location)?;
      results.push(result.clone());

      let Some(antecedent_location) = result.get_antecedent_location() else {
        break;
      };

      document_location = antecedent_location.clone();
    }

    Ok(results)
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
    let mut queue = Vec::new();
    queue.push((
      retrieval_location.clone(),
      given_location.clone(),
      antecedent_location.cloned(),
      default_meta_schema_id.to_owned(),
    ));

    while let Some((
      retrieval_location,
      given_location,
      antecedent_location,
      default_meta_schema_id,
    )) = queue.pop()
    {
      if self.documents.borrow().contains_key(&retrieval_location) {
        continue;
      }

      self
        .cache
        .borrow_mut()
        .load_from_location(&retrieval_location)
        .await?;

      let node = self
        .cache
        .borrow()
        .get_node(&retrieval_location)
        .ok_or(Error::NotFound)?
        .clone();

      let meta_schema_id = discover_meta_schema(&node)
        .map(str::to_owned)
        .unwrap_or(default_meta_schema_id);

      let factory = self.factories.get(&meta_schema_id).ok_or(Error::NotFound)?;

      let document = factory(
        Rc::downgrade(self),
        DocumentConfiguration {
          retrieval_location: retrieval_location.clone(),
          given_location: given_location.clone(),
          antecedent_location: antecedent_location.clone(),
          document_node: node,
        },
      );

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
        queue.push((
          embedded_document.retrieval_location.clone(),
          embedded_document.given_location.clone(),
          Some(document_location.clone()),
          meta_schema_id.clone(),
        ));
      }

      let referenced_documents = document.get_referenced_documents();
      for referenced_document in referenced_documents {
        queue.push((
          referenced_document.retrieval_location.clone(),
          referenced_document.given_location.clone(),
          Some(document_location.clone()),
          meta_schema_id.clone(),
        ));
      }
    }

    Ok(())
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::SchemaType;

  #[async_std::test]
  async fn test_load_empty_node() {
    let mut document_context = DocumentContext::new();
    document_context.register_well_known_factories().unwrap();

    let location: NodeLocation = "../../../fixtures/specification/string.json"
      .parse()
      .unwrap();

    document_context
      .load_from_location(
        &location,
        &location,
        None,
        documents::draft_2020_12::META_SCHEMA_ID,
      )
      .await
      .unwrap();

    let mut nodes = document_context.get_schema_nodes();
    assert_eq!(nodes.len(), 1);

    let (_key, node) = nodes.pop_last().unwrap();
    assert_eq!(node.types, Some(vec![SchemaType::String]));
  }
}
