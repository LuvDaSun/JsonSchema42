use std::fmt::Display;

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
pub enum Error {
  Unspecified,
  RegisterFactory,
  FetchFile,
  Deserialization,
  NodeNotFound,
  FactoryNotFound,
}

impl std::error::Error for Error {}

impl Display for Error {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    match self {
      Self::Unspecified => write!(f, "Unspecified"),
      Self::RegisterFactory => write!(f, "RegisterFactory"),
      Self::FetchFile => write!(f, "FetchFile"),
      Self::Deserialization => write!(f, "Deserialization"),
      Self::NodeNotFound => write!(f, "NodeNotFound"),
      Self::FactoryNotFound => write!(f, "FactoryNotFound"),
    }
  }
  //
}
