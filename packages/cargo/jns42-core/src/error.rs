use crate::utils::node_location::ParseError;
use std::{ffi::NulError, fmt::Display, str::Utf8Error};

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
#[repr(usize)]
pub enum Error {
  Unknown,
  RegisterFactory,
  Deserialization,
  NodeNotFound,
  FactoryNotFound,
  LocationParseError,
  HttpError,
  FileError,
  NulError,
  Utf8Error,
  JsonError,
}

impl std::error::Error for Error {}

impl Display for Error {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Unknown => write!(f, "Unknown"),
      Self::RegisterFactory => write!(f, "RegisterFactory"),
      Self::Deserialization => write!(f, "Deserialization"),
      Self::NodeNotFound => write!(f, "NodeNotFound"),
      Self::FactoryNotFound => write!(f, "FactoryNotFound"),
      Self::LocationParseError => write!(f, "LocationParseError"),
      Self::HttpError => write!(f, "HttpError"),
      Self::FileError => write!(f, "FileError"),
      Self::NulError => write!(f, "NulError"),
      Self::Utf8Error => write!(f, "Utf8Error"),
      Self::JsonError => write!(f, "JsonError"),
    }
  }
  //
}

impl From<ParseError> for Error {
  fn from(value: ParseError) -> Self {
    match value {
      ParseError::InvalidInput => Self::LocationParseError,
      ParseError::DecodeError => Self::LocationParseError,
    }
  }
}

impl From<NulError> for Error {
  fn from(_value: NulError) -> Self {
    Self::NulError
  }
}

impl From<Utf8Error> for Error {
  fn from(_value: Utf8Error) -> Self {
    Self::Utf8Error
  }
}

impl From<serde_json::Error> for Error {
  fn from(_value: serde_json::Error) -> Self {
    Self::JsonError
  }
}

#[cfg(feature = "local")]
impl From<reqwest::Error> for Error {
  fn from(_value: reqwest::Error) -> Self {
    Self::HttpError
  }
}

#[cfg(feature = "local")]
impl From<tokio::io::Error> for Error {
  fn from(_value: tokio::io::Error) -> Self {
    Self::FileError
  }
}
