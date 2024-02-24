use std::collections::HashMap;

use serde_json::Value;

#[allow(dead_code)]
pub struct IntermediateSchema {
    pub schema: String,
    pub schemas: HashMap<String, IntermediateNode>,
}

pub struct IntermediateNode {
    // metadata
    pub title: Option<String>,
    pub description: Option<String>,
    // pub examples: Option<Vec<Value>>,
    pub deprecated: Option<bool>,

    // types
    pub types: Option<Vec<String>>,

    // assertions
    pub options: Vec<Value>,

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
}
