use serde_json::Value;
use std::fmt::Display;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum MetaSchemaId {
  Unknown,
}

#[allow(clippy::derivable_impls)]
impl Default for MetaSchemaId {
  fn default() -> Self {
    MetaSchemaId::Unknown
  }
}

impl MetaSchemaId {
  pub fn discover(node: &Value) -> Option<MetaSchemaId> {
    match node {
      Value::Object(object_value) => match object_value.get("$schema") {
        Some(Value::String(string_value)) => Some(string_value.as_str().into()),
        _ => None,
      },
      _ => None,
    }
  }
}

impl Display for MetaSchemaId {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    f.write_str(self.into())
  }
}

impl From<&MetaSchemaId> for &'static str {
  fn from(value: &MetaSchemaId) -> Self {
    match value {
      MetaSchemaId::Unknown => "",
    }
  }
}

impl From<&str> for MetaSchemaId {
  fn from(value: &str) -> Self {
    #[allow(clippy::match_single_binding)]
    match value {
      _ => MetaSchemaId::Unknown,
    }
  }
}
