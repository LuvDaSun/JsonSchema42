use crate::{
  models::{DocumentSchemaItem, SchemaType},
  utils::node_location::NodeLocation,
};
use std::iter::{empty, once};

#[derive(Clone, Debug)]
pub struct Node(serde_json::Value);

impl From<serde_json::Value> for Node {
  fn from(value: serde_json::Value) -> Self {
    Self(value)
  }
}

impl Node {
  pub fn to_document_schema_item(&self, location: NodeLocation) -> DocumentSchemaItem {
    let types = {
      match &self.0 {
        serde_json::Value::Bool(true) => Some(vec![SchemaType::Any]),
        serde_json::Value::Bool(false) => Some(vec![SchemaType::Never]),
        serde_json::Value::Object(value) => {
          if let Some(r#type) = value.get("type") {
            match r#type {
              serde_json::Value::String(value) => Some(vec![SchemaType::parse(value)]),
              serde_json::Value::Array(value) => Some(
                value
                  .iter()
                  .filter_map(|value| value.as_str().map(SchemaType::parse))
                  .collect(),
              ),
              _ => None,
            }
          } else {
            None
          }
        }
        _ => None,
      }
    };

    let reference = self.select_reference().map(|value| {
      let reference_location = value.parse().unwrap();
      location.join(&reference_location)
    });

    DocumentSchemaItem {
      location: Some(location.clone()),
      name: None,

      parent: None,
      primary: Some(true),
      exact: Some(true),

      // meta
      title: self.select_string("title").map(|value| value.to_owned()),
      description: self
        .select_string("description")
        .map(|value| value.to_owned()),
      examples: None,
      deprecated: None,

      // types
      types,

      // assertions
      options: self
        .select_value_list("enum")
        .map(|value| value.cloned().collect()),

      minimum_inclusive: if self.select_bool("exclusiveMinimum").unwrap_or_default() {
        None
      } else {
        self.select_number("minimum").cloned()
      },
      minimum_exclusive: if self.select_bool("exclusiveMinimum").unwrap_or_default() {
        self.select_number("minimum").cloned()
      } else {
        None
      },
      maximum_inclusive: if self.select_bool("exclusiveMaximum").unwrap_or_default() {
        None
      } else {
        self.select_number("maximum").cloned()
      },
      maximum_exclusive: if self.select_bool("exclusiveMaximum").unwrap_or_default() {
        self.select_number("maximum").cloned()
      } else {
        None
      },
      multiple_of: self.select_number("multipleOf").cloned(),
      minimum_length: self.select_unsigned_integer("minLength"),
      maximum_length: self.select_unsigned_integer("maxLength"),
      value_pattern: self.select_string("pattern").map(|value| value.to_owned()),
      value_format: self.select_string("format").map(|value| value.to_owned()),
      minimum_items: self.select_unsigned_integer("minItems"),
      maximum_items: self.select_unsigned_integer("maxItems"),
      unique_items: self.select_bool("uniqueItems"),
      minimum_properties: self.select_unsigned_integer("minProperties"),
      maximum_properties: self.select_unsigned_integer("maxProperties"),
      required: self
        .select_string_list("required")
        .map(|value| value.map(|value| value.to_owned()).collect()),

      reference,

      // sub nodes
      r#if: None,
      then: None,
      r#else: None,
      not: Self::map_entry_location(&location, self.select_node_entry(Default::default(), "not")),
      contains: None,
      array_items: Self::map_entry_location(
        &location,
        None
          .or_else(|| self.select_node_entry(Default::default(), "items"))
          .or_else(|| self.select_node_entry(Default::default(), "additionalItems")),
      ),
      property_names: None,
      map_properties: Self::map_entry_location(
        &location,
        self.select_node_entry(Default::default(), "additionalProperties"),
      ),

      all_of: Self::map_entry_location_list(
        &location,
        self.select_node_entry_list(Default::default(), "allOf"),
      )
      .map(|value| value.collect()),
      any_of: Self::map_entry_location_list(
        &location,
        self.select_node_entry_list(Default::default(), "anyOf"),
      )
      .map(|value| value.collect()),
      one_of: Self::map_entry_location_list(
        &location,
        self.select_node_entry_list(Default::default(), "oneOf"),
      )
      .map(|value| value.collect()),
      tuple_items: Self::map_entry_location_list(
        &location,
        self.select_node_entry_list(Default::default(), "items"),
      )
      .map(|value| value.collect()),

      dependent_schemas: Self::map_entry_location_object(
        &location,
        self.select_node_entry_object(Default::default(), "dependentSchemas"),
      )
      .map(|value| value.collect()),
      object_properties: Self::map_entry_location_object(
        &location,
        self.select_node_entry_object(Default::default(), "properties"),
      )
      .map(|value| value.collect()),
      pattern_properties: Self::map_entry_location_object(
        &location,
        self.select_node_entry_object(Default::default(), "patternProperties"),
      )
      .map(|value| value.collect()),
    }
  }
}

/*
public selectors
*/
impl Node {
  pub fn select_id(&self) -> Option<&str> {
    self.select_string("id")
  }

  pub fn select_reference(&self) -> Option<&str> {
    self.select_string("$ref")
  }
}

/*
sub nodes
*/
impl Node {
  pub fn select_sub_nodes(&self, pointer: &[String]) -> impl Iterator<Item = (Vec<String>, Node)> {
    empty()
      .chain(self.select_not_entry(pointer))
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

  fn select_not_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    self.select_node_entry(pointer, "not")
  }
  fn select_map_properties_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    self.select_node_entry(pointer, "additionalProperties")
  }
  fn select_array_items_entry(&self, pointer: &[String]) -> Option<(Vec<String>, Node)> {
    if let Some(value) = self.select_node_entry(pointer, "items") {
      return Some(value);
    }

    if let Some(value) = self.select_node_entry(pointer, "additionalItems") {
      return Some(value);
    }

    None
  }

  fn select_all_of_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_node_entry_list(pointer, "allOf")
  }
  fn select_any_of_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_node_entry_list(pointer, "anyOf")
  }
  fn select_one_of_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_node_entry_list(pointer, "oneOf")
  }
  fn select_tuple_items_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_node_entry_list(pointer, "items")
  }

  fn select_dependent_schemas_entries(
    &self,
    pointer: &[String],
  ) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_node_entry_object(pointer, "dependentSchemas")
  }
  fn select_object_properties_entries(
    &self,
    pointer: &[String],
  ) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_node_entry_object(pointer, "properties")
  }
  fn select_pattern_properties_entries(
    &self,
    pointer: &[String],
  ) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_node_entry_object(pointer, "patternProperties")
  }
  fn select_definition_entries(&self, pointer: &[String]) -> Option<Vec<(Vec<String>, Node)>> {
    self.select_node_entry_object(pointer, "definitions")
  }
}

/*
helpers
*/
impl Node {
  fn select_value_list(
    &self,
    field: &str,
  ) -> Option<impl Iterator<Item = &serde_json::Value> + '_> {
    Some(self.0.as_object()?.get(field)?.as_array()?.iter())
  }

  fn select_string_list(&self, field: &str) -> Option<impl Iterator<Item = &str> + '_> {
    self
      .0
      .as_object()?
      .get(field)?
      .as_array()
      .map(|value| value.iter().filter_map(|value| value.as_str()))
  }

  fn select_unsigned_integer(&self, field: &str) -> Option<u64> {
    self.0.as_object()?.get(field)?.as_u64()
  }

  fn select_number(&self, field: &str) -> Option<&serde_json::Number> {
    self.0.as_object()?.get(field)?.as_number()
  }

  fn select_bool(&self, field: &str) -> Option<bool> {
    self.0.as_object()?.get(field)?.as_bool()
  }

  fn select_string(&self, field: &str) -> Option<&'_ str> {
    self.0.as_object()?.get(field)?.as_str()
  }

  fn select_node_entry(&self, pointer: &[String], field: &str) -> Option<(Vec<String>, Node)> {
    let selected = self.0.as_object()?.get(field)?;
    let pointer: Vec<_> = pointer
      .iter()
      .cloned()
      .chain(once(field.to_string()))
      .collect();

    let result = (pointer, selected.clone().into());
    Some(result)
  }

  fn select_node_entry_list(
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

  fn select_node_entry_object(
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

/*
more helpers
*/
impl Node {
  fn map_entry_location(
    location: &NodeLocation,
    entry: Option<(Vec<String>, Node)>,
  ) -> Option<NodeLocation> {
    entry.map(|(pointer, _node)| location.push_pointer(pointer.clone()))
  }

  fn map_entry_location_list<'n>(
    location: &'n NodeLocation,
    entries: Option<impl IntoIterator<Item = (Vec<String>, Node)> + 'n>,
  ) -> Option<impl Iterator<Item = NodeLocation> + 'n> {
    entries.map(|value| {
      value
        .into_iter()
        .map(|(pointer, _node)| location.push_pointer(pointer.clone()))
    })
  }

  fn map_entry_location_object<'n>(
    location: &'n NodeLocation,
    entries: Option<impl IntoIterator<Item = (Vec<String>, Node)> + 'n>,
  ) -> Option<impl Iterator<Item = (String, NodeLocation)> + 'n> {
    entries.map(|value| {
      value.into_iter().map(|(pointer, _node)| {
        let sub_location = location.push_pointer(pointer.clone());
        (pointer.last().unwrap().to_owned(), sub_location)
      })
    })
  }
}
