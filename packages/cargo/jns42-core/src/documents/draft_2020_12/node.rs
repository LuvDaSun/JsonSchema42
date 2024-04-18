use crate::models::SchemaType;
use std::iter::{empty, once};

#[derive(Clone, Debug)]
pub struct Node(serde_json::Value);

impl From<serde_json::Value> for Node {
  fn from(value: serde_json::Value) -> Self {
    Self(value)
  }
}

impl Node {
  pub fn select_schema(&self) -> Option<&str> {
    self.0.as_object()?.get("$schema")?.as_str()
  }

  pub fn select_id(&self) -> Option<&str> {
    self.0.as_object()?.get("$id")?.as_str()
  }

  pub fn select_ref(&self) -> Option<&str> {
    self.0.as_object()?.get("$ref")?.as_str()
  }

  pub fn select_title(&self) -> Option<&str> {
    self.0.as_object()?.get("title")?.as_str()
  }

  pub fn select_description(&self) -> Option<&str> {
    self.0.as_object()?.get("description")?.as_str()
  }

  pub fn select_examples(&self) -> Option<&Vec<serde_json::Value>> {
    self.0.as_object()?.get("examples")?.as_array()
  }

  pub fn select_deprecated(&self) -> Option<bool> {
    self.0.as_object()?.get("deprecated")?.as_bool()
  }

  pub fn select_types(&self) -> Option<Vec<SchemaType>> {
    match self.0.as_object()?.get("type")? {
      serde_json::Value::String(value) => Some(vec![SchemaType::parse(value)]),
      serde_json::Value::Array(value) => Some(
        value
          .iter()
          .filter_map(|value| value.as_str().map(SchemaType::parse))
          .collect(),
      ),
      _ => None,
    }
  }

  pub fn select_reference(&self) -> Option<&str> {
    self.0.as_object()?.get("$ref")?.as_str()
  }

  pub fn select_sub_nodes(&self, pointer: &[String]) -> impl Iterator<Item = (Vec<String>, Node)> {
    empty()
      .chain(self.select_if_entry(pointer))
      .chain(self.select_then_entry(pointer))
      .chain(self.select_else_entry(pointer))
      .chain(self.select_not_entry(pointer))
      .chain(self.select_property_names_entry(pointer))
      .chain(self.select_array_items_entry(pointer))
      .chain(self.select_contains_entry(pointer))
      .chain(self.select_map_properties_entry(pointer))
      .chain(self.select_array_items_entry(pointer))
      .chain(self.select_all_of_entries(pointer).unwrap_or_default())
      .chain(self.select_any_of_entries(pointer).unwrap_or_default())
      .chain(self.select_one_of_entries(pointer).unwrap_or_default())
      .chain(self.select_tuple_items_entries(pointer).unwrap_or_default())
      .chain(
        self
          .select_dependent_schemas_entries(pointer)
          .unwrap_or_default(),
      )
      .chain(
        self
          .select_object_properties_entries(pointer)
          .unwrap_or_default(),
      )
      .chain(
        self
          .select_pattern_properties_entries(pointer)
          .unwrap_or_default(),
      )
      .chain(self.select_definition_entries(pointer).unwrap_or_default())
  }

  //

  pub fn select_if_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    select_entries_one(self, pointer, "if")
  }
  pub fn select_then_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    select_entries_one(self, pointer, "then")
  }
  pub fn select_else_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    select_entries_one(self, pointer, "else")
  }
  pub fn select_not_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    select_entries_one(self, pointer, "not")
  }
  pub fn select_contains_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    select_entries_one(self, pointer, "contains")
  }
  pub fn select_array_items_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    select_entries_one(self, pointer, "items")
  }
  pub fn select_property_names_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    select_entries_one(self, pointer, "propertyNames")
  }
  pub fn select_map_properties_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    select_entries_one(self, pointer, "additionalProperties")
  }

  pub fn select_all_of_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    select_entries_list(self, pointer, "allOf")
  }
  pub fn select_any_of_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    select_entries_list(self, pointer, "anyOf")
  }
  pub fn select_one_of_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    select_entries_list(self, pointer, "oneOf")
  }
  pub fn select_tuple_items_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    select_entries_list(self, pointer, "prefixItems")
  }

  pub fn select_dependent_schemas_entries(
    &self,
    pointer: &[String],
  ) -> Option<Vec<(Vec<String>, Node)>> {
    select_entries_map(self, pointer, "dependentSchemas")
  }
  pub fn select_object_properties_entries(
    &self,
    pointer: &[String],
  ) -> Option<Vec<(Vec<String>, Node)>> {
    select_entries_map(self, pointer, "properties")
  }
  pub fn select_pattern_properties_entries(
    &self,
    pointer: &[String],
  ) -> Option<Vec<(Vec<String>, Node)>> {
    select_entries_map(self, pointer, "patternProperties")
  }
  pub fn select_definition_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    select_entries_map(self, pointer, "$defs")
  }

  pub fn select_enum(&self) -> Option<Vec<serde_json::Value>> {
    select_vec_value(self, "enum")
  }

  pub fn select_const(&self) -> Option<&serde_json::Value> {
    select_value(self, "const")
  }

  pub fn select_minimum_inclusive(&self) -> Option<&serde_json::Number> {
    select_number(self, "minimum")
  }

  pub fn select_minimum_exclusive(&self) -> Option<&serde_json::Number> {
    select_number(self, "exclusiveMinimum")
  }

  pub fn select_maximum_inclusive(&self) -> Option<&serde_json::Number> {
    select_number(self, "maximum")
  }

  pub fn select_maximum_exclusive(&self) -> Option<&serde_json::Number> {
    select_number(self, "exclusiveMaximum")
  }

  pub fn select_multiple_of(&self) -> Option<&serde_json::Number> {
    select_number(self, "multipleOf")
  }

  pub fn select_minimum_length(&self) -> Option<u64> {
    select_unsigned_integer(self, "minimumLength")
  }

  pub fn select_maximum_length(&self) -> Option<u64> {
    select_unsigned_integer(self, "maximumLength")
  }

  pub fn select_value_pattern(&self) -> Option<&str> {
    select_str(self, "valuePattern")
  }

  pub fn select_value_format(&self) -> Option<&str> {
    select_str(self, "valueFormat")
  }

  pub fn select_maximum_items(&self) -> Option<u64> {
    select_unsigned_integer(self, "maximumItems")
  }

  pub fn select_minimum_items(&self) -> Option<u64> {
    select_unsigned_integer(self, "minimumLength")
  }

  pub fn select_unique_items(&self) -> Option<bool> {
    select_bool(self, "uniqueItems")
  }

  pub fn select_minimum_properties(&self) -> Option<u64> {
    select_unsigned_integer(self, "minimumProperties")
  }

  pub fn select_maximum_properties(&self) -> Option<u64> {
    select_unsigned_integer(self, "maximumProperties")
  }

  pub fn select_required(&self) -> Option<Vec<&str>> {
    select_vec_str(self, "required")
  }
}

fn select_vec_value(node: &Node, field: &str) -> Option<Vec<serde_json::Value>> {
  node.0.as_object()?.get(field)?.as_array().cloned()
}

fn select_vec_str<'n>(node: &'n Node, field: &str) -> Option<Vec<&'n str>> {
  node
    .0
    .as_object()?
    .get(field)?
    .as_array()
    .map(|value| value.iter().filter_map(|value| value.as_str()).collect())
}

fn select_unsigned_integer(node: &Node, field: &str) -> Option<u64> {
  node.0.as_object()?.get(field)?.as_u64()
}

fn select_value<'n>(node: &'n Node, field: &str) -> Option<&'n serde_json::Value> {
  node.0.as_object()?.get(field)
}

fn select_number<'n>(node: &'n Node, field: &str) -> Option<&'n serde_json::Number> {
  node.0.as_object()?.get(field)?.as_number()
}

fn select_bool(node: &Node, field: &str) -> Option<bool> {
  node.0.as_object()?.get(field)?.as_bool()
}

fn select_str<'n>(node: &'n Node, field: &str) -> Option<&'n str> {
  node.0.as_object()?.get(field)?.as_str()
}

fn select_entries_one(node: &Node, pointer: &[String], field: &str) -> Option<(Vec<String>, Node)> {
  let selected = node.0.as_object()?.get(field)?;
  let pointer: Vec<_> = pointer
    .iter()
    .cloned()
    .chain(once(field.to_string()))
    .collect();

  let result = (pointer, selected.clone().into());
  Some(result)
}

fn select_entries_list(
  node: &Node,
  pointer: &[String],
  field: &str,
) -> Option<Vec<(Vec<String>, Node)>> {
  let selected = node.0.as_object()?.get(field)?;
  let pointer: Vec<_> = pointer
    .iter()
    .cloned()
    .map(|part| part.to_string())
    .chain(once(field.to_string()))
    .collect();

  let result = selected
    .as_array()?
    .iter()
    .enumerate()
    .map(|(key, sub_node)| {
      (
        pointer
          .iter()
          .cloned()
          .chain(once(key.to_string()))
          .collect(),
        sub_node.clone().into(),
      )
    })
    .collect();

  Some(result)
}

fn select_entries_map(
  node: &Node,
  pointer: &[String],
  field: &str,
) -> Option<Vec<(Vec<String>, Node)>> {
  let selected = node.0.as_object()?.get(field)?;
  let pointer: Vec<_> = pointer
    .iter()
    .cloned()
    .map(|part| part.to_string())
    .chain(once(field.to_string()))
    .collect();

  let result = selected
    .as_object()?
    .iter()
    .map(|(key, sub_node)| {
      (
        pointer
          .iter()
          .cloned()
          .chain(once(key.to_string()))
          .collect(),
        sub_node.clone().into(),
      )
    })
    .collect();

  Some(result)
}
