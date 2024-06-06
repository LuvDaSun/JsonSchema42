use super::schema_document::SchemaDocument;
use crate::documents;
use crate::error::Jns42Error;
use crate::models::DocumentSchemaItem;
use crate::utils::NodeCache;
use crate::utils::NodeCacheContainer;
use crate::utils::NodeLocation;
use std::collections::BTreeMap;
use std::iter;
use std::rc;
use std::{cell::RefCell, collections::HashMap};
use wasm_bindgen::prelude::*;

pub struct DocumentConfiguration {
  pub retrieval_location: NodeLocation,
  pub given_location: NodeLocation,
  pub antecedent_location: Option<NodeLocation>,
  pub document_node: serde_json::Value,
}

pub type DocumentFactory =
  dyn Fn(rc::Weak<DocumentContext>, DocumentConfiguration) -> rc::Rc<dyn SchemaDocument>;

/**
This class loads document nodes and documents. Every node has a few locations:
- Identity location

  This is the main identifier for the node, nodes reference to other nodes via this identifier

- Retrieval location

  This is the physical location of the node this is considered the primary key of the node

- Document location

  This is the node location of the document this node belongs to

- Antecedent location

  This is the antecedent (reason) for the node, (or empty if no antecedent). Antecedent
  can be a referencing document, or the embedding document. This references
  the identity location of another document.

- Given location

  This is an expected location for a node that is often derived from the antecedent and the
  JSON pointer to the node. This is the node location, unless the node itself specifies a
  different location

So there is something interesting going on here, we use retrieval location as a primary key,
but nodes reference to each other vie the identity location. This seems a bit weird, but we need
to do it this way. The retrieval location is known before the node is loaded, the node
location is not. This is because in some edge cases the identity location may be specified by the
node itself! So we need to load the node before we can know the identity location.

Nodes reference each other by the identity location, so we have a way of translating node locations
retrieval locations. This step need to be done first when retrieving a references node. We use
the node_resolved map to translate identity locations to retrieval locations.

*/
pub struct DocumentContext {
  /// nodes are stored in the cache, and indexed by their retrieval location
  ///
  cache: rc::Rc<RefCell<NodeCache>>,

  /// document factories by schema identifier
  ///
  factories: HashMap<String, Box<DocumentFactory>>,

  /// Maps node retrieval locations to their documents retrieval location. We can work with the
  /// node via it's document.
  ///
  node_to_document_retrieval_locations: RefCell<HashMap<NodeLocation, NodeLocation>>,

  /// all documents, indexed by the retrieval location of the document
  ///
  documents: RefCell<HashMap<NodeLocation, rc::Rc<dyn SchemaDocument>>>,

  /// This maps identity locations to retrieval locations. Use this table every time you
  /// need to fetch a node by it's identity location and you have a retrieval location
  ///
  retrieval_to_identity_locations: RefCell<HashMap<NodeLocation, NodeLocation>>,

  /// this maps retrieval locations to identity locations
  identity_to_retrieval_locations: RefCell<HashMap<NodeLocation, NodeLocation>>,
}

impl DocumentContext {
  pub fn new(cache: rc::Rc<RefCell<NodeCache>>) -> Self {
    Self {
      cache,
      factories: Default::default(),
      node_to_document_retrieval_locations: Default::default(),
      documents: Default::default(),
      retrieval_to_identity_locations: Default::default(),
      identity_to_retrieval_locations: Default::default(),
    }
  }

  pub fn register_factory(
    self: &mut rc::Rc<Self>,
    schema: &str,
    factory: Box<DocumentFactory>,
  ) -> Result<(), Jns42Error> {
    /*
    don't check if the factory is already registered here so we can
    override factories
    */
    rc::Rc::get_mut(self)
      .ok_or(Jns42Error::Unknown)?
      .factories
      .insert(schema.to_owned(), factory);

    Ok(())
  }

  pub fn register_well_known_factories(self: &mut rc::Rc<Self>) -> Result<(), Jns42Error> {
    self.register_factory(
      documents::draft_2020_12::META_SCHEMA_ID,
      Box::new(|context, configuration| {
        rc::Rc::new(
          documents::draft_2020_12::Document::new(
            context,
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.into(),
          )
          .unwrap(),
        )
      }),
    )?;
    self.register_factory(
      documents::draft_2019_09::META_SCHEMA_ID,
      Box::new(|context, configuration| {
        rc::Rc::new(
          documents::draft_2019_09::Document::new(
            context,
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.into(),
          )
          .unwrap(),
        )
      }),
    )?;
    self.register_factory(
      documents::draft_07::META_SCHEMA_ID,
      Box::new(|_context, configuration| {
        rc::Rc::new(
          documents::draft_07::Document::new(
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.into(),
          )
          .unwrap(),
        )
      }),
    )?;
    self.register_factory(
      documents::draft_06::META_SCHEMA_ID,
      Box::new(|_context, configuration| {
        rc::Rc::new(
          documents::draft_06::Document::new(
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.into(),
          )
          .unwrap(),
        )
      }),
    )?;
    self.register_factory(
      documents::draft_04::META_SCHEMA_ID,
      Box::new(|_context, configuration| {
        rc::Rc::new(
          documents::draft_04::Document::new(
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.into(),
          )
          .unwrap(),
        )
      }),
    )?;
    self.register_factory(
      documents::oas_v3_1::META_SCHEMA_ID,
      Box::new(|context, configuration| {
        rc::Rc::new(
          documents::oas_v3_1::Document::new(
            context,
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.into(),
          )
          .unwrap(),
        )
      }),
    )?;
    self.register_factory(
      documents::oas_v3_0::META_SCHEMA_ID,
      Box::new(|_context, configuration| {
        rc::Rc::new(
          documents::oas_v3_0::Document::new(
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.into(),
          )
          .unwrap(),
        )
      }),
    )?;
    self.register_factory(
      documents::swagger_v2::META_SCHEMA_ID,
      Box::new(|_context, configuration| {
        rc::Rc::new(
          documents::swagger_v2::Document::new(
            configuration.given_location,
            configuration.antecedent_location,
            configuration.document_node.into(),
          )
          .unwrap(),
        )
      }),
    )?;
    Ok(())
  }

  /**
  Load nodes from a location. The retrieval location is the physical location of the node,
  it should be a root location
  */
  #[allow(clippy::await_holding_refcell_ref)]
  pub async fn load_from_location(
    self: &rc::Rc<Self>,
    document_retrieval_location: NodeLocation,
    document_given_location: NodeLocation,
    document_antecedent_location: Option<NodeLocation>,
    default_meta_schema_id: String,
  ) -> Result<(), Jns42Error> {
    let mut queue = Vec::new();
    queue.push((
      document_retrieval_location,
      document_given_location,
      document_antecedent_location,
    ));

    while let Some((
      document_retrieval_location,
      document_given_location,
      document_antecedent_location,
    )) = queue.pop()
    {
      // If a document with this retrieval location is already loaded
      if self
        .documents
        .borrow()
        .contains_key(&document_retrieval_location)
      {
        continue;
      }

      // Ensure the node is in the cache
      self
        .cache
        .borrow_mut()
        .load_from_location(&document_retrieval_location)
        .await?;

      // Get the node from the cache
      let document_node = self
        .cache
        .borrow()
        .get_node(&document_retrieval_location)
        .ok_or(Jns42Error::NotFound)?
        .clone();

      let factory = {
        let cache = self.cache.borrow();

        let meta_schema_id =
          documents::discover_meta_schema_id(&cache, &document_retrieval_location)
            .unwrap_or(&default_meta_schema_id);

        self
          .factories
          .get(meta_schema_id)
          .ok_or(Jns42Error::NotFound)?
      };

      let document = factory(
        rc::Rc::downgrade(self),
        DocumentConfiguration {
          retrieval_location: document_retrieval_location.clone(),
          given_location: document_given_location.clone(),
          antecedent_location: document_antecedent_location.clone(),
          document_node,
        },
      );

      let document_identity_location = document.get_identity_location();

      if self
        .documents
        .borrow_mut()
        .insert(document_retrieval_location.clone(), document.clone())
        .is_some()
      {
        Err(Jns42Error::Conflict)?;
      }

      // Map node pointers and anchors to this document
      for (node_retrieval_location, node_identity_location) in iter::empty()
        .chain(document.get_node_pointers().into_iter().map(|pointer| {
          (
            document_retrieval_location.push_pointer(pointer.clone()),
            document_identity_location.push_pointer(pointer.clone()),
          )
        }))
        .chain(document.get_node_anchors().into_iter().map(|anchor| {
          (
            document_retrieval_location.set_anchor(anchor.clone()),
            document_identity_location.set_anchor(anchor.clone()),
          )
        }))
      {
        if self
          .node_to_document_retrieval_locations
          .borrow_mut()
          .insert(
            node_retrieval_location.clone(),
            document_retrieval_location.clone(),
          )
          .is_some()
        {
          Err(Jns42Error::Conflict)?;
        }
        if self
          .retrieval_to_identity_locations
          .borrow_mut()
          .insert(
            node_retrieval_location.clone(),
            node_identity_location.clone(),
          )
          .is_some()
        {
          Err(Jns42Error::Conflict)?;
        }
        if self
          .identity_to_retrieval_locations
          .borrow_mut()
          .insert(
            node_identity_location.clone(),
            node_retrieval_location.clone(),
          )
          .is_some()
        {
          Err(Jns42Error::Conflict)?;
        }
      }

      let referenced_locations = document.get_referenced_locations();
      for referenced_location in referenced_locations {
        let retrieval_location = document_retrieval_location.join(&referenced_location);
        let given_location = document_identity_location.join(&referenced_location);
        queue.push((
          retrieval_location,
          given_location,
          // antecedent location points to the identity location!
          Some(document_identity_location.clone()),
        ));
      }
    }

    Ok(())
  }

  pub fn get_schema_nodes(&self) -> BTreeMap<NodeLocation, DocumentSchemaItem> {
    self
      .documents
      .borrow()
      .values()
      .flat_map(|document| document.get_schema_nodes())
      .collect()
  }

  pub fn resolve_document_retrieval_location(
    &self,
    node_retrieval_location: &NodeLocation,
  ) -> Result<NodeLocation, Jns42Error> {
    self
      .node_to_document_retrieval_locations
      .borrow()
      .get(node_retrieval_location)
      .cloned()
      .ok_or(Jns42Error::NotFound)
  }

  pub fn resolve_identity_location(
    &self,
    retrieval_location: &NodeLocation,
  ) -> Result<NodeLocation, Jns42Error> {
    self
      .retrieval_to_identity_locations
      .borrow()
      .get(retrieval_location)
      .cloned()
      .ok_or(Jns42Error::NotFound)
  }

  pub fn resolve_retrieval_location(
    &self,
    identity_location: &NodeLocation,
  ) -> Result<NodeLocation, Jns42Error> {
    self
      .identity_to_retrieval_locations
      .borrow()
      .get(identity_location)
      .cloned()
      .ok_or(Jns42Error::NotFound)
  }

  pub fn get_document(
    &self,
    document_retrieval_location: &NodeLocation,
  ) -> Result<rc::Rc<dyn SchemaDocument>, Jns42Error> {
    self
      .documents
      .borrow()
      .get(document_retrieval_location)
      .cloned()
      .ok_or(Jns42Error::NotFound)
  }

  pub fn get_document_and_antecedents(
    &self,
    document_identity_location: &NodeLocation,
  ) -> Result<Vec<rc::Rc<dyn SchemaDocument>>, Jns42Error> {
    let mut results = Vec::new();
    let mut document_identity_location = document_identity_location.clone();

    loop {
      let result = self.get_document(&document_identity_location)?;
      results.push(result.clone());

      let Some(antecedent_location) = result.get_antecedent_location() else {
        break;
      };

      document_identity_location = antecedent_location.clone();
    }

    Ok(results)
  }
}

impl Default for DocumentContext {
  fn default() -> Self {
    Self::new(Default::default())
  }
}

#[wasm_bindgen]
pub struct Jns42DocumentContextContainer(rc::Rc<DocumentContext>);

#[wasm_bindgen]
impl Jns42DocumentContextContainer {
  #[wasm_bindgen(constructor)]
  pub fn new(cache: &NodeCacheContainer) -> Self {
    Self(rc::Rc::new(DocumentContext::new(cache.clone().into())))
  }

  #[wasm_bindgen(js_name = "registerWellKnownFactories")]
  pub fn register_well_known_factories(&mut self) -> Result<(), Jns42Error> {
    self.0.register_well_known_factories()
  }

  #[wasm_bindgen(js_name = "loadFromLocation")]
  pub async fn load_from_location(
    &self,
    retrieval_location: NodeLocation,
    given_location: NodeLocation,
    antecedent_location: Option<NodeLocation>,
    default_meta_schema_id: String,
  ) -> Result<(), Jns42Error> {
    self
      .0
      .load_from_location(
        retrieval_location,
        given_location,
        antecedent_location,
        default_meta_schema_id,
      )
      .await
  }
}

impl From<rc::Rc<DocumentContext>> for Jns42DocumentContextContainer {
  fn from(value: rc::Rc<DocumentContext>) -> Self {
    Self(value)
  }
}

impl From<Jns42DocumentContextContainer> for rc::Rc<DocumentContext> {
  fn from(value: Jns42DocumentContextContainer) -> Self {
    value.0
  }
}

#[cfg(not(target_os = "unknown"))]
#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::SchemaType;

  #[async_std::test]
  async fn test_load_string_from_location() {
    let mut document_context = rc::Rc::new(DocumentContext::default());
    document_context.register_well_known_factories().unwrap();

    let location: NodeLocation = "../../../fixtures/specification/string.json"
      .parse()
      .unwrap();

    document_context
      .load_from_location(
        location.clone(),
        location.clone(),
        None,
        documents::draft_2020_12::META_SCHEMA_ID.to_owned(),
      )
      .await
      .unwrap();

    let mut nodes = document_context.get_schema_nodes();
    assert_eq!(nodes.len(), 1);

    let (_key, node) = nodes.pop_last().unwrap();
    assert_eq!(node.types, Some(vec![SchemaType::String]));
  }
}
