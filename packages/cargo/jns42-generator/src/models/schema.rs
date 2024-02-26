use im::HashMap;
use serde_json::Value;

pub type SchemaKey = usize;

#[derive(Clone, PartialEq, Default, Debug)]
pub struct SchemaNode {
    pub id: Option<String>,

    // metadata
    pub title: Option<String>,
    pub description: Option<String>,
    // pub examples: Option<Vec<Value>>,
    pub deprecated: Option<bool>,

    // types
    pub types: Option<Vec<String>>,

    // applicators
    pub reference: Option<SchemaKey>,

    pub all_of: Option<Vec<SchemaKey>>,
    pub any_of: Option<Vec<SchemaKey>>,
    pub one_of: Option<Vec<SchemaKey>>,

    pub r#if: Option<SchemaKey>,
    pub then: Option<SchemaKey>,
    pub r#else: Option<SchemaKey>,

    pub not: Option<SchemaKey>,

    pub map_properties: Option<SchemaKey>,
    pub array_items: Option<SchemaKey>,
    pub property_names: Option<SchemaKey>,
    pub contains: Option<SchemaKey>,

    pub tuple_items: Option<Vec<SchemaKey>>,

    pub object_properties: Option<HashMap<String, SchemaKey>>,
    pub pattern_properties: Option<HashMap<String, SchemaKey>>,
    pub dependent_schemas: Option<HashMap<String, SchemaKey>>,

    // assertions
    pub options: Option<Vec<Value>>,
    pub required: Option<Vec<String>>,

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
}
