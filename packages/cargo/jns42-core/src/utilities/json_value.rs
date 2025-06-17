use super::NodeLocation;

#[cfg(target_arch = "wasm32")]
use crate::exports;

#[derive(Clone, Debug)]
pub struct JsonValue(serde_json::Value);

impl From<JsonValue> for serde_json::Value {
  fn from(value: JsonValue) -> Self {
    value.0
  }
}

impl From<serde_json::Value> for JsonValue {
  fn from(value: serde_json::Value) -> Self {
    Self(value)
  }
}

/*
helpers
*/
impl JsonValue {
  pub fn as_bool(&self) -> Option<bool> {
    self.0.as_bool()
  }

  pub fn value_list(&self, field: &str) -> Option<impl Iterator<Item = &serde_json::Value>> {
    Some(self.0.as_object()?.get(field)?.as_array()?.iter())
  }

  pub fn string_list(&self, field: &str) -> Option<impl Iterator<Item = &str>> {
    self
      .0
      .as_object()?
      .get(field)?
      .as_array()
      .map(|value| value.iter().filter_map(|value| value.as_str()))
  }

  pub fn unsigned_integer(&self, field: &str) -> Option<u32> {
    self.0.as_object()?.get(field)?.as_u64()?.try_into().ok()
  }

  pub fn float(&self, field: &str) -> Option<f64> {
    self.0.as_object()?.get(field)?.as_f64()
  }

  pub fn bool(&self, field: &str) -> Option<bool> {
    self.0.as_object()?.get(field)?.as_bool()
  }

  pub fn string(&self, field: &str) -> Option<&str> {
    self.0.as_object()?.get(field)?.as_str()
  }

  pub fn value(&self, field: &str) -> Option<&serde_json::Value> {
    self.0.as_object()?.get(field)
  }
}

// node
impl JsonValue {
  pub fn node_entry(&self, pointer: &[String], field: &str) -> Option<(Vec<String>, JsonValue)> {
    let selected = self.0.as_object()?.get(field)?;
    let pointer: Vec<_> = pointer.iter().cloned().chain([field.to_string()]).collect();

    let result = (pointer, selected.clone().into());
    Some(result)
  }

  pub fn node_entry_list(
    &self,
    pointer: &[String],
    field: &str,
  ) -> Option<impl Iterator<Item = (Vec<String>, JsonValue)> + '_> {
    let selected = self.0.as_object()?.get(field)?;
    let pointer: Vec<_> = pointer
      .iter()
      .cloned()
      .map(|part| part.to_string())
      .chain([field.to_string()])
      .collect();

    let result = selected
      .as_array()?
      .iter()
      .enumerate()
      .map(move |(key, sub_node)| {
        (
          pointer.iter().cloned().chain([key.to_string()]).collect(),
          sub_node.clone().into(),
        )
      });

    Some(result)
  }

  pub fn node_entry_object(
    &self,
    pointer: &[String],
    field: &str,
  ) -> Option<impl Iterator<Item = (Vec<String>, JsonValue)> + '_> {
    let selected = self.0.as_object()?.get(field)?;
    let pointer: Vec<_> = pointer
      .iter()
      .cloned()
      .map(|part| part.to_string())
      .chain([field.to_string()])
      .collect();

    let result = selected.as_object()?.iter().map(move |(key, sub_node)| {
      (
        pointer.iter().cloned().chain([key.to_string()]).collect(),
        sub_node.clone().into(),
      )
    });

    Some(result)
  }

  pub fn node_location(&self, location: &NodeLocation, field: &str) -> Option<NodeLocation> {
    self
      .node_entry(Default::default(), field)
      .map(|(pointer, _node)| location.push_pointer(pointer.clone()))
  }

  pub fn node_location_list<'n>(
    &'n self,
    location: &'n NodeLocation,
    field: &str,
  ) -> Option<impl Iterator<Item = NodeLocation> + 'n> {
    self
      .node_entry_list(Default::default(), field)
      .map(|value| {
        value
          .into_iter()
          .map(|(pointer, _node)| location.push_pointer(pointer.clone()))
      })
  }

  pub fn node_location_object<'n>(
    &'n self,
    location: &'n NodeLocation,
    field: &str,
  ) -> Option<impl Iterator<Item = (String, NodeLocation)> + 'n> {
    self
      .node_entry_object(Default::default(), field)
      .map(|value| {
        value.into_iter().map(|(pointer, _node)| {
          let sub_location = location.push_pointer(pointer.clone());
          (pointer.last().unwrap().to_owned(), sub_location)
        })
      })
  }
}

#[cfg(target_arch = "wasm32")]
impl From<&serde_json::Value> for exports::jns42::core::utilities::JsonType {
  fn from(value: &serde_json::Value) -> Self {
    match value {
      serde_json::Value::Null => exports::jns42::core::utilities::JsonType::Null,
      serde_json::Value::Bool(_) => exports::jns42::core::utilities::JsonType::Boolean,
      serde_json::Value::Number(_) => exports::jns42::core::utilities::JsonType::Number,
      serde_json::Value::String(_) => exports::jns42::core::utilities::JsonType::Str,
      serde_json::Value::Array(_) => exports::jns42::core::utilities::JsonType::Array,
      serde_json::Value::Object(_) => exports::jns42::core::utilities::JsonType::Object,
    }
  }
}

#[cfg(target_arch = "wasm32")]
impl From<serde_json::Value> for JsonValueHost {
  fn from(value: serde_json::Value) -> Self {
    JsonValueHost(value)
  }
}

#[cfg(target_arch = "wasm32")]
impl From<JsonValueHost> for serde_json::Value {
  fn from(value: JsonValueHost) -> Self {
    value.0
  }
}

#[cfg(target_arch = "wasm32")]
impl From<JsonValueHost> for exports::jns42::core::utilities::JsonValue {
  fn from(value: JsonValueHost) -> Self {
    Self::new(value)
  }
}

#[cfg(target_arch = "wasm32")]
impl From<exports::jns42::core::utilities::JsonValue> for JsonValueHost {
  fn from(value: exports::jns42::core::utilities::JsonValue) -> Self {
    value.into_inner()
  }
}

#[cfg(target_arch = "wasm32")]
pub struct JsonValueHost(serde_json::Value);

#[cfg(target_arch = "wasm32")]
impl exports::jns42::core::utilities::GuestJsonValue for JsonValueHost {
  fn get_type(&self) -> exports::jns42::core::utilities::JsonType {
    (&self.0).into()
  }

  fn as_boolean(&self) -> Option<bool> {
    self.0.as_bool()
  }

  fn as_number(&self) -> Option<f64> {
    self.0.as_f64()
  }

  fn as_string(&self) -> Option<String> {
    self.0.as_str().map(|value| value.to_string())
  }

  fn as_array(&self) -> Option<Vec<exports::jns42::core::utilities::JsonValue>> {
    self.0.as_array().map(|value| {
      value
        .iter()
        .cloned()
        .map(JsonValueHost::from)
        .map(Into::into)
        .collect()
    })
  }

  fn as_object(&self) -> Option<Vec<(String, exports::jns42::core::utilities::JsonValue)>> {
    self.0.as_object().map(|value| {
      value
        .iter()
        .map(|(key, value)| (key.clone(), value.clone()))
        .map(|(key, value)| (key, JsonValueHost::from(value)))
        .map(|(key, value)| (key, Into::into(value)))
        .collect()
    })
  }

  fn serialize(&self) -> String {
    serde_json::to_string(&self.0).unwrap()
  }

  fn deserialize(value: String) -> exports::jns42::core::utilities::JsonValue {
    let value: serde_json::Value = serde_json::from_str(&value).unwrap();
    let value: JsonValueHost = value.into();
    exports::jns42::core::utilities::JsonValue::new(value)
  }
}
