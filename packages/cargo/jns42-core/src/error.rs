use crate::utils::node_location::ParseError;
use std::fmt::Display;

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
pub enum Error {
  Unspecified,
  RegisterFactory,
  Deserialization,
  NodeNotFound,
  FactoryNotFound,
  LocationParseError,
  HttpError,
  FileError,
}

impl std::error::Error for Error {}

impl Display for Error {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Unspecified => write!(f, "Unspecified"),
      Self::RegisterFactory => write!(f, "RegisterFactory"),
      Self::Deserialization => write!(f, "Deserialization"),
      Self::NodeNotFound => write!(f, "NodeNotFound"),
      Self::FactoryNotFound => write!(f, "FactoryNotFound"),
      Self::LocationParseError => write!(f, "LocationParseError"),
      Self::HttpError => write!(f, "HttpError"),
      Self::FileError => write!(f, "FileError"),
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
