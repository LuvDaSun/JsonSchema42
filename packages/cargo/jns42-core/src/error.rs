use crate::utils::{FetchTextError, NodeCacheError, ParseLocationError};
use std::fmt::Display;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
#[wasm_bindgen]
pub enum Error {
  Unknown,
  Conflict,
  DocumentNodeNotFound,
  VersionNodeNotFound,
  FactoryNotFound,
  RetrievalLocationNotFound,
  IdentityLocationNotFound,
  DocumentNotFound,
  ReferenceNotFound,
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
      Self::DocumentNodeNotFound => write!(f, "DocumentNodeNotFound"),
      Self::VersionNodeNotFound => write!(f, "VersionNodeNotFound"),
      Self::FactoryNotFound => write!(f, "FactoryNotFound"),
      Self::RetrievalLocationNotFound => write!(f, "RetrievalLocationNotFound"),
      Self::IdentityLocationNotFound => write!(f, "IdentityLocationNotFound"),
      Self::DocumentNotFound => write!(f, "DocumentNotFound"),
      Self::ReferenceNotFound => write!(f, "ReferenceNotFound"),
      Self::InvalidLocation => write!(f, "InvalidLocation"),
      Self::FetchError => write!(f, "FetchError"),
      Self::SerializationError => write!(f, "SerializationError"),
    }
  }
}

impl From<Error> for String {
  fn from(value: Error) -> Self {
    value.to_string()
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
