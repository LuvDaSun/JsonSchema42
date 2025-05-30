use super::NodeLocation;

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

  pub fn unsigned_integer(&self, field: &str) -> Option<u64> {
    self.0.as_object()?.get(field)?.as_u64()
  }

  pub fn number(&self, field: &str) -> Option<&serde_json::Number> {
    self.0.as_object()?.get(field)?.as_number()
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
