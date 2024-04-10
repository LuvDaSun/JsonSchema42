use crate::utils::node_location::ParseError;
use std::{ffi::NulError, fmt::Display, str::Utf8Error};

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
#[repr(usize)]
pub enum Error {
  Ok = 0,
  Unknown,
  Conflict,
  NotFound,
  ParseLocationFailed,
  HttpError,
  FileSystemError,
  NulMissing,
  Utf8Error,
  InvalidJson,
  NotARoot,
  NotTheSame,
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
      Self::HttpError => write!(f, "HttpError"),
      Self::FileSystemError => write!(f, "FileSystemError"),
      Self::NulMissing => write!(f, "NulMissing"),
      Self::Utf8Error => write!(f, "Utf8Error"),
      Self::InvalidJson => write!(f, "InvalidJson"),
      Self::NotARoot => write!(f, "NotARoot"),
      Self::NotTheSame => write!(f, "NotTheSame"),
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

impl From<NulError> for Error {
  fn from(_value: NulError) -> Self {
    Self::NulMissing
  }
}

impl From<Utf8Error> for Error {
  fn from(_value: Utf8Error) -> Self {
    Self::Utf8Error
  }
}

impl From<serde_json::Error> for Error {
  fn from(_value: serde_json::Error) -> Self {
    Self::InvalidJson
  }
}

// impl From<reqwest::Error> for Error {
//   fn from(_value: reqwest::Error) -> Self {
//     Self::HttpError
//   }
// }

// impl From<async_std::io::Error> for Error {
//   fn from(_value: async_std::io::Error) -> Self {
//     Self::FileSystemError
//   }
// }
