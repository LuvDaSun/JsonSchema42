use crate::utils::{NodeCache, NodeLocation};
use semver::Version;

pub fn discover_meta_schema_id(version_node: &serde_json::Value) -> Option<&str> {
  if let Some(schema) = select_schema(version_node) {
    return Some(schema);
  }

  if let Some(version) = select_openapi(version_node) {
    let version = Version::parse(version).ok()?;

    if version.major == 3 && version.minor == 0 {
      return Some(super::oas_v3_0::META_SCHEMA_ID);
    }

    if version.major == 3 && version.minor == 1 {
      if let Some(schema) = select_json_schema_dialect(version_node) {
        return Some(schema);
      }

      return Some(super::oas_v3_1::META_SCHEMA_ID);
    }
  }

  None
}

fn select_schema(node: &serde_json::Value) -> Option<&str> {
  node.as_object()?.get("$schema")?.as_str()
}

fn select_openapi(node: &serde_json::Value) -> Option<&str> {
  node.as_object()?.get("openapi")?.as_str()
}

fn select_json_schema_dialect(node: &serde_json::Value) -> Option<&str> {
  node.as_object()?.get("jsonSchemaDialect")?.as_str()
}

/// find the nearest ancestor (or self) node that defines the version of the
/// node's schema
///
pub fn find_version_node(
  node_cache: &NodeCache,
  retrieval_location: &NodeLocation,
) -> Option<NodeLocation> {
  let nodes = node_cache.get_node_with_ancestors(retrieval_location);

  for (location, node) in nodes.into_iter().rev() {
    let Some(node) = node.as_object() else {
      continue;
    };

    if node.contains_key("$schema") {
      return Some(location);
    }
    if node.contains_key("openapi") {
      return Some(location);
    }
  }

  None
}

/// find the farthest ancestor (or self) node that is a document
///
pub fn find_document_node(
  node_cache: &NodeCache,
  retrieval_location: &NodeLocation,
) -> Option<NodeLocation> {
  let nodes = node_cache.get_node_with_ancestors(retrieval_location);

  for (location, node) in nodes {
    let Some(node) = node.as_object() else {
      continue;
    };

    if node.contains_key("$id") || node.contains_key("$schema") || node.contains_key("openapi") {
      return Some(location);
    }
  }

  None
}
