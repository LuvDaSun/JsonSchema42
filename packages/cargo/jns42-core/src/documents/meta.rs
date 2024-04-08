use crate::documents;
use serde_json::Value;
use std::fmt::Display;

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Default)]
#[repr(C)]
pub enum MetaSchemaId {
  #[default]
  Unknown = 0,
  Draft202012,
  Draft201909,
  Draft07,
  Draft06,
  Draft04,
  OasV31,
  OasV30,
  SwaggerV2,
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
      MetaSchemaId::OasV31 => documents::oas_v3_1::META_SCHEMA_ID,
      MetaSchemaId::OasV30 => documents::oas_v3_0::META_SCHEMA_ID,
      MetaSchemaId::SwaggerV2 => documents::swagger_v2::META_SCHEMA_ID,
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
      documents::oas_v3_1::META_SCHEMA_ID => MetaSchemaId::OasV31,
      documents::oas_v3_0::META_SCHEMA_ID => MetaSchemaId::OasV30,
      documents::swagger_v2::META_SCHEMA_ID => MetaSchemaId::SwaggerV2,
      _ => MetaSchemaId::Unknown,
    }
  }
}
