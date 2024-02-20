use super::value_rc::ValueRc;
use serde_json::Value;
use std::iter::once;
use std::{borrow::Borrow, rc::Rc};

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

pub fn read_json_node_rc(prefix: String, node: Rc<ValueRc>) -> Vec<(String, Rc<ValueRc>)> {
    match node.borrow() {
        ValueRc::Array(array_value) => once((prefix.clone(), node.clone()))
            .chain(
                array_value
                    .iter()
                    .enumerate()
                    .flat_map(|(index, element_value)| {
                        read_json_node_rc(format!("{}/{}", prefix, index), element_value.clone())
                    }),
            )
            .collect(),
        ValueRc::Object(object_value) => once((prefix.clone(), node.clone()))
            .chain(object_value.iter().flat_map(|(name, element_value)| {
                read_json_node_rc(format!("{}/{}", prefix, name), element_value.clone())
            }))
            .collect(),
        _ => once((prefix, node)).collect(),
    }
}
