use serde_json::Value;

pub fn discover_meta_schema(node: &Value) -> Option<&str> {
  match node {
    Value::Object(object_value) => match object_value.get("$schema") {
      Some(Value::String(string_value)) => Some(string_value.as_str()),
      _ => None,
    },
    _ => None,
  }
}
