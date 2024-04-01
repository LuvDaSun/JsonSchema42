use super::intermediate::IntermediateType;
use crate::utils::{merge::merge_option, url::UrlWithPointer};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::{BTreeSet, HashSet};
use std::{collections::HashMap, iter::empty};

pub type SchemaKey = usize;

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug, Serialize, Deserialize)]
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

#[derive(Clone, PartialEq, Default, Debug, Serialize, Deserialize)]
pub struct SchemaItem {
  pub name: Option<String>,

  pub primary: Option<bool>,
  pub parent: Option<SchemaKey>,
  pub id: Option<UrlWithPointer>,

  // metadata
  pub title: Option<String>,
  pub description: Option<String>,
  pub examples: Option<Vec<Value>>,
  pub deprecated: Option<bool>,

  // types
  pub types: Option<Vec<SchemaType>>,

  // applicators
  pub reference: Option<SchemaKey>,

  pub all_of: Option<BTreeSet<SchemaKey>>,
  pub any_of: Option<BTreeSet<SchemaKey>>,
  pub one_of: Option<BTreeSet<SchemaKey>>,

  pub r#if: Option<SchemaKey>,
  pub then: Option<SchemaKey>,
  pub r#else: Option<SchemaKey>,

  pub not: Option<SchemaKey>,

  pub property_names: Option<SchemaKey>,
  pub map_properties: Option<SchemaKey>,
  pub array_items: Option<SchemaKey>,
  pub contains: Option<SchemaKey>,

  pub tuple_items: Option<Vec<SchemaKey>>,

  pub object_properties: Option<HashMap<String, SchemaKey>>,
  pub pattern_properties: Option<HashMap<String, SchemaKey>>,
  pub dependent_schemas: Option<HashMap<String, SchemaKey>>,

  // assertions
  pub options: Option<Vec<Value>>,
  pub required: Option<HashSet<String>>,

  pub minimum_inclusive: Option<f64>,
  pub minimum_exclusive: Option<f64>,
  pub maximum_inclusive: Option<f64>,
  pub maximum_exclusive: Option<f64>,
  pub multiple_of: Option<f64>,

  pub minimum_length: Option<usize>,
  pub maximum_length: Option<usize>,
  pub value_pattern: Option<String>,
  pub value_format: Option<String>,

  pub minimum_items: Option<usize>,
  pub maximum_items: Option<usize>,
  pub unique_items: Option<bool>,

  pub minimum_properties: Option<usize>,
  pub maximum_properties: Option<usize>,
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

    macro_rules! generate_merge_option {
      ($member: ident, $merger: expr) => {
        merge_option(self.$member.as_ref(), other.$member.as_ref(), $merger)
      };
    }

    macro_rules! generate_merge_single_key {
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

    macro_rules! generate_merge_object_keys {
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

    macro_rules! generate_union_merge {
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
      name: None,
      primary: None,
      parent: None,
      id: None,

      title: None,
      description: None,
      examples: None,
      deprecated: generate_merge_option!(deprecated, &|base, other| base & other),

      types: generate_merge_option!(types, |base, other| vec![base
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

      not: generate_merge_single_key!(not),

      property_names: generate_merge_single_key!(property_names),
      map_properties: generate_merge_single_key!(map_properties),
      array_items: generate_merge_single_key!(array_items),
      contains: generate_merge_single_key!(contains),

      tuple_items: generate_merge_array_keys!(tuple_items),

      object_properties: generate_merge_object_keys!(object_properties),
      pattern_properties: generate_merge_object_keys!(pattern_properties),
      dependent_schemas: generate_merge_object_keys!(dependent_schemas),

      options: None, // TODO
      required: generate_union_merge!(required),

      minimum_inclusive: generate_merge_option!(minimum_inclusive, |base, other| base.min(*other)),
      minimum_exclusive: generate_merge_option!(minimum_exclusive, |base, other| base.min(*other)),
      maximum_inclusive: generate_merge_option!(maximum_inclusive, |base, other| base.max(*other)),
      maximum_exclusive: generate_merge_option!(maximum_exclusive, |base, other| base.max(*other)),
      multiple_of: None, // TODO

      minimum_length: generate_merge_option!(minimum_length, |base, other| *base.min(other)),
      maximum_length: generate_merge_option!(maximum_length, |base, other| *base.max(other)),
      value_pattern: None, // TODO
      value_format: None,  // TODO

      minimum_items: generate_merge_option!(minimum_items, |base, other| *base.min(other)),
      maximum_items: generate_merge_option!(maximum_items, |base, other| *base.max(other)),
      unique_items: generate_merge_option!(unique_items, |base, other| base | other),

      minimum_properties: generate_merge_option!(minimum_properties, |base, other| *base
        .min(other)),
      maximum_properties: generate_merge_option!(maximum_properties, |base, other| *base
        .max(other)),
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
}

#[no_mangle]
extern "C" fn schema_item_new() -> *const SchemaItem {
  let schema_item = SchemaItem::default();
  let schema_item = Box::new(schema_item);
  Box::into_raw(schema_item)
}

#[no_mangle]
extern "C" fn schema_item_drop(schema_item: *mut SchemaItem) {
  assert!(!schema_item.is_null());

  unsafe {
    let _ = Box::from_raw(schema_item);
  }
}
