use super::SchemaType;
use crate::utils::node_location::NodeLocation;
use serde_json::Value;
use std::collections::{HashMap, HashSet};

#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct IntermediateSchema {
  #[serde(rename = "$schema")]
  pub schema: String,
  pub schemas: HashMap<NodeLocation, IntermediateNode>,
}

#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct IntermediateNode {
  #[serde(default)]
  pub name: Option<String>,
  #[serde(default)]
  pub exact: Option<bool>,

  #[serde(default)]
  pub primary: Option<bool>,
  #[serde(default)]
  pub parent: Option<String>,
  #[serde(default)]
  pub id: Option<String>,

  // metadata
  #[serde(default)]
  pub title: Option<String>,
  #[serde(default)]
  pub description: Option<String>,
  #[serde(default)]
  pub examples: Option<Vec<Value>>,
  #[serde(default)]
  pub deprecated: Option<bool>,

  // types
  #[serde(default)]
  pub types: Option<Vec<SchemaType>>,

  // applicators
  #[serde(default)]
  pub reference: Option<String>,

  #[serde(default)]
  pub r#if: Option<String>,
  #[serde(default)]
  pub r#then: Option<String>,
  #[serde(default)]
  pub r#else: Option<String>,

  #[serde(default)]
  pub not: Option<String>,

  #[serde(default)]
  pub property_names: Option<String>,
  #[serde(default)]
  pub map_properties: Option<String>,
  #[serde(default)]
  pub array_items: Option<String>,
  #[serde(default)]
  pub contains: Option<String>,

  #[serde(default)]
  pub all_of: Option<Vec<String>>,
  #[serde(default)]
  pub any_of: Option<Vec<String>>,
  #[serde(default)]
  pub one_of: Option<Vec<String>>,
  #[serde(default)]
  pub tuple_items: Option<Vec<String>>,

  #[serde(default)]
  pub object_properties: Option<HashMap<String, String>>,
  #[serde(default)]
  pub pattern_properties: Option<HashMap<String, String>>,
  #[serde(default)]
  pub dependent_schemas: Option<HashMap<String, String>>,

  // assertions
  #[serde(default)]
  pub options: Option<Vec<serde_json::Value>>,
  #[serde(default)]
  pub required: Option<HashSet<String>>,

  #[serde(default)]
  pub minimum_inclusive: Option<serde_json::Number>,
  #[serde(default)]
  pub minimum_exclusive: Option<serde_json::Number>,
  #[serde(default)]
  pub maximum_inclusive: Option<serde_json::Number>,
  #[serde(default)]
  pub maximum_exclusive: Option<serde_json::Number>,
  #[serde(default)]
  pub multiple_of: Option<serde_json::Number>,

  #[serde(default)]
  pub minimum_length: Option<u64>,
  #[serde(default)]
  pub maximum_length: Option<u64>,
  #[serde(default)]
  pub value_pattern: Option<String>,
  #[serde(default)]
  pub value_format: Option<String>,

  #[serde(default)]
  pub maximum_items: Option<u64>,
  #[serde(default)]
  pub minimum_items: Option<u64>,
  #[serde(default)]
  pub unique_items: Option<bool>,

  #[serde(default)]
  pub minimum_properties: Option<u64>,
  #[serde(default)]
  pub maximum_properties: Option<u64>,
}
