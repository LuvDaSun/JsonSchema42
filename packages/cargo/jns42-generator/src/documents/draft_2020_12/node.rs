#![allow(dead_code)]

use std::collections::HashMap;

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
