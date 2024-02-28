use crate::documents;
use clap::ValueEnum;
use serde_json::Value;
use std::fmt::Display;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, ValueEnum)]
pub enum MetaSchemaId {
  Unknown,

  #[clap(name = documents::draft_2020_12::META_SCHEMA_ID)]
  Draft202012,

  #[clap(name = documents::draft_2019_09::META_SCHEMA_ID)]
  Draft201909,

  #[clap(name = documents::draft_07::META_SCHEMA_ID)]
  Draft07,

  #[clap(name = documents::draft_06::META_SCHEMA_ID)]
  Draft06,

  #[clap(name = documents::draft_04::META_SCHEMA_ID)]
  Draft04,
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
      MetaSchemaId::Draft202012 => documents::draft_2020_12::META_SCHEMA_ID,
      MetaSchemaId::Draft201909 => documents::draft_2019_09::META_SCHEMA_ID,
      MetaSchemaId::Draft07 => documents::draft_07::META_SCHEMA_ID,
      MetaSchemaId::Draft06 => documents::draft_06::META_SCHEMA_ID,
      MetaSchemaId::Draft04 => documents::draft_04::META_SCHEMA_ID,
      MetaSchemaId::Unknown => "",
    }
  }
}

impl From<&str> for MetaSchemaId {
  fn from(value: &str) -> Self {
    match value {
      documents::draft_2020_12::META_SCHEMA_ID => MetaSchemaId::Draft202012,
      documents::draft_2019_09::META_SCHEMA_ID => MetaSchemaId::Draft201909,
      documents::draft_07::META_SCHEMA_ID => MetaSchemaId::Draft07,
      documents::draft_06::META_SCHEMA_ID => MetaSchemaId::Draft06,
      documents::draft_04::META_SCHEMA_ID => MetaSchemaId::Draft04,
      _ => MetaSchemaId::Unknown,
    }
  }
}
