#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Word(String);

impl Word {
  pub fn new(value: &str) -> Self {
    assert!(!value.is_empty());

    Self(value.to_lowercase())
  }

  pub fn as_lower(&self) -> &str {
    &self.0
  }

  pub fn to_upper(&self) -> String {
    self.0.to_uppercase()
  }

  pub fn to_pascal(&self) -> String {
    self.0[0..1].to_uppercase() + &self.0[1..]
  }
}

impl AsRef<str> for Word {
  fn as_ref(&self) -> &str {
    &self.0
  }
}
