use std::collections::HashMap;

#[allow(dead_code)]
pub struct IntermediateSchema {
    pub schema: String,
    pub schemas: HashMap<String, IntermediateNode>,
}

pub struct IntermediateNode {
    pub title: Option<String>,
    pub description: Option<String>,
    // pub examples: Option<Vec<Value>>,
    pub deprecated: Option<bool>,
}
