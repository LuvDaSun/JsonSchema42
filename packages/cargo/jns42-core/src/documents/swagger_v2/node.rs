use crate::{
  models::{DocumentSchemaItem, SchemaType},
  utils::{JsonValue, NodeLocation},
};
use std::iter::empty;

#[derive(Clone, Debug)]
pub struct Node(JsonValue);

impl From<serde_json::Value> for Node {
  fn from(value: serde_json::Value) -> Self {
    Self(value.into())
  }
}

impl From<JsonValue> for Node {
  fn from(value: JsonValue) -> Self {
    Self(value)
  }
}

impl Node {
  pub fn to_document_schema_item(&self, location: NodeLocation) -> DocumentSchemaItem {
    let types = if let Some(value) = self.0.as_bool() {
      if value {
        Some(vec![SchemaType::Any])
      } else {
        Some(vec![SchemaType::Never])
      }
    } else if let Some(value) = self.0.string("type") {
      Some(vec![(value).parse().unwrap()])
    } else {
      self
        .0
        .string_list("type")
        .map(|value| value.map(|value| value.parse().unwrap()).collect())
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

      reference,
      types,

      // meta
      title: self.0.string("title").map(str::to_owned),
      description: self.0.string("description").map(str::to_owned),
      examples: None,
      deprecated: None,

      // assertions
      options: self
        .0
        .value_list("enum")
        .map(|value| value.cloned().collect()),

      minimum_inclusive: if self.0.bool("exclusiveMinimum").unwrap_or_default() {
        None
      } else {
        self.0.number("minimum").cloned()
      },
      minimum_exclusive: if self.0.bool("exclusiveMinimum").unwrap_or_default() {
        self.0.number("minimum").cloned()
      } else {
        None
      },
      maximum_inclusive: if self.0.bool("exclusiveMaximum").unwrap_or_default() {
        None
      } else {
        self.0.number("maximum").cloned()
      },
      maximum_exclusive: if self.0.bool("exclusiveMaximum").unwrap_or_default() {
        self.0.number("maximum").cloned()
      } else {
        None
      },
      multiple_of: self.0.number("multipleOf").cloned(),
      minimum_length: self.0.unsigned_integer("minLength"),
      maximum_length: self.0.unsigned_integer("maxLength"),
      value_pattern: self.0.string("pattern").map(str::to_owned),
      value_format: self.0.string("format").map(str::to_owned),
      minimum_items: self.0.unsigned_integer("minItems"),
      maximum_items: self.0.unsigned_integer("maxItems"),
      unique_items: self.0.bool("uniqueItems"),
      minimum_properties: self.0.unsigned_integer("minProperties"),
      maximum_properties: self.0.unsigned_integer("maxProperties"),
      required: self
        .0
        .string_list("required")
        .map(|value| value.map(str::to_owned).collect()),

      r#if: None,
      then: None,
      r#else: None,
      not: self.0.node_location(&location, "not"),
      map_properties: self.0.node_location(&location, "additionalProperties"),
      array_items: self.0.node_location(&location, "items"),
      property_names: None,
      contains: None,

      all_of: self
        .0
        .node_location_list(&location, "allOf")
        .map(|value| value.collect()),
      any_of: None,
      one_of: None,
      tuple_items: self
        .0
        .node_location_list(&location, "items")
        .map(|value| value.collect()),

      dependent_schemas: None,
      object_properties: self
        .0
        .node_location_object(&location, "properties")
        .map(|value| value.collect()),
      pattern_properties: self
        .0
        .node_location_object(&location, "patternProperties")
        .map(|value| value.collect()),
    }
  }
}

/*
public selectors
*/
impl Node {
  pub fn select_id(&self) -> Option<&str> {
    self.0.string("id")
  }

  pub fn select_reference(&self) -> Option<&str> {
    self.0.string("$ref")
  }

  pub fn select_sub_nodes(
    &self,
    pointer: &[String],
  ) -> impl Iterator<Item = (Vec<String>, Node)> + '_ {
    empty()
      .chain(self.0.node_entry(pointer, "not"))
      .chain(self.0.node_entry(pointer, "additionalProperties"))
      .chain(self.0.node_entry(pointer, "items"))
      .chain(self.0.node_entry(pointer, "additionalItems"))
      .chain(
        self
          .0
          .node_entry_list(pointer, "allOf")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .0
          .node_entry_list(pointer, "items")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .0
          .node_entry_object(pointer, "dependentSchemas")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .0
          .node_entry_object(pointer, "properties")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .0
          .node_entry_object(pointer, "patternProperties")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .0
          .node_entry_object(pointer, "definitions")
          .into_iter()
          .flatten(),
      )
      .map(|(pointer, value)| (pointer, value.into()))
  }
}
