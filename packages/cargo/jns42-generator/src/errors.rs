use std::fmt::Display;

#[derive(Debug)]
pub enum Error {
  ExpectedSome,
}

impl std::error::Error for Error {}

impl Display for Error {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Error::ExpectedSome => write!(f, "ExpectedSome"),
    }
  }
}
