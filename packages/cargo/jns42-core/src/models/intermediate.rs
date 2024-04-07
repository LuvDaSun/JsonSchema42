use crate::utils::node_location::NodeLocation;

use super::schema_item::SchemaType;
use serde_json::Value;
use std::collections::HashMap;

#[derive(Clone, Debug)]
pub struct IntermediateSchema {
  pub schema: String,
  pub schemas: HashMap<NodeLocation, IntermediateNode>,
}

#[derive(Clone, Copy, Debug)]
pub enum IntermediateType {
  Never,
  Any,
  Null,
  Boolean,
  Integer,
  Number,
  String,
  Array,
  Object,
}

impl IntermediateType {
  pub fn parse(input: &str) -> Self {
    match input {
      "never" => Self::Never,
      "any" => Self::Any,
      "null" => Self::Null,
      "boolean" => Self::Boolean,
      "integer" => Self::Integer,
      "number" => Self::Number,
      "string" => Self::String,
      "array" => Self::Array,
      "object" => Self::Object,
      _ => {
        unreachable!();
      }
    }
  }
}

impl From<&SchemaType> for IntermediateType {
  fn from(value: &SchemaType) -> Self {
    match value {
      SchemaType::Never => Self::Never,
      SchemaType::Any => Self::Any,
      SchemaType::Null => Self::Null,
      SchemaType::Boolean => Self::Boolean,
      SchemaType::Integer => Self::Integer,
      SchemaType::Number => Self::Number,
      SchemaType::String => Self::String,
      SchemaType::Array => Self::Array,
      SchemaType::Map => Self::Object,
    }
  }
}

#[derive(Clone, Debug)]
pub struct IntermediateNode {
  // metadata
  pub title: Option<String>,
  pub description: Option<String>,
  pub examples: Option<Vec<Value>>,
  pub deprecated: Option<bool>,

  // types
  pub types: Option<Vec<IntermediateType>>,

  // assertions
  pub options: Option<Vec<Value>>,

  pub minimum_inclusive: Option<f64>,
  pub minimum_exclusive: Option<f64>,
  pub maximum_inclusive: Option<f64>,
  pub maximum_exclusive: Option<f64>,
  pub multiple_of: Option<f64>,

  pub minimum_length: Option<usize>,
  pub maximum_length: Option<usize>,
  pub value_pattern: Option<String>,
  pub value_format: Option<String>,

  pub maximum_items: Option<usize>,
  pub minimum_items: Option<usize>,
  pub unique_items: Option<bool>,

  pub minimum_properties: Option<usize>,
  pub maximum_properties: Option<usize>,
  pub required: Option<Vec<String>>,

  // applicators
  pub reference: Option<String>,

  pub all_of: Option<Vec<String>>,
  pub any_of: Option<Vec<String>>,
  pub one_of: Option<Vec<String>>,
  pub tuple_items: Option<Vec<String>>,

  pub r#if: Option<String>,
  pub r#then: Option<String>,
  pub r#else: Option<String>,

  pub not: Option<String>,

  pub contains: Option<String>,
  pub property_names: Option<String>,
  pub map_properties: Option<String>,
  pub array_items: Option<String>,

  pub object_properties: Option<HashMap<String, String>>,
  pub pattern_properties: Option<HashMap<String, String>>,
  pub dependent_schemas: Option<HashMap<String, String>>,
}
