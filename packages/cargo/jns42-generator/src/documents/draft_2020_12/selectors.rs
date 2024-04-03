use serde_json::Value;

use super::Node;
use jns42_core::models::intermediate::IntermediateType;
use jns42_core::utils::json_pointer::JsonPointer;

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
  fn select_reference_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;

  fn select_definition_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;

  fn select_all_of_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_any_of_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_one_of_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_tuple_items_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;

  fn select_if_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_then_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_else_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;

  fn select_not_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;

  fn select_contains_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_array_items_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_property_names_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_map_properties_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;

  fn select_dependent_schemas_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_object_properties_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
  fn select_pattern_properties_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>>;
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
    self.as_object()?.get("$ref")?.as_str()
  }

  fn select_sub_nodes(&self, pointer: &JsonPointer) -> Vec<(JsonPointer, Node)> {
    vec![
      self.select_reference_entries(pointer).unwrap_or_default(),
      self.select_definition_entries(pointer).unwrap_or_default(),
      self
        .select_property_names_entries(pointer)
        .unwrap_or_default(),
      self.select_if_entries(pointer).unwrap_or_default(),
      self.select_then_entries(pointer).unwrap_or_default(),
      self.select_else_entries(pointer).unwrap_or_default(),
      self.select_not_entries(pointer).unwrap_or_default(),
      self.select_array_items_entries(pointer).unwrap_or_default(),
      self.select_contains_entries(pointer).unwrap_or_default(),
      self.select_tuple_items_entries(pointer).unwrap_or_default(),
      self.select_all_of_entries(pointer).unwrap_or_default(),
      self.select_any_of_entries(pointer).unwrap_or_default(),
      self.select_one_of_entries(pointer).unwrap_or_default(),
      self
        .select_object_properties_entries(pointer)
        .unwrap_or_default(),
      self
        .select_pattern_properties_entries(pointer)
        .unwrap_or_default(),
      self
        .select_dependent_schemas_entries(pointer)
        .unwrap_or_default(),
    ]
    .into_iter()
    .flatten()
    .collect()
  }

  //

  fn select_reference_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_one(self, pointer, "$ref")
  }
  fn select_definition_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_map(self, pointer, "$defs")
  }

  fn select_all_of_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_many(self, pointer, "allOf")
  }
  fn select_any_of_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_many(self, pointer, "anyOf")
  }
  fn select_one_of_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_many(self, pointer, "oneOf")
  }

  fn select_tuple_items_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_many(self, pointer, "prefixItems")
  }

  fn select_if_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_one(self, pointer, "if")
  }

  fn select_then_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_one(self, pointer, "then")
  }

  fn select_else_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_one(self, pointer, "else")
  }

  fn select_not_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_one(self, pointer, "not")
  }

  fn select_contains_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_one(self, pointer, "contains")
  }
  fn select_array_items_entries(&self, pointer: &JsonPointer) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_one(self, pointer, "items")
  }
  fn select_property_names_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_one(self, pointer, "propertyNames")
  }
  fn select_map_properties_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_one(self, pointer, "additionalProperties")
  }

  fn select_dependent_schemas_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_map(self, pointer, "dependentSchemas")
  }
  fn select_object_properties_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_map(self, pointer, "properties")
  }
  fn select_pattern_properties_entries(
    &self,
    pointer: &JsonPointer,
  ) -> Option<Vec<(JsonPointer, Node)>> {
    select_entries_map(self, pointer, "patternProperties")
  }

  fn select_options(&self) -> Option<Vec<Value>> {
    Some(vec![])
  }

  fn select_minimum_inclusive(&self) -> Option<f64> {
    select_float(self, "minimumInclusive")
  }

  fn select_minimum_exclusive(&self) -> Option<f64> {
    select_float(self, "minimumExclusive")
  }

  fn select_maximum_inclusive(&self) -> Option<f64> {
    select_float(self, "maximumInclusive")
  }

  fn select_maximum_exclusive(&self) -> Option<f64> {
    select_float(self, "maximumExclusive")
  }

  fn select_multiple_of(&self) -> Option<f64> {
    select_float(self, "multipleOf")
  }

  fn select_minimum_length(&self) -> Option<usize> {
    select_usize(self, "minimumLength")
  }

  fn select_maximum_length(&self) -> Option<usize> {
    select_usize(self, "maximumLength")
  }

  fn select_value_pattern(&self) -> Option<&str> {
    select_str(self, "valuePattern")
  }

  fn select_value_format(&self) -> Option<&str> {
    select_str(self, "valueFormat")
  }

  fn select_maximum_items(&self) -> Option<usize> {
    select_usize(self, "maximumItems")
  }

  fn select_minimum_items(&self) -> Option<usize> {
    select_usize(self, "minimumLength")
  }

  fn select_unique_items(&self) -> Option<bool> {
    select_bool(self, "uniqueItems")
  }

  fn select_minimum_properties(&self) -> Option<usize> {
    select_usize(self, "minimumProperties")
  }

  fn select_maximum_properties(&self) -> Option<usize> {
    select_usize(self, "maximumProperties")
  }

  fn select_required(&self) -> Option<Vec<&str>> {
    select_vec_str(self, "required")
  }
}

fn select_vec_str<'n>(node: &'n Node, field: &str) -> Option<Vec<&'n str>> {
  node
    .as_object()?
    .get(field)?
    .as_array()
    .map(|value| value.iter().filter_map(|value| value.as_str()).collect())
}

fn select_usize(node: &Node, field: &str) -> Option<usize> {
  node
    .as_object()?
    .get(field)?
    .as_float()
    .map(|value| value as usize)
}

fn select_float(node: &Node, field: &str) -> Option<f64> {
  node.as_object()?.get(field)?.as_float()
}

fn select_bool(node: &Node, field: &str) -> Option<bool> {
  node.as_object()?.get(field)?.as_bool()
}

fn select_str<'n>(node: &'n Node, field: &str) -> Option<&'n str> {
  node.as_object()?.get(field)?.as_str()
}

fn select_entries_map(
  node: &Node,
  pointer: &JsonPointer,
  field: &str,
) -> Option<Vec<(JsonPointer, Node)>> {
  let selected = node.as_object()?.get(field)?;

  let result = selected
    .as_object()?
    .iter()
    .map(|(key, sub_node)| {
      (
        pointer.push(field.to_string()).push(key.to_string()),
        sub_node.clone(),
      )
    })
    .collect();

  Some(result)
}

fn select_entries_one(
  node: &Node,
  pointer: &JsonPointer,
  field: &str,
) -> Option<Vec<(JsonPointer, Node)>> {
  let selected = node.as_object()?.get(field)?;

  let result = vec![(pointer.push(field.to_string()), selected.clone())];

  Some(result)
}

fn select_entries_many(
  node: &Node,
  pointer: &JsonPointer,
  field: &str,
) -> Option<Vec<(JsonPointer, Node)>> {
  let selected = node.as_object()?.get(field)?;

  let result = selected
    .as_array()?
    .iter()
    .enumerate()
    .map(|(key, sub_node)| {
      (
        pointer.push(field.to_string()).push(key.to_string()),
        sub_node.clone(),
      )
    })
    .collect();

  Some(result)
}
