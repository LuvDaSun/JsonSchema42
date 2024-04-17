use super::intermediate::IntermediateType;
use crate::utils::merge::merge_option;
use crate::utils::node_location::NodeLocation;
use std::collections::{BTreeSet, HashSet};
use std::{collections::HashMap, iter::empty};

pub type SchemaKey = usize;

#[derive(
  Clone, Copy, Hash, PartialEq, Eq, PartialOrd, Ord, Debug, serde::Serialize, serde::Deserialize,
)]
#[serde(rename_all = "camelCase")]
pub enum SchemaType {
  Never,
  Any,
  Null,
  Boolean,
  Integer,
  Number,
  String,
  Array,
  Object,
}

impl SchemaType {
  pub fn intersection(&self, other: &Self) -> Self {
    if self == other {
      return *self;
    }

    if self == &Self::Any {
      return *other;
    }

    if other == &Self::Any {
      return *self;
    }

    if self == &Self::Never {
      return *self;
    }

    if other == &Self::Never {
      return *other;
    }

    SchemaType::Never
  }
}

impl ToString for SchemaType {
  fn to_string(&self) -> String {
    match self {
      Self::Never => "never".to_string(),
      Self::Any => "any".to_string(),
      Self::Null => "null".to_string(),
      Self::Boolean => "boolean".to_string(),
      Self::Integer => "integer".to_string(),
      Self::Number => "number".to_string(),
      Self::String => "string".to_string(),
      Self::Array => "array".to_string(),
      Self::Object => "object".to_string(),
    }
  }
}

impl From<&IntermediateType> for SchemaType {
  fn from(value: &IntermediateType) -> Self {
    match value {
      IntermediateType::Never => Self::Never,
      IntermediateType::Any => Self::Any,
      IntermediateType::Null => Self::Null,
      IntermediateType::Boolean => Self::Boolean,
      IntermediateType::Integer => Self::Integer,
      IntermediateType::Number => Self::Number,
      IntermediateType::String => Self::String,
      IntermediateType::Array => Self::Array,
      IntermediateType::Object => Self::Object,
    }
  }
}

#[derive(Clone, PartialEq, Default, Debug, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SchemaItem {
  #[serde(default)]
  pub name: Option<String>,
  #[serde(default)]
  pub exact: Option<bool>,

  #[serde(default)]
  pub primary: Option<bool>,
  #[serde(default)]
  pub parent: Option<SchemaKey>,
  #[serde(default)]
  pub id: Option<NodeLocation>,

  // metadata
  #[serde(default)]
  pub title: Option<String>,
  #[serde(default)]
  pub description: Option<String>,
  #[serde(default)]
  pub examples: Option<Vec<serde_json::Value>>,
  #[serde(default)]
  pub deprecated: Option<bool>,

  // types
  #[serde(default)]
  pub types: Option<Vec<SchemaType>>,

  // applicators
  #[serde(default)]
  pub reference: Option<SchemaKey>,

  #[serde(default)]
  pub r#if: Option<SchemaKey>,
  #[serde(default)]
  pub then: Option<SchemaKey>,
  #[serde(default)]
  pub r#else: Option<SchemaKey>,

  #[serde(default)]
  pub not: Option<SchemaKey>,

  #[serde(default)]
  pub property_names: Option<SchemaKey>,
  #[serde(default)]
  pub map_properties: Option<SchemaKey>,
  #[serde(default)]
  pub array_items: Option<SchemaKey>,
  #[serde(default)]
  pub contains: Option<SchemaKey>,

  #[serde(default)]
  pub all_of: Option<BTreeSet<SchemaKey>>,
  #[serde(default)]
  pub any_of: Option<BTreeSet<SchemaKey>>,
  #[serde(default)]
  pub one_of: Option<BTreeSet<SchemaKey>>,
  #[serde(default)]
  pub tuple_items: Option<Vec<SchemaKey>>,

  #[serde(default)]
  pub object_properties: Option<HashMap<String, SchemaKey>>,
  #[serde(default)]
  pub pattern_properties: Option<HashMap<String, SchemaKey>>,
  #[serde(default)]
  pub dependent_schemas: Option<HashMap<String, SchemaKey>>,

  // assertions
  #[serde(default)]
  pub options: Option<Vec<serde_json::Value>>,
  #[serde(default)]
  pub required: Option<HashSet<String>>,

  #[serde(default)]
  pub minimum_inclusive: Option<serde_json::Number>,
  #[serde(default)]
  pub minimum_exclusive: Option<serde_json::Number>,
  #[serde(default)]
  pub maximum_inclusive: Option<serde_json::Number>,
  #[serde(default)]
  pub maximum_exclusive: Option<serde_json::Number>,
  #[serde(default)]
  pub multiple_of: Option<serde_json::Number>,

  #[serde(default)]
  pub minimum_length: Option<u64>,
  #[serde(default)]
  pub maximum_length: Option<u64>,
  #[serde(default)]
  pub value_pattern: Option<Vec<String>>,
  #[serde(default)]
  pub value_format: Option<Vec<String>>,

  #[serde(default)]
  pub minimum_items: Option<u64>,
  #[serde(default)]
  pub maximum_items: Option<u64>,
  #[serde(default)]
  pub unique_items: Option<bool>,

  #[serde(default)]
  pub minimum_properties: Option<u64>,
  #[serde(default)]
  pub maximum_properties: Option<u64>,
}

impl SchemaItem {
  pub fn intersection<'f>(
    &'f self,
    other: &'f Self,
    merge_key: &impl Fn(&'f SchemaKey, &'f SchemaKey) -> SchemaKey,
  ) -> Self {
    assert!(
      self
        .types
        .as_ref()
        .map(|value| value.len())
        .unwrap_or_default()
        <= 1
    );
    assert!(
      other
        .types
        .as_ref()
        .map(|value| value.len())
        .unwrap_or_default()
        <= 1
    );

    assert_eq!(self.all_of, None);
    assert_eq!(other.all_of, None);

    assert_eq!(self.any_of, None);
    assert_eq!(other.any_of, None);

    assert_eq!(self.one_of, None);
    assert_eq!(other.one_of, None);

    assert_eq!(self.r#if, None);
    assert_eq!(other.r#if, None);

    assert_eq!(self.then, None);
    assert_eq!(other.then, None);

    assert_eq!(self.r#else, None);
    assert_eq!(other.r#else, None);

    macro_rules! merge_option {
      ($member: ident, $merger: expr) => {
        merge_option(self.$member.as_ref(), other.$member.as_ref(), $merger)
      };
    }

    macro_rules! merge_single_key {
      ($member: ident) => {
        merge_option(self.$member.as_ref(), other.$member.as_ref(), merge_key)
      };
    }

    macro_rules! generate_merge_array_keys {
      ($member: ident) => {{
        merge_option(
          self.$member.as_ref(),
          other.$member.as_ref(),
          |base, other| {
            let length = base.len().max(other.len());
            (0..length)
              .map(|index| merge_option(base.get(index), other.get(index), merge_key))
              .map(|key| key.unwrap())
              .collect()
          },
        )
      }};
    }

    macro_rules! merge_object_keys {
      ($member: ident) => {{
        merge_option(
          self.$member.as_ref(),
          other.$member.as_ref(),
          |base, other| {
            let properties: HashSet<_> = empty().chain(base.keys()).chain(other.keys()).collect();
            properties
              .into_iter()
              .map(|property| {
                (
                  property,
                  merge_option(base.get(property), other.get(property), merge_key),
                )
              })
              .map(|(property, key)| (property.clone(), key.unwrap()))
              .collect()
          },
        )
      }};
    }

    macro_rules! union_merge {
      ($member: ident) => {{
        merge_option(
          self.$member.as_ref(),
          other.$member.as_ref(),
          |base, other| {
            empty()
              .chain(base.iter())
              .chain(other.iter())
              .cloned()
              .collect()
          },
        )
      }};
    }

    Self {
      name: self.name.clone(),
      exact: merge_option!(exact, &|base, other| base & other),
      primary: self.primary,
      parent: self.parent,
      id: self.id.clone(),

      title: self.title.clone(),
      description: self.description.clone(),
      examples: self.examples.clone(),
      deprecated: merge_option!(deprecated, &|base, other| base | other),

      types: merge_option!(types, |base, other| vec![base
        .first()
        .unwrap()
        .intersection(other.first().unwrap())]),

      reference: None, // TODO

      all_of: None,
      any_of: None,
      one_of: None,

      r#if: None,
      then: None,
      r#else: None,

      not: merge_single_key!(not),

      property_names: merge_single_key!(property_names),
      map_properties: merge_single_key!(map_properties),
      array_items: merge_single_key!(array_items),
      contains: merge_single_key!(contains),

      tuple_items: generate_merge_array_keys!(tuple_items),

      object_properties: merge_object_keys!(object_properties),
      pattern_properties: merge_object_keys!(pattern_properties),
      dependent_schemas: merge_object_keys!(dependent_schemas),

      options: union_merge!(options), // TODO
      required: union_merge!(required),

      minimum_inclusive: None, // merge_option!(minimum_inclusive, |base, other| base.min(*other)),
      minimum_exclusive: None, // merge_option!(minimum_exclusive, |base, other| base.min(*other)),
      maximum_inclusive: None, // merge_option!(maximum_inclusive, |base, other| base.max(*other)),
      maximum_exclusive: None, // merge_option!(maximum_exclusive, |base, other| base.max(*other)),
      multiple_of: None,       // TODO

      minimum_length: merge_option!(minimum_length, |base, other| *base.min(other)),
      maximum_length: merge_option!(maximum_length, |base, other| *base.max(other)),
      value_pattern: None, // TODO
      value_format: None,  // TODO

      minimum_items: merge_option!(minimum_items, |base, other| *base.min(other)),
      maximum_items: merge_option!(maximum_items, |base, other| *base.max(other)),
      unique_items: merge_option!(unique_items, |base, other| base | other),

      minimum_properties: merge_option!(minimum_properties, |base, other| *base.min(other)),
      maximum_properties: merge_option!(maximum_properties, |base, other| *base.max(other)),
    }
  }

  pub fn get_children(&self) -> impl Iterator<Item = SchemaKey> + '_ {
    empty()
      .chain(self.reference)
      .chain(self.r#if)
      .chain(self.then)
      .chain(self.r#else)
      .chain(self.not)
      .chain(self.map_properties)
      .chain(self.array_items)
      .chain(self.property_names)
      .chain(self.contains)
      .chain(self.tuple_items.iter().flat_map(|v| v.iter().copied()))
      .chain(self.all_of.iter().flat_map(|v| v.iter().copied()))
      .chain(self.any_of.iter().flat_map(|v| v.iter().copied()))
      .chain(self.one_of.iter().flat_map(|v| v.iter().copied()))
      .chain(
        self
          .object_properties
          .iter()
          .flat_map(|v| v.values())
          .copied(),
      )
      .chain(
        self
          .pattern_properties
          .iter()
          .flat_map(|v| v.values())
          .copied(),
      )
      .chain(
        self
          .dependent_schemas
          .iter()
          .flat_map(|v| v.values())
          .copied(),
      )
  }

  pub fn get_alias_key(&self) -> Option<SchemaKey> {
    let is_alias_maybe = self.types.is_none()
      && self.all_of.is_none()
      && self.any_of.is_none()
      && self.one_of.is_none()
      && self.r#if.is_none()
      && self.then.is_none()
      && self.r#else.is_none()
      && self.not.is_none()
      && self.property_names.is_none()
      && self.map_properties.is_none()
      && self.array_items.is_none()
      && self.contains.is_none()
      && self.tuple_items.is_none()
      && self.object_properties.is_none()
      && self.pattern_properties.is_none()
      && self.dependent_schemas.is_none()
      && self.options.is_none()
      && self.required.is_none()
      && self.minimum_inclusive.is_none()
      && self.minimum_exclusive.is_none()
      && self.maximum_inclusive.is_none()
      && self.maximum_exclusive.is_none()
      && self.multiple_of.is_none()
      && self.minimum_length.is_none()
      && self.maximum_length.is_none()
      && self.value_pattern.is_none()
      && self.value_format.is_none()
      && self.minimum_items.is_none()
      && self.maximum_items.is_none()
      && self.unique_items.is_none()
      && self.minimum_properties.is_none()
      && self.maximum_properties.is_none();

    if is_alias_maybe {
      self.reference
    } else {
      None
    }
  }
}
