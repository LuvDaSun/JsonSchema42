use crate::{
  models::{DocumentSchemaItem, SchemaType},
  utils::{JsonValue, NodeLocation},
};
use std::iter::{empty, once};

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
      exact: Some(true),

      reference,
      types,

      // meta
      title: self.0.string("title").map(str::to_owned),
      description: self.0.string("description").map(str::to_owned),
      examples: self
        .0
        .value_list("examples")
        .map(|value| value.cloned().collect()),
      deprecated: None,

      // assertions
      options: None
        .or_else(|| {
          self
            .0
            .value("const")
            .map(once)
            .map(|value| value.cloned().collect())
        })
        .or_else(|| {
          self
            .0
            .value_list("enum")
            .map(|value| value.cloned().collect())
        }),

      minimum_inclusive: self.0.number("minimum").cloned(),
      minimum_exclusive: self.0.number("exclusiveMinimum").cloned(),
      maximum_inclusive: self.0.number("maximum").cloned(),
      maximum_exclusive: self.0.number("exclusiveMaximum").cloned(),
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
      array_items: None
        .or_else(|| self.0.node_location(&location, "items"))
        .or_else(|| self.0.node_location(&location, "additionalItems")),
      property_names: self.0.node_location(&location, "propertyNames"),
      contains: self.0.node_location(&location, "contains"),

      all_of: self
        .0
        .node_location_list(&location, "allOf")
        .map(|value| value.collect()),
      any_of: self
        .0
        .node_location_list(&location, "anyOf")
        .map(|value| value.collect()),
      one_of: self
        .0
        .node_location_list(&location, "oneOf")
        .map(|value| value.collect()),
      definitions: self
        .0
        .node_location_object(&location, "definitions")
        .map(|value| value.map(|(_name, location)| location).collect()),
      tuple_items: self
        .0
        .node_location_list(&location, "items")
        .map(|value| value.collect()),

      dependent_schemas: self
        .0
        .node_location_object(&location, "dependentSchemas")
        .map(|value| value.collect()),
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
    self.0.string("$id")
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
          .node_entry_list(pointer, "anyOf")
          .into_iter()
          .flatten(),
      )
      .chain(
        self
          .0
          .node_entry_list(pointer, "oneOf")
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
