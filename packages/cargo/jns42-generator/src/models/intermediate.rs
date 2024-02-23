use std::collections::HashMap;

use serde_json::Value;

#[allow(dead_code)]
pub struct IntermediateSchema {
    pub schema: String,
    pub schemas: HashMap<String, IntermediateNode>,
}

pub struct IntermediateNode {
    pub title: String,
    pub description: String,
    pub examples: Vec<Value>,
    pub deprecated: bool,
}
