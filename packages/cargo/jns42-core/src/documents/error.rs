use crate::utilities::{FetchTextError, NodeCacheError, NodeLocation, ParseLocationError};
use std::fmt::Display;

#[cfg(target_arch = "wasm32")]
use crate::exports;

#[derive(Debug, Clone, Hash, Eq, PartialEq, Ord, PartialOrd)]
pub enum Error {
  Unknown,
  Conflict,
  DocumentNodeNotFound(NodeLocation),
  VersionNodeNotFound(NodeLocation),
  FactoryNotFound(String),
  RetrievalLocationNotFound(NodeLocation),
  IdentityLocationNotFound(NodeLocation),
  DocumentNotFound(NodeLocation),
  ReferenceNotFound(NodeLocation),
  InvalidLocation,
  FetchError,
  SerializationError,
}

impl std::error::Error for Error {}

impl Display for Error {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Unknown => write!(f, "Unknown"),
      Self::Conflict => write!(f, "Conflict"),
      Self::DocumentNodeNotFound(location) => write!(f, "DocumentNodeNotFound: {}", location),
      Self::VersionNodeNotFound(location) => write!(f, "VersionNodeNotFound: {}", location),
      Self::FactoryNotFound(location) => write!(f, "FactoryNotFound: {}", location),
      Self::RetrievalLocationNotFound(location) => {
        write!(f, "RetrievalLocationNotFound: {}", location)
      }
      Self::IdentityLocationNotFound(location) => {
        write!(f, "IdentityLocationNotFound: {}", location)
      }
      Self::DocumentNotFound(location) => write!(f, "DocumentNotFound: {}", location),
      Self::ReferenceNotFound(location) => write!(f, "ReferenceNotFound: {}", location),
      Self::InvalidLocation => write!(f, "InvalidLocation"),
      Self::FetchError => write!(f, "FetchError"),
      Self::SerializationError => write!(f, "SerializationError"),
    }
  }
}

impl From<ParseLocationError> for Error {
  fn from(value: ParseLocationError) -> Self {
    match value {
      ParseLocationError::InvalidInput => Self::InvalidLocation,
      ParseLocationError::DecodeError => Self::InvalidLocation,
    }
  }
}

impl From<FetchTextError> for Error {
  fn from(value: FetchTextError) -> Self {
    match value {
      FetchTextError::HttpError => Self::FetchError,
      FetchTextError::IoError => Self::FetchError,
    }
  }
}

impl From<NodeCacheError> for Error {
  fn from(value: NodeCacheError) -> Self {
    match value {
      NodeCacheError::SerializationError => Self::SerializationError,
      NodeCacheError::FetchError => Self::FetchError,
      NodeCacheError::Conflict => Self::Conflict,
    }
  }
}

#[cfg(target_arch = "wasm32")]
impl From<Error> for exports::jns42::core::documents::Error {
  fn from(value: Error) -> Self {
    match value {
      Error::Unknown => exports::jns42::core::documents::Error::Unknown,
      Error::Conflict => exports::jns42::core::documents::Error::Conflict,
      Error::DocumentNodeNotFound(node_location) => {
        exports::jns42::core::documents::Error::DocumentNodeNotFound(node_location.into())
      }
      Error::VersionNodeNotFound(node_location) => {
        exports::jns42::core::documents::Error::VersionNodeNotFound(node_location.into())
      }
      Error::FactoryNotFound(factory) => {
        exports::jns42::core::documents::Error::FactoryNotFound(factory)
      }
      Error::RetrievalLocationNotFound(node_location) => {
        exports::jns42::core::documents::Error::RetrievalLocationNotFound(node_location.into())
      }
      Error::IdentityLocationNotFound(node_location) => {
        exports::jns42::core::documents::Error::IdentityLocationNotFound(node_location.into())
      }
      Error::DocumentNotFound(node_location) => {
        exports::jns42::core::documents::Error::DocumentNotFound(node_location.into())
      }
      Error::ReferenceNotFound(node_location) => {
        exports::jns42::core::documents::Error::ReferenceNotFound(node_location.into())
      }
      Error::InvalidLocation => exports::jns42::core::documents::Error::InvalidLocation,
      Error::FetchError => exports::jns42::core::documents::Error::FetchError,
      Error::SerializationError => exports::jns42::core::documents::Error::SerializationError,
    }
  }
}
