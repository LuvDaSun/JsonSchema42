use serde_json::Value;

use super::Node;
use crate::{models::intermediate::IntermediateType, utils::json_pointer::JsonPointer};

pub trait Selectors {
  fn select_schema(&self) -> Option<&str>;
  fn select_id(&self) -> Option<&str>;
  fn select_ref(&self) -> Option<&str>;

  fn select_title(&self) -> Option<&str>;
  fn select_description(&self) -> Option<&str>;
  // fn select_examples(&self) -> Option<&Vec<Value>>;
  fn select_deprecated(&self) -> Option<bool>;

  fn select_options(&self) -> Option<Vec<Value>>;

  fn select_types(&self) -> Option<Vec<IntermediateType>>;

  fn select_reference(&self) -> Option<&str>;

  fn select_minimum_inclusive(&self) -> Option<f64>;
  fn select_minimum_exclusive(&self) -> Option<f64>;
  fn select_maximum_inclusive(&self) -> Option<f64>;
  fn select_maximum_exclusive(&self) -> Option<f64>;
  fn select_multiple_of(&self) -> Option<f64>;
  fn select_minimum_length(&self) -> Option<usize>;
  fn select_maximum_length(&self) -> Option<usize>;
  fn select_value_pattern(&self) -> Option<&str>;
  fn select_value_format(&self) -> Option<&str>;
  fn select_maximum_items(&self) -> Option<usize>;
  fn select_minimum_items(&self) -> Option<usize>;
  fn select_unique_items(&self) -> Option<bool>;
  fn select_minimum_properties(&self) -> Option<usize>;
  fn select_maximum_properties(&self) -> Option<usize>;
  fn select_required(&self) -> Option<Vec<&str>>;

  fn select_sub_nodes(&self, pointer: &JsonPointer) -> Vec<(JsonPointer, Node)>;
  fn select_sub_node_def_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_sub_node_property_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_sub_node_additional_properties_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_sub_node_prefix_items_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_sub_node_items_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_sub_node_all_of_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_sub_node_any_of_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_sub_node_one_of_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_sub_node_if_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_sub_node_then_entries(&self, pointer: &JsonPointer)
    -> Option<Vec<(JsonPointer, Node)>>;
  fn select_sub_node_else_entries(&self, pointer: &JsonPointer)
    -> Option<Vec<(JsonPointer, Node)>>;
}

impl Selectors for Node {
  fn select_schema(&self) -> Option<&str> {
    self.as_object()?.get("$schema")?.as_str()
  }

  fn select_id(&self) -> Option<&str> {
    self.as_object()?.get("$id")?.as_str()
  }

  fn select_ref(&self) -> Option<&str> {
    self.as_object()?.get("$ref")?.as_str()
  }

  fn select_title(&self) -> Option<&str> {
    self.as_object()?.get("title")?.as_str()
  }

  fn select_description(&self) -> Option<&str> {
    self.as_object()?.get("description")?.as_str()
  }

  // fn select_examples(&self) -> Option<&Vec<Value>> {
  //     self.as_object()?
  //         .get("examples")?
  //         .as_array()
  //         .map(|item| item.into())
  // }

  fn select_deprecated(&self) -> Option<bool> {
    self.as_object()?.get("deprecated")?.as_bool()
  }

  fn select_types(&self) -> Option<Vec<IntermediateType>> {
    match self.as_object()?.get("type")? {
      Node::String(value) => Some(vec![IntermediateType::parse(value)]),
      Node::Array(value) => Some(
        value
          .iter()
          .filter_map(|value| value.as_str().map(IntermediateType::parse))
          .collect(),
      ),
      _ => None,
    }
  }

  fn select_reference(&self) -> Option<&str> {
    self.as_object()?.get("type")?.as_str()
  }

  fn select_sub_nodes(&self, pointer: &JsonPointer) -> Vec<(JsonPointer, Node)> {
    vec![
      self
        .select_sub_node_def_entries(pointer)
        .unwrap_or_default(),
      self
        .select_sub_node_property_entries(pointer)
        .unwrap_or_default(),
      self
        .select_sub_node_additional_properties_entries(pointer)
        .unwrap_or_default(),
      self
        .select_sub_node_prefix_items_entries(pointer)
        .unwrap_or_default(),
      self
        .select_sub_node_items_entries(pointer)
        .unwrap_or_default(),
      self
        .select_sub_node_all_of_entries(pointer)
        .unwrap_or_default(),
      self
        .select_sub_node_any_of_entries(pointer)
        .unwrap_or_default(),
      self
        .select_sub_node_one_of_entries(pointer)
        .unwrap_or_default(),
      self.select_sub_node_if_entries(pointer).unwrap_or_default(),
      self
        .select_sub_node_then_entries(pointer)
        .unwrap_or_default(),
      self
        .select_sub_node_else_entries(pointer)
        .unwrap_or_default(),
    ]
    .into_iter()
    .flatten()
    .collect()
  }

  //

  fn select_sub_node_def_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "$defs";
    let selected = self.as_object()?.get(select_name)?;

    let result = selected
      .as_object()?
      .iter()
      .map(|(key, sub_node)| {
        (
          pointer.push(select_name.to_string()).push(key.to_string()),
          sub_node.clone(),
        )
      })
      .collect();

    Some(result)
  }
  fn select_sub_node_property_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "properties";
    let selected = self.as_object()?.get(select_name)?;

    let result = selected
      .as_object()?
      .iter()
      .map(|(key, sub_node)| {
        (
          pointer.push(select_name.to_string()).push(key.to_string()),
          sub_node.clone(),
        )
      })
      .collect();

    Some(result)
  }
  fn select_sub_node_additional_properties_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "additionalProperties";
    let selected = self.as_object()?.get(select_name)?;

    let result = vec![(pointer.push(select_name.to_string()), selected.clone())];

    Some(result)
  }
  fn select_sub_node_prefix_items_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "prefixItems";
    let selected = self.as_object()?.get(select_name)?;

    let result = selected
      .as_array()?
      .iter()
      .enumerate()
      .map(|(key, sub_node)| {
        (
          pointer.push(select_name.to_string()).push(key.to_string()),
          sub_node.clone(),
        )
      })
      .collect();

    Some(result)
  }
  fn select_sub_node_items_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "items";
    let selected = self.as_object()?.get(select_name)?;

    let result = vec![(pointer.push(select_name.to_string()), selected.clone())];

    Some(result)
  }
  fn select_sub_node_all_of_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "allOf";
    let selected = self.as_object()?.get(select_name)?;

    let result = selected
      .as_array()?
      .iter()
      .enumerate()
      .map(|(key, sub_node)| {
        (
          pointer.push(select_name.to_string()).push(key.to_string()),
          sub_node.clone(),
        )
      })
      .collect();

    Some(result)
  }
  fn select_sub_node_any_of_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "anyOf";
    let selected = self.as_object()?.get(select_name)?;

    let result = selected
      .as_array()?
      .iter()
      .enumerate()
      .map(|(key, sub_node)| {
        (
          pointer.push(select_name.to_string()).push(key.to_string()),
          sub_node.clone(),
        )
      })
      .collect();

    Some(result)
  }
  fn select_sub_node_one_of_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "oneOf";
    let selected = self.as_object()?.get(select_name)?;

    let result = selected
      .as_array()?
      .iter()
      .enumerate()
      .map(|(key, sub_node)| {
        (
          pointer.push(select_name.to_string()).push(key.to_string()),
          sub_node.clone(),
        )
      })
      .collect();

    Some(result)
  }

  fn select_sub_node_if_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "if";
    let selected = self.as_object()?.get(select_name)?;

    let result = vec![(pointer.push(select_name.to_string()), selected.clone())];

    Some(result)
  }

  fn select_sub_node_then_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "then";
    let selected = self.as_object()?.get(select_name)?;

    let result = vec![(pointer.push(select_name.to_string()), selected.clone())];

    Some(result)
  }

  fn select_sub_node_else_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    let select_name = "else";
    let selected = self.as_object()?.get(select_name)?;

    let result = vec![(pointer.push(select_name.to_string()), selected.clone())];

    Some(result)
  }

  fn select_options(&self) -> Option<Vec<Value>> {
    Some(vec![])
  }

  fn select_minimum_inclusive(&self) -> Option<f64> {
    self.as_object()?.get("minimumInclusive")?.as_float()
  }

  fn select_minimum_exclusive(&self) -> Option<f64> {
    self.as_object()?.get("minimumExclusive")?.as_float()
  }

  fn select_maximum_inclusive(&self) -> Option<f64> {
    self.as_object()?.get("maximumInclusive")?.as_float()
  }

  fn select_maximum_exclusive(&self) -> Option<f64> {
    self.as_object()?.get("maximumExclusive")?.as_float()
  }

  fn select_multiple_of(&self) -> Option<f64> {
    self.as_object()?.get("multipleOf")?.as_float()
  }

  fn select_minimum_length(&self) -> Option<usize> {
    self
      .as_object()?
      .get("minimumLength")?
      .as_float()
      .map(|value| value as usize)
  }

  fn select_maximum_length(&self) -> Option<usize> {
    self
      .as_object()?
      .get("maximumLength")?
      .as_float()
      .map(|value| value as usize)
  }

  fn select_value_pattern(&self) -> Option<&str> {
    self.as_object()?.get("valuePattern")?.as_str()
  }

  fn select_value_format(&self) -> Option<&str> {
    self.as_object()?.get("valueFormat")?.as_str()
  }

  fn select_maximum_items(&self) -> Option<usize> {
    self
      .as_object()?
      .get("maximumItems")?
      .as_float()
      .map(|value| value as usize)
  }

  fn select_minimum_items(&self) -> Option<usize> {
    self
      .as_object()?
      .get("minimumLength")?
      .as_float()
      .map(|value| value as usize)
  }

  fn select_unique_items(&self) -> Option<bool> {
    self.as_object()?.get("uniqueItems")?.as_bool()
  }

  fn select_minimum_properties(&self) -> Option<usize> {
    self
      .as_object()?
      .get("minimumProperties")?
      .as_float()
      .map(|value| value as usize)
  }

  fn select_maximum_properties(&self) -> Option<usize> {
    self
      .as_object()?
      .get("maximumProperties")?
      .as_float()
      .map(|value| value as usize)
  }

  fn select_required(&self) -> Option<Vec<&str>> {
    self
      .as_object()?
      .get("minimumLength")?
      .as_array()
      .map(|value| value.iter().filter_map(|value| value.as_str()).collect())
  }
}
