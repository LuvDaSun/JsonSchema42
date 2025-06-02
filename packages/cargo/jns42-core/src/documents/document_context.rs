use super::find_version_node;
use super::schema_document::SchemaDocument;
use crate::documents;
use crate::documents::Error;
use crate::models::DocumentSchemaItem;
use crate::utilities::NodeCache;
use crate::utilities::NodeLocation;
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::collections::BTreeSet;
use std::iter;
use std::rc;

#[cfg(target_arch = "wasm32")]
use crate::exports;

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

#[derive(Default)]
pub struct DocumentContext {
  /// nodes are stored in the cache, and indexed by their retrieval location
  ///
  cache: rc::Rc<RefCell<NodeCache>>,

  /// document factories by schema identifier
  ///
  factories: BTreeMap<String, Box<DocumentFactory>>,

  /// Maps node retrieval locations to their documents retrieval location. We can work with the
  /// node via it's document.
  ///
  node_to_document_retrieval_locations: RefCell<BTreeMap<NodeLocation, NodeLocation>>,

  /// all documents, indexed by the retrieval location of the document
  ///
  documents: RefCell<BTreeMap<NodeLocation, rc::Rc<dyn SchemaDocument>>>,

  /// this maps retrieval locations to identity locations
  retrieval_to_identity_locations: RefCell<BTreeMap<NodeLocation, NodeLocation>>,

  /// This maps identity locations to retrieval locations. Use this table every time you
  /// need to fetch a node by it's identity location and you have a retrieval location
  ///
  identity_to_retrieval_locations: RefCell<BTreeMap<NodeLocation, NodeLocation>>,

  /// locations that were loaded explicitly
  explicit_locations: RefCell<BTreeSet<NodeLocation>>,
}

impl DocumentContext {
  pub fn new() -> Self {
    Self::default()
  }

  pub fn register_factory(
    &mut self,
    schema: &str,
    factory: Box<DocumentFactory>,
  ) -> Result<(), Error> {
    /*
    don't check if the factory is already registered here so we can
    override factories
    */
    self.factories.insert(schema.to_owned(), factory);

    Ok(())
  }

  pub fn register_well_known_factories(&mut self) -> Result<(), Error> {
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

  pub fn build(self) -> rc::Rc<Self> {
    rc::Rc::new(self)
  }

  /**
  Load nodes from a location. The retrieval location is the physical location of the node,
  it should be a root location
  */
  pub fn load_from_location(
    self: &rc::Rc<Self>,
    retrieval_location: NodeLocation,
    given_location: NodeLocation,
    antecedent_location: Option<NodeLocation>,
    default_meta_schema_id: &str,
  ) -> Result<(), Error> {
    if !self
      .explicit_locations
      .borrow_mut()
      .insert(retrieval_location.clone())
    {
      // if is was already explicitly loaded, do nothing
      return Ok(());
    }

    let mut queue = Vec::new();
    queue.push((retrieval_location, given_location, antecedent_location));
    // drain the queue
    while let Some((retrieval_location, given_location, document_antecedent_location)) = queue.pop()
    {
      // let's load some documents! This involves figuring out the document type
      // via the meta schema id and some interesting logic. This logic is about
      // nodes being loaded multiple times. If this is the case of course
      // we do not want to double load the document. This is
      // how we check for that:
      if self.documents.borrow().contains_key(&retrieval_location) {
        continue;
      }

      // There might be a situation where we load a node that is already loaded as
      // part of a larger document. The node is then a child of that document. If
      // that is the case then we don't want to load another document but just use
      // the larger, parent document.
      if self
        .node_to_document_retrieval_locations
        .borrow()
        .contains_key(&retrieval_location)
      {
        continue;
      }

      // Ensure the node is in the cache
      self
        .cache
        .borrow_mut()
        .load_from_location(&retrieval_location)?;

      // Get the node from the cache
      let document_node = self
        .cache
        .borrow()
        .get_node(&retrieval_location)
        .ok_or_else(|| Error::DocumentNodeNotFound(retrieval_location.clone()))?
        .clone();

      let factory = {
        let cache = self.cache.borrow();

        let version_retrieval_location = find_version_node(&cache, &retrieval_location)
          .unwrap_or_else(|| retrieval_location.clone());
        let version_node = cache
          .get_node(&version_retrieval_location)
          .ok_or_else(|| Error::VersionNodeNotFound(version_retrieval_location.clone()))?;
        let meta_schema_id =
          documents::discover_meta_schema_id(version_node).unwrap_or(default_meta_schema_id);

        self
          .factories
          .get(meta_schema_id)
          .ok_or_else(|| Error::FactoryNotFound(meta_schema_id.to_owned()))?
      };

      let document = factory(
        rc::Rc::downgrade(self),
        DocumentConfiguration {
          retrieval_location: retrieval_location.clone(),
          given_location: given_location.clone(),
          antecedent_location: document_antecedent_location.clone(),
          document_node,
        },
      );

      let document_identity_location = document.get_identity_location();

      if self
        .documents
        .borrow_mut()
        .insert(retrieval_location.clone(), document.clone())
        .is_some()
      {
        Err(Error::Conflict)?;
      }

      // Map node pointers and anchors to this document
      for (node_retrieval_location, node_identity_location) in iter::empty()
        .chain(document.get_node_pointers().into_iter().map(|pointer| {
          (
            retrieval_location.push_pointer(pointer.clone()),
            document_identity_location.push_pointer(pointer.clone()),
          )
        }))
        .chain(document.get_node_anchors().into_iter().map(|anchor| {
          (
            retrieval_location.set_anchor(anchor.clone()),
            document_identity_location.set_anchor(anchor.clone()),
          )
        }))
      {
        // it is possible that the node is already related to a document, this
        // is the case when a child node is loaded before the parent document.
        if let Some(document_retrieval_location) = self
          .node_to_document_retrieval_locations
          .borrow_mut()
          .insert(node_retrieval_location.clone(), retrieval_location.clone())
        {
          // document might already be removed
          self
            .documents
            .borrow_mut()
            .remove(&document_retrieval_location);
        }

        // possibly overwrite value
        self.identity_to_retrieval_locations.borrow_mut().insert(
          node_retrieval_location.clone(),
          node_identity_location.clone(),
        );

        // possibly overwrite value
        self.retrieval_to_identity_locations.borrow_mut().insert(
          node_identity_location.clone(),
          node_retrieval_location.clone(),
        );
      }

      let referenced_locations = document.get_referenced_locations();
      for referenced_location in referenced_locations {
        let retrieval_location = retrieval_location.join(&referenced_location);
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

  pub fn load_from_node(
    self: &rc::Rc<Self>,
    retrieval_location: NodeLocation,
    given_location: NodeLocation,
    antecedent_location: Option<NodeLocation>,
    node: serde_json::Value,
    default_meta_schema_id: &str,
  ) -> Result<(), Error> {
    self
      .cache
      .borrow_mut()
      .load_from_node(&retrieval_location, node)?;

    self.load_from_location(
      retrieval_location,
      given_location,
      antecedent_location,
      default_meta_schema_id,
    )
  }

  pub fn get_explicit_locations(&self) -> BTreeSet<NodeLocation> {
    self.explicit_locations.borrow().iter().cloned().collect()
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
  ) -> Result<NodeLocation, Error> {
    self
      .node_to_document_retrieval_locations
      .borrow()
      .get(node_retrieval_location)
      .cloned()
      .ok_or_else(|| Error::RetrievalLocationNotFound(node_retrieval_location.clone()))
  }

  pub fn resolve_identity_location(
    &self,
    retrieval_location: &NodeLocation,
  ) -> Result<NodeLocation, Error> {
    self
      .identity_to_retrieval_locations
      .borrow()
      .get(retrieval_location)
      .cloned()
      .ok_or_else(|| Error::RetrievalLocationNotFound(retrieval_location.clone()))
  }

  pub fn resolve_retrieval_location(
    &self,
    identity_location: &NodeLocation,
  ) -> Result<NodeLocation, Error> {
    self
      .retrieval_to_identity_locations
      .borrow()
      .get(identity_location)
      .cloned()
      .ok_or_else(|| Error::IdentityLocationNotFound(identity_location.clone()))
  }

  pub fn get_document(
    &self,
    document_retrieval_location: &NodeLocation,
  ) -> Result<rc::Rc<dyn SchemaDocument>, Error> {
    self
      .documents
      .borrow()
      .get(document_retrieval_location)
      .cloned()
      .ok_or_else(|| Error::DocumentNotFound(document_retrieval_location.clone()))
  }

  pub fn get_document_and_antecedents(
    &self,
    document_identity_location: &NodeLocation,
  ) -> Result<Vec<rc::Rc<dyn SchemaDocument>>, Error> {
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

// // #[wasm_bindgen]
// #[derive(Default, Clone)]
// pub struct DocumentContextContainer(rc::Rc<DocumentContext>);

// // #[wasm_bindgen]
// impl DocumentContextContainer {
//   // #[wasm_bindgen(constructor)]
//   pub fn new() -> Self {
//     Self::default()
//   }

//   // #[wasm_bindgen(js_name = "registerWellKnownFactories")]
//   pub fn register_well_known_factories(&mut self) -> Result<(), Box<dyn std::error::Error>> {
//     Ok(self.0.register_well_known_factories()?)
//   }

//   // #[wasm_bindgen(js_name = "loadFromLocation")]
//   pub fn load_from_location(
//     &self,
//     retrieval_location: String,
//     given_location: String,
//     antecedent_location: Option<String>,
//     default_meta_schema_id: &str,
//   ) -> Result<(), Box<dyn std::error::Error>> {
//     let retrieval_location = retrieval_location.parse()?;
//     let given_location = given_location.parse()?;
//     let antecedent_location = antecedent_location
//       .map(|location| location.parse())
//       .transpose()?;

//     Ok(self.0.load_from_location(
//       retrieval_location,
//       given_location,
//       antecedent_location,
//       default_meta_schema_id,
//     )?)
//   }

//   // #[wasm_bindgen(js_name = "loadFromNode")]
//   pub fn load_from_node(
//     &self,
//     retrieval_location: String,
//     given_location: String,
//     antecedent_location: Option<String>,
//     node: serde_json::Value,
//     default_meta_schema_id: &str,
//   ) -> Result<(), Box<dyn std::error::Error>> {
//     let retrieval_location = retrieval_location.parse()?;
//     let given_location = given_location.parse()?;
//     let antecedent_location = antecedent_location
//       .map(|location| location.parse())
//       .transpose()?;

//     Ok(self.0.load_from_node(
//       retrieval_location,
//       given_location,
//       antecedent_location,
//       node,
//       default_meta_schema_id,
//     )?)
//   }

//   // #[wasm_bindgen(js_name = "getExplicitLocations")]
//   pub fn get_explicit_locations(&self) -> Vec<String> {
//     self
//       .0
//       .get_explicit_locations()
//       .into_iter()
//       .map(|location| location.to_string())
//       .collect()
//   }
// }

// impl From<rc::Rc<DocumentContext>> for DocumentContextContainer {
//   fn from(value: rc::Rc<DocumentContext>) -> Self {
//     Self(value)
//   }
// }

// impl From<DocumentContextContainer> for rc::Rc<DocumentContext> {
//   fn from(value: DocumentContextContainer) -> Self {
//     value.0
//   }
// }

#[cfg(target_arch = "wasm32")]
pub struct DocumentContextHost(rc::Rc<DocumentContext>);

#[cfg(target_arch = "wasm32")]
impl From<DocumentContext> for DocumentContextHost {
  fn from(value: DocumentContext) -> Self {
    Self(value.into())
  }
}

#[cfg(target_arch = "wasm32")]
impl From<DocumentContextHost> for exports::jns42::core::documents::DocumentContext {
  fn from(value: DocumentContextHost) -> Self {
    Self::new(value)
  }
}

#[cfg(target_arch = "wasm32")]
impl From<DocumentContext> for exports::jns42::core::documents::DocumentContext {
  fn from(value: DocumentContext) -> Self {
    DocumentContextHost::from(value).into()
  }
}

#[cfg(target_arch = "wasm32")]
impl From<exports::jns42::core::documents::DocumentContext> for DocumentContextHost {
  fn from(value: exports::jns42::core::documents::DocumentContext) -> Self {
    value.into_inner()
  }
}

#[cfg(target_arch = "wasm32")]
impl From<exports::jns42::core::documents::DocumentContext> for rc::Rc<DocumentContext> {
  fn from(value: exports::jns42::core::documents::DocumentContext) -> Self {
    DocumentContextHost::from(value).0
  }
}

#[cfg(target_arch = "wasm32")]
impl exports::jns42::core::documents::GuestDocumentContext for DocumentContextHost {
  fn new() -> Self {
    Self(Default::default())
  }

  fn register_well_known_factories(&self) -> Result<(), exports::jns42::core::documents::Error> {
    todo!()
  }

  fn load_from_location(
    &self,
    retrieval_location: String,
    given_location: String,
    antecedent_location: Option<String>,
    default_meta_schema_id: String,
  ) -> Result<(), exports::jns42::core::documents::Error> {
    todo!()
    // self.0.load_from_location(
    //   retrieval_location.try_into()?,
    //   given_location.try_into()?,
    //   antecedent_location.map(|value| value.try_into()?),
    //   &default_meta_schema_id,
    // )?;
    // Ok(())
  }

  fn load_from_node(
    &self,
    retrieval_location: String,
    given_location: String,
    antecedent_location: Option<String>,
    node: String,
    default_meta_schema_id: String,
  ) -> Result<(), exports::jns42::core::documents::Error> {
    todo!()
  }

  fn get_explicit_locations(&self) -> Vec<String> {
    self
      .0
      .get_explicit_locations()
      .iter()
      .map(Into::into)
      .collect()
  }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::SchemaType;

  #[test]
  fn test_load_string_from_location() {
    let mut document_context = DocumentContext::default();
    document_context.register_well_known_factories().unwrap();

    let document_context = document_context.build();

    let location: NodeLocation = "../../../fixtures/specifications/string.json"
      .parse()
      .unwrap();

    document_context
      .load_from_location(
        location.clone(),
        location.clone(),
        None,
        documents::draft_2020_12::META_SCHEMA_ID,
      )
      .unwrap();

    let mut nodes = document_context.get_schema_nodes();
    assert_eq!(nodes.len(), 1);

    let (_key, node) = nodes.pop_last().unwrap();
    assert_eq!(node.types, Some(vec![SchemaType::String]));
  }
}
