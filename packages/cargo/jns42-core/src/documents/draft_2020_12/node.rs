use crate::{
  models::{DocumentSchemaItem, SchemaType},
  utils::node_location::NodeLocation,
};
use std::{
  collections::{BTreeSet, HashMap},
  iter::{empty, once},
};

use super::Document;

#[derive(Clone, Debug)]
pub struct Node(serde_json::Value);

impl From<serde_json::Value> for Node {
  fn from(value: serde_json::Value) -> Self {
    Self(value)
  }
}

impl Node {
  pub fn to_document_schema_item(
    &self,
    location: NodeLocation,
    document: &Document,
  ) -> DocumentSchemaItem {
    let reference = None
      .or_else(|| {
        self
          .select_reference()
          .map(|value| document.resolve_reference(value).unwrap())
      })
      .or_else(|| {
        self
          .select_dynamic_reference()
          .map(|value| document.resolve_dynamic_reference(value).unwrap())
      });

    DocumentSchemaItem {
      location: Some(location.clone()),
      name: None,
      exact: Some(true),
      parent: None,
      primary: Some(true),

      // meta
      title: self.select_title().map(|value| value.to_owned()),
      description: self.select_description().map(|value| value.to_owned()),
      examples: self.select_examples().cloned(),
      deprecated: self.select_deprecated(),

      // types
      types: self.select_types(),

      // assertions
      options: {
        let value: Vec<_> = empty()
          .chain(self.select_const().into_iter().cloned())
          .chain(self.select_enum().into_iter().flatten())
          .collect();
        if value.is_empty() {
          None
        } else {
          Some(value)
        }
      },

      minimum_inclusive: self.select_minimum_inclusive().cloned(),
      minimum_exclusive: self.select_minimum_exclusive().cloned(),
      maximum_inclusive: self.select_maximum_inclusive().cloned(),
      maximum_exclusive: self.select_maximum_exclusive().cloned(),
      multiple_of: self.select_multiple_of().cloned(),
      minimum_length: self.select_minimum_length(),
      maximum_length: self.select_maximum_length(),
      value_pattern: self.select_value_pattern().map(|value| value.to_owned()),
      value_format: self.select_value_format().map(|value| value.to_owned()),
      maximum_items: self.select_maximum_items(),
      minimum_items: self.select_minimum_items(),
      unique_items: self.select_unique_items(),
      minimum_properties: self.select_minimum_properties(),
      maximum_properties: self.select_maximum_properties(),
      required: self
        .select_required()
        .map(|value| value.iter().map(|value| (*value).to_owned()).collect()),

      reference,

      // sub nodes
      r#if: Self::map_entry_location(&location, self.select_if_entry(Default::default())),
      then: Self::map_entry_location(&location, self.select_then_entry(Default::default())),
      r#else: Self::map_entry_location(&location, self.select_else_entry(Default::default())),
      not: Self::map_entry_location(&location, self.select_not_entry(Default::default())),
      contains: Self::map_entry_location(&location, self.select_contains_entry(Default::default())),
      array_items: Self::map_entry_location(
        &location,
        self.select_array_items_entry(Default::default()),
      ),
      property_names: Self::map_entry_location(
        &location,
        self.select_property_names_entry(Default::default()),
      ),
      map_properties: Self::map_entry_location(
        &location,
        self.select_map_properties_entry(Default::default()),
      ),

      all_of: Self::map_entry_locations_set(
        &location,
        self.select_all_of_entries(Default::default()),
      ),
      any_of: Self::map_entry_locations_set(
        &location,
        self.select_any_of_entries(Default::default()),
      ),
      one_of: Self::map_entry_locations_set(
        &location,
        self.select_one_of_entries(Default::default()),
      ),
      tuple_items: Self::map_entry_locations_vec(
        &location,
        self.select_tuple_items_entries(Default::default()),
      ),

      dependent_schemas: Self::map_entry_locations_map(
        &location,
        self.select_dependent_schemas_entries(Default::default()),
      ),
      object_properties: Self::map_entry_locations_map(
        &location,
        self.select_object_properties_entries(Default::default()),
      ),
      pattern_properties: Self::map_entry_locations_map(
        &location,
        self.select_pattern_properties_entries(Default::default()),
      ),
    }
  }
}

impl Node {
  pub fn select_schema(&self) -> Option<&str> {
    self.select_str("$schema")
  }

  pub fn select_id(&self) -> Option<&str> {
    self.select_str("$id")
  }

  pub fn select_ref(&self) -> Option<&str> {
    self.select_str("$ref")
  }

  pub fn select_anchor(&self) -> Option<&str> {
    self.select_str("$anchor")
  }

  pub fn select_dynamic_anchor(&self) -> Option<&str> {
    self.select_str("$dynamicAnchor")
  }

  pub fn select_title(&self) -> Option<&str> {
    self.select_str("title")
  }

  pub fn select_description(&self) -> Option<&str> {
    self.select_str("description")
  }

  pub fn select_examples(&self) -> Option<&Vec<serde_json::Value>> {
    self.0.as_object()?.get("examples")?.as_array()
  }

  pub fn select_deprecated(&self) -> Option<bool> {
    self.select_bool("deprecated")
  }

  pub fn select_types(&self) -> Option<Vec<SchemaType>> {
    match &self.0 {
      serde_json::Value::Bool(true) => Some(vec![SchemaType::Any]),
      serde_json::Value::Bool(false) => Some(vec![SchemaType::Never]),
      serde_json::Value::Object(value) => match value.get("type")? {
        serde_json::Value::String(value) => Some(vec![SchemaType::parse(value)]),
        serde_json::Value::Array(value) => Some(
          value
            .iter()
            .filter_map(|value| value.as_str().map(SchemaType::parse))
            .collect(),
        ),
        _ => None,
      },
      _ => None,
    }
  }

  pub fn select_reference(&self) -> Option<&str> {
    self.select_str("$ref")
  }

  pub fn select_dynamic_reference(&self) -> Option<&str> {
    self.select_str("$dynamicRef")
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
    self.select_entries_one(pointer, "if")
  }
  pub fn select_then_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    self.select_entries_one(pointer, "then")
  }
  pub fn select_else_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    self.select_entries_one(pointer, "else")
  }
  pub fn select_not_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    self.select_entries_one(pointer, "not")
  }
  pub fn select_contains_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    self.select_entries_one(pointer, "contains")
  }
  pub fn select_array_items_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    self.select_entries_one(pointer, "items")
  }
  pub fn select_property_names_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    self.select_entries_one(pointer, "propertyNames")
  }
  pub fn select_map_properties_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    self.select_entries_one(pointer, "additionalProperties")
  }

  pub fn select_all_of_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_entries_list(pointer, "allOf")
  }
  pub fn select_any_of_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_entries_list(pointer, "anyOf")
  }
  pub fn select_one_of_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_entries_list(pointer, "oneOf")
  }
  pub fn select_tuple_items_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_entries_list(pointer, "prefixItems")
  }

  pub fn select_dependent_schemas_entries(
    &self,
    pointer: &[String],
  ) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_entries_map(pointer, "dependentSchemas")
  }
  pub fn select_object_properties_entries(
    &self,
    pointer: &[String],
  ) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_entries_map(pointer, "properties")
  }
  pub fn select_pattern_properties_entries(
    &self,
    pointer: &[String],
  ) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_entries_map(pointer, "patternProperties")
  }
  pub fn select_definition_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_entries_map(pointer, "$defs")
  }

  pub fn select_enum(&self) -> Option<Vec<serde_json::Value>> {
    self.select_vec_value("enum")
  }

  pub fn select_const(&self) -> Option<&serde_json::Value> {
    self.select_value("const")
  }

  pub fn select_minimum_inclusive(&self) -> Option<&serde_json::Number> {
    self.select_number("minimum")
  }

  pub fn select_minimum_exclusive(&self) -> Option<&serde_json::Number> {
    self.select_number("exclusiveMinimum")
  }

  pub fn select_maximum_inclusive(&self) -> Option<&serde_json::Number> {
    self.select_number("maximum")
  }

  pub fn select_maximum_exclusive(&self) -> Option<&serde_json::Number> {
    self.select_number("exclusiveMaximum")
  }

  pub fn select_multiple_of(&self) -> Option<&serde_json::Number> {
    self.select_number("multipleOf")
  }

  pub fn select_minimum_length(&self) -> Option<u64> {
    self.select_unsigned_integer("minLength")
  }

  pub fn select_maximum_length(&self) -> Option<u64> {
    self.select_unsigned_integer("maxLength")
  }

  pub fn select_value_pattern(&self) -> Option<&str> {
    self.select_str("valuePattern")
  }

  pub fn select_value_format(&self) -> Option<&str> {
    self.select_str("valueFormat")
  }

  pub fn select_maximum_items(&self) -> Option<u64> {
    self.select_unsigned_integer("maxItems")
  }

  pub fn select_minimum_items(&self) -> Option<u64> {
    self.select_unsigned_integer("minItems")
  }

  pub fn select_unique_items(&self) -> Option<bool> {
    self.select_bool("uniqueItems")
  }

  pub fn select_minimum_properties(&self) -> Option<u64> {
    self.select_unsigned_integer("minProperties")
  }

  pub fn select_maximum_properties(&self) -> Option<u64> {
    self.select_unsigned_integer("maxProperties")
  }

  pub fn select_required(&self) -> Option<Vec<&str>> {
    self.select_vec_str("required")
  }
}

impl Node {
  fn select_vec_value(&self, field: &str) -> Option<Vec<serde_json::Value>> {
    self.0.as_object()?.get(field)?.as_array().cloned()
  }

  fn select_vec_str<'n>(&'n self, field: &str) -> Option<Vec<&'n str>> {
    self
      .0
      .as_object()?
      .get(field)?
      .as_array()
      .map(|value| value.iter().filter_map(|value| value.as_str()).collect())
  }

  fn select_unsigned_integer(&self, field: &str) -> Option<u64> {
    self.0.as_object()?.get(field)?.as_u64()
  }

  fn select_value<'n>(&'n self, field: &str) -> Option<&'n serde_json::Value> {
    self.0.as_object()?.get(field)
  }

  fn select_number<'n>(&'n self, field: &str) -> Option<&'n serde_json::Number> {
    self.0.as_object()?.get(field)?.as_number()
  }

  fn select_bool(&self, field: &str) -> Option<bool> {
    self.0.as_object()?.get(field)?.as_bool()
  }

  fn select_str<'n>(&'n self, field: &str) -> Option<&'n str> {
    self.0.as_object()?.get(field)?.as_str()
  }

  fn select_entries_one(&self, pointer: &[String], field: &str) -> Option<(Vec<String>, Node)> {
    let selected = self.0.as_object()?.get(field)?;
    let pointer: Vec<_> = pointer
      .iter()
      .cloned()
      .chain(once(field.to_string()))
      .collect();

    let result = (pointer, selected.clone().into());
    Some(result)
  }

  fn select_entries_list(
    &self,
    pointer: &[String],
    field: &str,
  ) -> Option<Vec<(Vec<String>, Node)>> {
    let selected = self.0.as_object()?.get(field)?;
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
    &self,
    pointer: &[String],
    field: &str,
  ) -> Option<Vec<(Vec<String>, Node)>> {
    let selected = self.0.as_object()?.get(field)?;
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
}

impl Node {
  fn map_entry_location(
    location: &NodeLocation,
    entry: Option<(Vec<String>, Node)>,
  ) -> Option<NodeLocation> {
    entry.map(|(pointer, _node)| {
      let mut sub_location = location.clone();
      sub_location.push_pointer(pointer.clone());
      sub_location
    })
  }

  fn map_entry_locations_vec(
    location: &NodeLocation,
    entries: Option<Vec<(Vec<String>, Node)>>,
  ) -> Option<Vec<NodeLocation>> {
    entries.map(|value| {
      value
        .iter()
        .map(|(pointer, _node)| {
          let mut sub_location = location.clone();
          sub_location.push_pointer(pointer.clone());
          sub_location
        })
        .collect()
    })
  }

  fn map_entry_locations_set(
    location: &NodeLocation,
    entries: Option<Vec<(Vec<String>, Node)>>,
  ) -> Option<BTreeSet<NodeLocation>> {
    entries.map(|value| {
      value
        .iter()
        .map(|(pointer, _node)| {
          let mut sub_location = location.clone();
          sub_location.push_pointer(pointer.clone());
          sub_location
        })
        .collect()
    })
  }

  fn map_entry_locations_map(
    location: &NodeLocation,
    entries: Option<Vec<(Vec<String>, Node)>>,
  ) -> Option<HashMap<String, NodeLocation>> {
    entries.map(|value| {
      value
        .iter()
        .map(|(pointer, _node)| {
          let mut sub_location = location.clone();
          sub_location.push_pointer(pointer.clone());
          (pointer.last().unwrap().to_owned(), sub_location)
        })
        .collect()
    })
  }
}
