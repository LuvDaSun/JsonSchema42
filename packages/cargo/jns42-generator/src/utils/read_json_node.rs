use serde_json::Value;
use std::iter::once;

pub fn read_json_node(prefix: String, node: Value) -> Vec<(String, Value)> {
    match &node {
        Value::Array(array_value) => once((prefix.clone(), node.clone()))
            .chain(
                array_value
                    .iter()
                    .enumerate()
                    .flat_map(|(index, element_value)| {
                        read_json_node(format!("{}/{}", prefix, index), element_value.clone())
                    }),
            )
            .collect(),
        Value::Object(object_value) => once((prefix.clone(), node.clone()))
            .chain(object_value.iter().flat_map(|(name, element_value)| {
                read_json_node(format!("{}/{}", prefix, name), element_value.clone())
            }))
            .collect(),
        _ => once((prefix, node)).collect(),
    }
}
