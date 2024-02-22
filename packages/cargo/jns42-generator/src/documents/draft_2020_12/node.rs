#![allow(dead_code)]

use std::collections::HashMap;

use serde_json::{Number, Value};

#[derive(Debug, Clone)]
pub enum Node {
    Null,
    Bool(bool),
    Float(f64),
    String(String),
    Array(Vec<Node>),
    Object(HashMap<String, Node>),
}

impl Node {
    pub fn as_null(&self) -> Option<()> {
        match self {
            Node::Null => Some(()),
            _ => None,
        }
    }

    pub fn as_bool(&self) -> Option<bool> {
        match self {
            Node::Bool(value) => Some(*value),
            _ => None,
        }
    }

    pub fn as_float(&self) -> Option<f64> {
        match self {
            Node::Float(value) => Some(*value),
            _ => None,
        }
    }

    pub fn as_str(&self) -> Option<&str> {
        match self {
            Node::String(value) => Some(value.as_str()),
            _ => None,
        }
    }

    pub fn as_array(&self) -> Option<&Vec<Node>> {
        match self {
            Node::Array(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_object(&self) -> Option<&HashMap<String, Node>> {
        match self {
            Node::Object(value) => Some(value),
            _ => None,
        }
    }
}

impl From<Value> for Node {
    fn from(value: Value) -> Self {
        match value {
            Value::Null => Self::Null,
            Value::Bool(value) => Self::Bool(value),
            Value::Number(value) => Self::Float(value.as_f64().unwrap()),
            Value::String(value) => Self::String(value),
            Value::Array(value) => {
                Self::Array(value.into_iter().map(|value| value.into()).collect())
            }
            Value::Object(value) => Self::Object(
                value
                    .into_iter()
                    .map(|(key, value)| (key, value.into()))
                    .collect(),
            ),
        }
    }
}
