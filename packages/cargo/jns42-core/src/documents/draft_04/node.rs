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
      not: self.select_node_location(&location, "not"),
      contains: None,
      array_items: None
        .or_else(|| self.select_node_location(&location, "items"))
        .or_else(|| self.select_node_location(&location, "additionalItems")),

      property_names: None,
      map_properties: self.select_node_location(&location, "additionalProperties"),

      all_of: self
        .select_node_location_list(&location, "allOf")
        .map(|value| value.collect()),
      any_of: self
        .select_node_location_list(&location, "anyOf")
        .map(|value| value.collect()),
      one_of: self
        .select_node_location_list(&location, "oneOf")
        .map(|value| value.collect()),
      tuple_items: self
        .select_node_location_list(&location, "items")
        .map(|value| value.collect()),

      dependent_schemas: self
        .select_node_location_object(&location, "dependentSchemas")
        .map(|value| value.collect()),
      object_properties: self
        .select_node_location_object(&location, "properties")
        .map(|value| value.collect()),
      pattern_properties: self
        .select_node_location_object(&location, "patternProperties")
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

  pub fn select_sub_nodes(
    &self,
    pointer: &[String],
  ) -> impl Iterator<Item = (Vec<String>, Node)> + '_ {
    empty()
      .chain(self.select_node_entry(pointer, "not"))
      .chain(self.select_node_entry(pointer, "additionalProperties"))
      .chain(self.select_node_entry(pointer, "items"))
      .chain(self.select_node_entry(pointer, "additionalItems"))
      .chain(
        self
          .select_node_entry_list(pointer, "allOf")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .select_node_entry_list(pointer, "anyOf")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .select_node_entry_list(pointer, "oneOf")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .select_node_entry_list(pointer, "items")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .select_node_entry_object(pointer, "dependentSchemas")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .select_node_entry_object(pointer, "properties")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .select_node_entry_object(pointer, "patternProperties")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .select_node_entry_object(pointer, "definitions")
          .into_iter()
          .flatten(),
      )
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
  ) -> Option<impl Iterator<Item = (Vec<String>, Node)> + '_> {
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
      .map(move |(key, sub_node)| {
        (
          pointer
            .iter()
            .cloned()
            .chain(once(key.to_string()))
            .collect(),
          sub_node.clone().into(),
        )
      });

    Some(result)
  }

  fn select_node_entry_object(
    &self,
    pointer: &[String],
    field: &str,
  ) -> Option<impl Iterator<Item = (Vec<String>, Node)> + '_> {
    let selected = self.0.as_object()?.get(field)?;
    let pointer: Vec<_> = pointer
      .iter()
      .cloned()
      .map(|part| part.to_string())
      .chain(once(field.to_string()))
      .collect();

    let result = selected.as_object()?.iter().map(move |(key, sub_node)| {
      (
        pointer
          .iter()
          .cloned()
          .chain(once(key.to_string()))
          .collect(),
        sub_node.clone().into(),
      )
    });

    Some(result)
  }

  fn select_node_location(&self, location: &NodeLocation, field: &str) -> Option<NodeLocation> {
    self
      .select_node_entry(Default::default(), field)
      .map(|(pointer, _node)| location.push_pointer(pointer.clone()))
  }

  fn select_node_location_list<'n>(
    &'n self,
    location: &'n NodeLocation,
    field: &str,
  ) -> Option<impl Iterator<Item = NodeLocation> + 'n> {
    self
      .select_node_entry_list(Default::default(), field)
      .map(|value| {
        value
          .into_iter()
          .map(|(pointer, _node)| location.push_pointer(pointer.clone()))
      })
  }

  fn select_node_location_object<'n>(
    &'n self,
    location: &'n NodeLocation,
    field: &str,
  ) -> Option<impl Iterator<Item = (String, NodeLocation)> + 'n> {
    self
      .select_node_entry_object(Default::default(), field)
      .map(|value| {
        value.into_iter().map(|(pointer, _node)| {
          let sub_location = location.push_pointer(pointer.clone());
          (pointer.last().unwrap().to_owned(), sub_location)
        })
      })
  }
}
