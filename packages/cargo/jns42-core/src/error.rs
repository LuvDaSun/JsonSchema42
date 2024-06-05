use crate::utils::{FetchTextError, NodeCacheError, ParseLocationError};
use std::fmt::Display;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
#[wasm_bindgen]
pub enum Error {
  Conflict,
  NotFound,
  InvalidLocation,
  FetchError,
  SerializationError,
}

impl std::error::Error for Error {}

impl Display for Error {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Conflict => write!(f, "Conflict"),
      Self::NotFound => write!(f, "NotFound"),
      Self::InvalidLocation => write!(f, "InvalidLocation"),
      Self::FetchError => write!(f, "FetchError"),
      Self::SerializationError => write!(f, "SerializationError"),
    }
  }
  //
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
