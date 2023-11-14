use core::fmt;
use serde::de;
use std::{collections::HashMap, rc::Rc};

#[derive(Debug)]
pub enum ValueRc {
    Null,
    Bool(bool),
    Float(f64),
    String(String),
    Array(Vec<Rc<ValueRc>>),
    Object(HashMap<String, Rc<ValueRc>>),
}

impl ValueRc {
    pub fn _as_null(&self) -> Option<()> {
        match self {
            ValueRc::Null => Some(()),
            _ => None,
        }
    }

    pub fn _as_bool(&self) -> Option<bool> {
        match self {
            ValueRc::Bool(value) => Some(*value),
            _ => None,
        }
    }

    pub fn _as_float(&self) -> Option<f64> {
        match self {
            ValueRc::Float(value) => Some(*value),
            _ => None,
        }
    }

    pub fn as_str(&self) -> Option<&str> {
        match self {
            ValueRc::String(value) => Some(value.as_str()),
            _ => None,
        }
    }

    pub fn as_array(&self) -> Option<&Vec<Rc<ValueRc>>> {
        match self {
            ValueRc::Array(value) => Some(value),
            _ => None,
        }
    }

    pub fn as_object(&self) -> Option<&HashMap<String, Rc<ValueRc>>> {
        match self {
            ValueRc::Object(value) => Some(value),
            _ => None,
        }
    }
}

impl<'de> de::Deserialize<'de> for ValueRc {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: de::Deserializer<'de>,
    {
        deserializer.deserialize_any(ValueRcVisitor)
    }
}

struct ValueRcVisitor;

impl<'de> de::Visitor<'de> for ValueRcVisitor {
    type Value = ValueRc;

    fn expecting(&self, formatter: &mut fmt::Formatter) -> fmt::Result {
        write!(formatter, "a value")
    }

    fn visit_unit<E>(self) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        Ok(ValueRc::Null)
    }

    fn visit_bool<E>(self, value: bool) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        let result = value;
        Ok(ValueRc::Bool(result))
    }

    fn visit_i64<E>(self, value: i64) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        let result = value as f64;
        Ok(ValueRc::Float(result))
    }

    fn visit_u64<E>(self, value: u64) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        let result = value as f64;
        Ok(ValueRc::Float(result))
    }

    fn visit_f64<E>(self, value: f64) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        let result = value;
        Ok(ValueRc::Float(result))
    }

    fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
    where
        E: de::Error,
    {
        let result = value.to_owned();
        Ok(ValueRc::String(result))
    }

    fn visit_seq<A>(self, mut value_seq: A) -> Result<Self::Value, A::Error>
    where
        A: de::SeqAccess<'de>,
    {
        let mut result = Vec::new();
        while let Some(element) = value_seq.next_element::<ValueRc>()? {
            result.push(Rc::new(element));
        }
        Ok(ValueRc::Array(result))
    }

    fn visit_map<A>(self, mut value_map: A) -> Result<Self::Value, A::Error>
    where
        A: de::MapAccess<'de>,
    {
        let mut result = HashMap::new();
        while let Some((key, value)) = value_map.next_entry::<String, ValueRc>()? {
            result.insert(key, Rc::new(value));
        }
        Ok(ValueRc::Object(result))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let a: ValueRc = serde_json::from_str(
            r#"
            [{"a":true}]
            "#,
        )
        .unwrap();

        // let b = ValueRc::from(a);

        println!("{:?}", a);
    }
}
