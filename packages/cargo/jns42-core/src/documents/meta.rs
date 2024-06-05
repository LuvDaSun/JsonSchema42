pub fn discover_meta_schema(node: &serde_json::Value) -> Option<&str> {
  node.as_object()?.get("$schema")?.as_str()
}
