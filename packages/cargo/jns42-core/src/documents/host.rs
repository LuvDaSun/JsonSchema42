use super::*;
use crate::error;
use crate::exports;
use std::rc;

impl From<crate::error::Error> for exports::jns42::core::documents::Error {
  fn from(value: error::Error) -> Self {
    match value {
      error::Error::Unknown => exports::jns42::core::documents::Error::Unknown,
      error::Error::Conflict => exports::jns42::core::documents::Error::Conflict,
      error::Error::DocumentNodeNotFound(node_location) => {
        exports::jns42::core::documents::Error::DocumentNodeNotFound(node_location.into())
      }
      error::Error::VersionNodeNotFound(node_location) => {
        exports::jns42::core::documents::Error::VersionNodeNotFound(node_location.into())
      }
      error::Error::FactoryNotFound(factory) => {
        exports::jns42::core::documents::Error::FactoryNotFound(factory)
      }
      error::Error::RetrievalLocationNotFound(node_location) => {
        exports::jns42::core::documents::Error::RetrievalLocationNotFound(node_location.into())
      }
      error::Error::IdentityLocationNotFound(node_location) => {
        exports::jns42::core::documents::Error::IdentityLocationNotFound(node_location.into())
      }
      error::Error::DocumentNotFound(node_location) => {
        exports::jns42::core::documents::Error::DocumentNotFound(node_location.into())
      }
      error::Error::ReferenceNotFound(node_location) => {
        exports::jns42::core::documents::Error::ReferenceNotFound(node_location.into())
      }
      error::Error::InvalidLocation => exports::jns42::core::documents::Error::InvalidLocation,
      error::Error::FetchError => exports::jns42::core::documents::Error::FetchError,
      error::Error::SerializationError => {
        exports::jns42::core::documents::Error::SerializationError
      }
    }
  }
}

pub struct DocumentContextHost(rc::Rc<DocumentContext>);

impl From<DocumentContext> for DocumentContextHost {
  fn from(value: DocumentContext) -> Self {
    Self(value.into())
  }
}

impl From<DocumentContextHost> for exports::jns42::core::documents::DocumentContext {
  fn from(value: DocumentContextHost) -> Self {
    Self::new(value)
  }
}

impl From<DocumentContext> for exports::jns42::core::documents::DocumentContext {
  fn from(value: DocumentContext) -> Self {
    DocumentContextHost::from(value).into()
  }
}

impl From<exports::jns42::core::documents::DocumentContext> for DocumentContextHost {
  fn from(value: exports::jns42::core::documents::DocumentContext) -> Self {
    value.into_inner()
  }
}

impl From<exports::jns42::core::documents::DocumentContext> for Rc<DocumentContext> {
  fn from(value: exports::jns42::core::documents::DocumentContext) -> Self {
    DocumentContextHost::from(value).0
  }
}

impl exports::jns42::core::documents::GuestDocumentContext for DocumentContextHost {
  fn new() -> Self {
    Self(Default::default())
  }

  fn register_well_known_factories(&self) -> Result<(), exports::jns42::core::documents::Error> {
    let context = self.0;
    context.register_well_known_factories()?;
    Ok(())
  }

  fn load_from_location(
    &self,
    retrieval_location: String,
    given_location: String,
    antecedent_location: Option<String>,
    default_meta_schema_id: String,
  ) -> Result<(), exports::jns42::core::documents::Error> {
    self.0.load_from_location(
      retrieval_location.try_into()?,
      given_location.try_into()?,
      antecedent_location.map(|value| value.try_into()?),
      &default_meta_schema_id,
    )?;
    Ok(())
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

impl exports::jns42::core::documents::Guest for crate::Host {
  type DocumentContext = DocumentContextHost;
}
