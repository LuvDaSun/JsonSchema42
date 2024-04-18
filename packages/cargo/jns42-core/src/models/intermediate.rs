use super::SchemaNode;
use crate::utils::node_location::NodeLocation;
use std::collections::HashMap;

#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct IntermediateSchema {
  #[serde(rename = "$schema")]
  pub schema: String,
  pub schemas: HashMap<NodeLocation, IntermediateNode>,
}

pub type IntermediateNode = SchemaNode<String>;
