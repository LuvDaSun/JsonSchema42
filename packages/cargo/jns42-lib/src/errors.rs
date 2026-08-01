#[derive(Clone, Debug, PartialEq, PartialOrd, Eq, Ord)]
pub struct ValidationError {
  r#type: &'static str,
}

impl std::error::Error for ValidationError {}

impl ValidationError {
  pub fn new(r#type: &'static str) -> Self {
    Self { r#type }
  }
}

impl core::fmt::Display for ValidationError {
  fn fmt(&self, f: &mut core::fmt::Formatter<'_>) -> core::fmt::Result {
    write!(f, "validation error for type {}", self.r#type)
  }
}
