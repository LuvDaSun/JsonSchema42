use crate::utilities::{FetchTextError, NodeCacheError, NodeLocation, ParseLocationError};
use std::fmt::Display;

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

// impl From<Error> for js_sys::Error {
//   fn from(value: Error) -> Self {
//     js_sys::Error::new(&value.to_string())
//   }
// }

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
