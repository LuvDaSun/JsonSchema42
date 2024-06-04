use crate::utils::{FetchTextError, NodeCacheError, ParseError};
use std::fmt::Display;
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
#[wasm_bindgen]
pub enum Error {
  Ok,
  Unknown,
  Conflict,
  NotFound,
  ParseLocationFailed,
  FetchError,
  InvalidJson,
  NotARoot,
  ParseError,
}

impl std::error::Error for Error {}

impl Display for Error {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Ok => write!(f, "Ok"),
      Self::Unknown => write!(f, "Unknown"),
      Self::Conflict => write!(f, "Conflict"),
      Self::NotFound => write!(f, "NotFound"),
      Self::ParseLocationFailed => write!(f, "ParseLocationFailed"),
      Self::FetchError => write!(f, "FetchError"),
      Self::InvalidJson => write!(f, "InvalidJson"),
      Self::NotARoot => write!(f, "NotARoot"),
      Self::ParseError => write!(f, "ParseError"),
    }
  }
  //
}

impl From<ParseError> for Error {
  fn from(value: ParseError) -> Self {
    match value {
      ParseError::InvalidInput => Self::ParseLocationFailed,
      ParseError::DecodeError => Self::ParseLocationFailed,
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
      NodeCacheError::ParseError => Self::ParseError,
      NodeCacheError::FetchError => Self::FetchError,
      NodeCacheError::Conflict => Self::Conflict,
    }
  }
}
