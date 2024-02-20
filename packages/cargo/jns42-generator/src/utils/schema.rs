use serde_json::Value;
use url::Url;

pub fn discover_schema_uri(node: &Value) -> Option<Url> {
    match node {
        Value::Object(object_value) => match object_value.get("$schema") {
            Some(Value::String(string_value)) => string_value.parse().ok(),
            _ => None,
        },
        _ => None,
    }
}
