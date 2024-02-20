use serde_json::Value;
use url::Url;

use crate::documents::meta::MetaSchemaId;

pub fn discover_schema_uri(node: &Value) -> Option<MetaSchemaId> {
    match node {
        Value::Object(object_value) => match object_value.get("$schema") {
            Some(Value::String(string_value)) => Some(string_value.as_str().into()),
            _ => None,
        },
        _ => None,
    }
}
