use super::SchemaType;
use crate::utilities::NodeLocation;
use crate::utilities::{merge_either, merge_option};
use gloo::utils::format::JsValueSerdeExt;
use std::collections::BTreeSet;
use std::fmt::Debug;
use std::iter;
use std::{collections::BTreeMap, iter::empty};
use wasm_bindgen::prelude::*;

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

  pub minimum_inclusive: Option<f64>,
  pub minimum_exclusive: Option<f64>,
  pub maximum_inclusive: Option<f64>,
  pub maximum_exclusive: Option<f64>,
  pub multiple_of: Option<f64>,

  pub minimum_length: Option<u32>,
  pub maximum_length: Option<u32>,
  pub value_pattern: Option<String>,
  pub value_format: Option<String>,

  pub minimum_items: Option<u32>,
  pub maximum_items: Option<u32>,
  pub unique_items: Option<bool>,

  pub minimum_properties: Option<u32>,
  pub maximum_properties: Option<u32>,
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

    let exact_merge = if (self.multiple_of.is_none() || other.multiple_of.is_none())
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

      minimum_inclusive: merge_option!(minimum_inclusive, |base, other| base.min(*other)),
      minimum_exclusive: merge_option!(minimum_exclusive, |base, other| base.min(*other)),
      maximum_inclusive: merge_option!(maximum_inclusive, |base, other| base.max(*other)),
      maximum_exclusive: merge_option!(maximum_exclusive, |base, other| base.max(*other)),
      multiple_of: merge_either!(multiple_of), // TODO

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

      minimum_inclusive: self.minimum_inclusive,
      minimum_exclusive: self.minimum_exclusive,
      maximum_inclusive: self.maximum_inclusive,
      maximum_exclusive: self.maximum_exclusive,
      multiple_of: self.multiple_of,

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

#[wasm_bindgen]
pub struct ArenaSchemaItemContainer(ArenaSchemaItem);

#[wasm_bindgen]
impl ArenaSchemaItemContainer {
  #[wasm_bindgen(getter = name)]
  pub fn name_get(&self) -> Option<Vec<String>> {
    Some(self.0.name.as_ref()?.clone())
  }
  #[wasm_bindgen(getter = exact)]
  pub fn exact_get(&self) -> Option<bool> {
    self.0.exact
  }

  #[wasm_bindgen(getter = location)]
  pub fn location_get(&self) -> Option<String> {
    Some(self.0.location.as_ref()?.to_string())
  }

  // metadata
  #[wasm_bindgen(getter = title)]
  pub fn title_get(&self) -> Option<String> {
    Some(self.0.title.as_ref()?.clone())
  }
  #[wasm_bindgen(getter = description)]
  pub fn description_get(&self) -> Option<String> {
    Some(self.0.description.as_ref()?.clone())
  }
  #[wasm_bindgen(getter = examples)]
  pub fn examples_get(&self) -> Option<Vec<JsValue>> {
    Some(
      self
        .0
        .examples
        .as_ref()?
        .iter()
        .filter_map(|value| JsValue::from_serde(value).ok())
        .collect(),
    )
  }
  #[wasm_bindgen(getter = deprecated)]
  pub fn deprecated_get(&self) -> Option<bool> {
    self.0.deprecated
  }

  // types
  #[wasm_bindgen(getter = types)]
  pub fn types_get(&self) -> Option<Vec<SchemaType>> {
    Some(self.0.types.as_ref()?.clone())
  }

  // applicators
  #[wasm_bindgen(getter = reference)]
  pub fn reference_get(&self) -> Option<usize> {
    self.0.reference
  }

  #[wasm_bindgen(getter = ifSchema)]
  pub fn if_get(&self) -> Option<usize> {
    self.0.r#if
  }
  #[wasm_bindgen(getter = thenSchema)]
  pub fn then_get(&self) -> Option<usize> {
    self.0.then
  }
  #[wasm_bindgen(getter = elseSchema)]
  pub fn else_get(&self) -> Option<usize> {
    self.0.r#else
  }

  #[wasm_bindgen(getter = not)]
  pub fn not_get(&self) -> Option<usize> {
    self.0.not
  }

  #[wasm_bindgen(getter = propertyNames)]
  pub fn property_names_get(&self) -> Option<usize> {
    self.0.property_names
  }
  #[wasm_bindgen(getter = mapProperties)]
  pub fn map_properties_get(&self) -> Option<usize> {
    self.0.map_properties
  }
  #[wasm_bindgen(getter = arrayItems)]
  pub fn array_items_get(&self) -> Option<usize> {
    self.0.array_items
  }
  #[wasm_bindgen(getter = contains)]
  pub fn contains_get(&self) -> Option<usize> {
    self.0.contains
  }

  #[wasm_bindgen(getter = allOf)]
  pub fn all_of_get(&self) -> Option<Vec<usize>> {
    Some(self.0.all_of.as_ref()?.iter().copied().collect())
  }
  #[wasm_bindgen(getter = anyOf)]
  pub fn any_of_get(&self) -> Option<Vec<usize>> {
    Some(self.0.any_of.as_ref()?.iter().copied().collect())
  }
  #[wasm_bindgen(getter = oneOf)]
  pub fn one_of_get(&self) -> Option<Vec<usize>> {
    Some(self.0.one_of.as_ref()?.iter().copied().collect())
  }
  #[wasm_bindgen(getter = tupleItems)]
  pub fn tuple_items_get(&self) -> Option<Vec<usize>> {
    Some(self.0.tuple_items.as_ref()?.clone())
  }

  #[wasm_bindgen(getter = objectProperties)]
  pub fn object_properties_get(&self) -> JsValue {
    let Some(value) = self.0.object_properties.as_ref() else {
      return JsValue::undefined();
    };

    JsValue::from_serde(value).unwrap_or(JsValue::undefined())
  }
  #[wasm_bindgen(getter = patternProperties)]
  pub fn pattern_properties_get(&self) -> JsValue {
    let Some(value) = self.0.pattern_properties.as_ref() else {
      return JsValue::undefined();
    };

    JsValue::from_serde(value).unwrap_or(JsValue::undefined())
  }
  #[wasm_bindgen(getter = dependentSchemas)]
  pub fn dependent_schemas_get(&self) -> JsValue {
    let Some(value) = self.0.dependent_schemas.as_ref() else {
      return JsValue::undefined();
    };

    JsValue::from_serde(value).unwrap_or(JsValue::undefined())
  }

  // assertions
  #[wasm_bindgen(getter = options)]
  pub fn options_get(&self) -> Option<Vec<JsValue>> {
    Some(
      self
        .0
        .options
        .as_ref()?
        .iter()
        .filter_map(|value| JsValue::from_serde(value).ok())
        .collect(),
    )
  }
  #[wasm_bindgen(getter = required)]
  pub fn required_get(&self) -> Option<Vec<String>> {
    Some(self.0.required.as_ref()?.iter().cloned().collect())
  }

  #[wasm_bindgen(getter = minimumInclusive)]
  pub fn minimum_inclusive_get(&self) -> Option<f64> {
    self.0.minimum_inclusive
  }
  #[wasm_bindgen(getter = minimumExclusive)]
  pub fn minimum_exclusive_get(&self) -> Option<f64> {
    self.0.minimum_exclusive
  }
  #[wasm_bindgen(getter = maximumInclusive)]
  pub fn maximum_inclusive_get(&self) -> Option<f64> {
    self.0.maximum_inclusive
  }
  #[wasm_bindgen(getter = maximumExclusive)]
  pub fn maximum_exclusive_get(&self) -> Option<f64> {
    self.0.maximum_exclusive
  }
  #[wasm_bindgen(getter = multipleOf)]
  pub fn multiple_of_get(&self) -> Option<f64> {
    self.0.multiple_of
  }

  #[wasm_bindgen(getter = minimumLength)]
  pub fn minimum_length_get(&self) -> Option<u32> {
    self.0.minimum_length
  }
  #[wasm_bindgen(getter = maximumLength)]
  pub fn maximum_length_get(&self) -> Option<u32> {
    self.0.maximum_length
  }
  #[wasm_bindgen(getter = valuePattern)]
  pub fn value_pattern_get(&self) -> Option<String> {
    Some(self.0.value_pattern.as_ref()?.clone())
  }
  #[wasm_bindgen(getter = valueFormat)]
  pub fn value_format_get(&self) -> Option<String> {
    Some(self.0.value_format.as_ref()?.clone())
  }

  #[wasm_bindgen(getter = minimumItems)]
  pub fn minimum_items_get(&self) -> Option<u32> {
    self.0.minimum_items
  }
  #[wasm_bindgen(getter = maximumItems)]
  pub fn maximum_items_get(&self) -> Option<u32> {
    self.0.maximum_items
  }
  #[wasm_bindgen(getter = uniqueItems)]
  pub fn unique_items_get(&self) -> Option<bool> {
    self.0.unique_items
  }

  #[wasm_bindgen(getter = minimumProperties)]
  pub fn minimum_properties_get(&self) -> Option<u32> {
    self.0.minimum_properties
  }
  #[wasm_bindgen(getter = maximumProperties)]
  pub fn maximum_properties_get(&self) -> Option<u32> {
    self.0.maximum_properties
  }
}

impl From<ArenaSchemaItem> for ArenaSchemaItemContainer {
  fn from(value: ArenaSchemaItem) -> Self {
    Self(value)
  }
}

impl From<ArenaSchemaItemContainer> for ArenaSchemaItem {
  fn from(value: ArenaSchemaItemContainer) -> Self {
    value.0
  }
}
