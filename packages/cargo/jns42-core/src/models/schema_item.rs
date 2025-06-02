use super::SchemaType;
use crate::utilities::NodeLocation;
use crate::utilities::{merge_either, merge_option};
use std::collections::BTreeSet;
use std::fmt::Debug;
use std::iter;
use std::{collections::BTreeMap, iter::empty};

#[cfg(target_arch = "wasm32")]
use crate::exports;

pub type DocumentSchemaItem = SchemaItem<NodeLocation>;
pub type ArenaSchemaItem = SchemaItem<usize>;

#[derive(Clone, PartialEq, Default, Debug, serde::Serialize, serde::Deserialize)]
pub struct SchemaItem<K>
where
  K: Ord,
{
  pub name: Option<Vec<String>>,
  pub exact: Option<bool>,

  pub location: Option<NodeLocation>,

  // metadata
  pub title: Option<String>,
  pub description: Option<String>,
  pub examples: Option<Vec<serde_json::Value>>,
  pub deprecated: Option<bool>,

  // types
  pub types: Option<Vec<SchemaType>>,

  // applicators
  pub reference: Option<K>,

  pub r#if: Option<K>,
  pub then: Option<K>,
  pub r#else: Option<K>,

  pub not: Option<K>,

  pub property_names: Option<K>,
  pub map_properties: Option<K>,
  pub array_items: Option<K>,
  pub contains: Option<K>,

  pub all_of: Option<BTreeSet<K>>,
  pub any_of: Option<BTreeSet<K>>,
  pub one_of: Option<BTreeSet<K>>,
  pub tuple_items: Option<Vec<K>>,

  pub object_properties: Option<BTreeMap<String, K>>,
  pub pattern_properties: Option<BTreeMap<String, K>>,
  pub dependent_schemas: Option<BTreeMap<String, K>>,

  pub definitions: Option<BTreeSet<K>>,

  // assertions
  pub options: Option<Vec<serde_json::Value>>,
  pub required: Option<BTreeSet<String>>,

  pub minimum_inclusive: Option<serde_json::Number>,
  pub minimum_exclusive: Option<serde_json::Number>,
  pub maximum_inclusive: Option<serde_json::Number>,
  pub maximum_exclusive: Option<serde_json::Number>,
  pub multiple_of: Option<serde_json::Number>,

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

impl<K> SchemaItem<K>
where
  K: Ord + Clone + Debug,
{
  pub fn intersection<'f>(
    &'f self,
    other: &'f Self,
    merge_key: &impl Fn(&'f K, &'f K) -> K,
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

    assert_eq!(self.reference, None);
    assert_eq!(other.reference, None);

    assert_eq!(self.r#if, None);
    assert_eq!(other.r#if, None);

    assert_eq!(self.then, None);
    assert_eq!(other.then, None);

    assert_eq!(self.r#else, None);
    assert_eq!(other.r#else, None);

    assert_eq!(self.all_of, None);
    assert_eq!(other.all_of, None);

    assert_eq!(self.any_of, None);
    assert_eq!(other.any_of, None);

    assert_eq!(self.one_of, None);
    assert_eq!(other.one_of, None);

    macro_rules! merge_either {
      ($member: ident) => {
        merge_either(self.$member.as_ref(), other.$member.as_ref())
      };
    }

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
            let properties: BTreeSet<_> = empty().chain(base.keys()).chain(other.keys()).collect();
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

    let exact_merge = if (self.minimum_inclusive.is_none() || other.minimum_inclusive.is_none())
      && (self.minimum_exclusive.is_none() || other.minimum_exclusive.is_none())
      && (self.maximum_inclusive.is_none() || other.maximum_inclusive.is_none())
      && (self.maximum_exclusive.is_none() || other.maximum_exclusive.is_none())
      && (self.multiple_of.is_none() || other.multiple_of.is_none())
      && (self.value_pattern.is_none() || other.value_pattern.is_none())
      && (self.value_format.is_none() || other.value_format.is_none())
    {
      None
    } else {
      Some(true)
    };

    let exact = merge_option!(exact, &|base, other| base & other);
    let exact = merge_option(exact.as_ref(), exact_merge.as_ref(), |base, other| {
      base & other
    });

    Self {
      name: self.name.clone(),
      exact,
      location: self.location.clone(),

      title: self.title.clone(),
      description: self.description.clone(),
      examples: self.examples.clone(),
      deprecated: merge_option!(deprecated, &|base, other| base | other),

      types: merge_option!(types, |base, other| vec![
        base.first().unwrap().intersection(other.first().unwrap())
      ]),

      reference: None,

      all_of: None,
      any_of: None,
      one_of: None,
      definitions: merge_option!(definitions, |base, other| iter::empty()
        .chain(base)
        .chain(other)
        .cloned()
        .collect()),

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

      minimum_inclusive: merge_either!(minimum_inclusive), // merge_option!(minimum_inclusive, |base, other| base.min(*other)),
      minimum_exclusive: merge_either!(minimum_exclusive), // merge_option!(minimum_exclusive, |base, other| base.min(*other)),
      maximum_inclusive: merge_either!(maximum_inclusive), // merge_option!(maximum_inclusive, |base, other| base.max(*other)),
      maximum_exclusive: merge_either!(maximum_exclusive), // merge_option!(maximum_exclusive, |base, other| base.max(*other)),
      multiple_of: merge_either!(multiple_of),             // TODO

      minimum_length: merge_option!(minimum_length, |base, other| *base.min(other)),
      maximum_length: merge_option!(maximum_length, |base, other| *base.max(other)),
      value_pattern: merge_either!(value_pattern),
      value_format: merge_either!(value_format),

      minimum_items: merge_option!(minimum_items, |base, other| *base.min(other)),
      maximum_items: merge_option!(maximum_items, |base, other| *base.max(other)),
      unique_items: merge_option!(unique_items, |base, other| base | other),

      minimum_properties: merge_option!(minimum_properties, |base, other| *base.min(other)),
      maximum_properties: merge_option!(maximum_properties, |base, other| *base.max(other)),
    }
  }
}

impl<K> SchemaItem<K>
where
  K: Ord + Copy,
{
  pub fn get_alias_key(&self) -> Option<K> {
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

    if is_alias_maybe { self.reference } else { None }
  }

  pub fn get_dependencies(&self) -> impl Iterator<Item = K> + '_ {
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
      .chain(self.definitions.iter().flat_map(|v| v.iter().copied()))
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

impl<K> SchemaItem<K>
where
  K: Ord,
{
  pub fn map_keys<K1>(&self, map_key: impl Fn(&K) -> K1) -> SchemaItem<K1>
  where
    K1: Ord,
  {
    let map_single = |value: &Option<K>| value.as_ref().map(&map_key);
    let map_vec = |value: &Option<Vec<K>>| {
      value
        .as_ref()
        .map(|value| value.iter().map(&map_key).collect::<Vec<K1>>())
    };
    let map_set = |value: &Option<BTreeSet<K>>| {
      value
        .as_ref()
        .map(|value| value.iter().map(&map_key).collect::<BTreeSet<K1>>())
    };
    let map_map = |value: &Option<BTreeMap<String, K>>| {
      value.as_ref().map(|value| {
        value
          .iter()
          .map(|(key, value)| (key.clone(), map_key(value)))
          .collect::<BTreeMap<String, K1>>()
      })
    };

    SchemaItem {
      name: self.name.clone(),
      exact: self.exact,
      types: self.types.clone(),

      location: self.location.clone(),
      title: self.title.clone(),
      description: self.description.clone(),
      examples: self.examples.clone(),
      deprecated: self.deprecated,

      options: self.options.clone(),

      minimum_inclusive: self.minimum_inclusive.clone(),
      minimum_exclusive: self.minimum_exclusive.clone(),
      maximum_inclusive: self.maximum_inclusive.clone(),
      maximum_exclusive: self.maximum_exclusive.clone(),
      multiple_of: self.multiple_of.clone(),

      minimum_length: self.minimum_length,
      maximum_length: self.maximum_length,
      value_pattern: self.value_pattern.clone(),
      value_format: self.value_format.clone(),

      maximum_items: self.maximum_items,
      minimum_items: self.minimum_items,
      unique_items: self.unique_items,

      minimum_properties: self.minimum_properties,
      maximum_properties: self.maximum_properties,
      required: self.required.clone(),

      reference: map_single(&self.reference),

      contains: map_single(&self.contains),
      property_names: map_single(&self.property_names),
      map_properties: map_single(&self.map_properties),
      array_items: map_single(&self.array_items),
      r#if: map_single(&self.r#if),
      then: map_single(&self.then),
      r#else: map_single(&self.r#else),
      not: map_single(&self.not),

      tuple_items: map_vec(&self.tuple_items),
      all_of: map_set(&self.all_of),
      any_of: map_set(&self.any_of),
      one_of: map_set(&self.one_of),
      definitions: map_set(&self.definitions),

      dependent_schemas: map_map(&self.dependent_schemas),
      object_properties: map_map(&self.object_properties),
      pattern_properties: map_map(&self.pattern_properties),
    }
  }
}

#[cfg(target_arch = "wasm32")]
impl From<ArenaSchemaItem> for exports::jns42::core::models::ArenaSchemaItem {
  fn from(value: ArenaSchemaItem) -> Self {
    Self {
      name: value.name,
      exact: value.exact,

      location: value.location.map(Into::into),

      // metadata
      title: value.title,
      description: value.description,
      examples: Default::default(), //value.examples.map(Into::into),
      deprecated: value.deprecated,

      // types
      types: value
        .types
        .map(|value| value.into_iter().map(Into::into).collect()),

      // applicators
      reference: value.reference.map(|value| value as u32),

      if_: value.r#if.map(|value| value as u32),
      then: value.then.map(|value| value as u32),
      else_: value.r#else.map(|value| value as u32),

      not: value.not.map(|value| value as u32),

      property_names: value.property_names.map(|value| value as u32),
      map_properties: value.map_properties.map(|value| value as u32),
      array_items: value.array_items.map(|value| value as u32),
      contains: value.contains.map(|value| value as u32),

      all_of: value
        .all_of
        .map(|value| value.into_iter().map(|value| value as u32).collect()),
      any_of: value
        .any_of
        .map(|value| value.into_iter().map(|value| value as u32).collect()),
      one_of: value
        .one_of
        .map(|value| value.into_iter().map(|value| value as u32).collect()),
      tuple_items: value
        .tuple_items
        .map(|value| value.into_iter().map(|value| value as u32).collect()),

      object_properties: value.object_properties.map(|value| {
        value
          .into_iter()
          .map(|(key, value)| (key, value as u32))
          .collect()
      }),
      pattern_properties: value.pattern_properties.map(|value| {
        value
          .into_iter()
          .map(|(key, value)| (key, value as u32))
          .collect()
      }),
      dependent_schemas: value.dependent_schemas.map(|value| {
        value
          .into_iter()
          .map(|(key, value)| (key, value as u32))
          .collect()
      }),

      definitions: value
        .definitions
        .map(|value| value.into_iter().map(|value| value as u32).collect()),

      // assertions
      options: Default::default(), // value.options,
      required: value.required.map(|value| value.into_iter().collect()),

      minimum_inclusive: value.minimum_inclusive.and_then(|value| value.as_f64()),
      minimum_exclusive: value.minimum_exclusive.and_then(|value| value.as_f64()),
      maximum_inclusive: value.maximum_inclusive.and_then(|value| value.as_f64()),
      maximum_exclusive: value.maximum_exclusive.and_then(|value| value.as_f64()),
      multiple_of: value.multiple_of.and_then(|value| value.as_f64()),

      minimum_length: value.minimum_length.map(|value| value as u32),
      maximum_length: value.maximum_length.map(|value| value as u32),
      value_pattern: value.value_pattern,
      value_format: value.value_format,

      minimum_items: value.minimum_items.map(|value| value as u32),
      maximum_items: value.maximum_items.map(|value| value as u32),
      unique_items: value.unique_items,

      minimum_properties: value.minimum_properties.map(|value| value as u32),
      maximum_properties: value.maximum_properties.map(|value| value as u32),
    }
  }
}
