use std::cell::RefCell;

pub struct SchemaArenaHost(RefCell<super::SchemaArena>);

impl From<super::SchemaArena> for SchemaArenaHost {
  fn from(value: super::SchemaArena) -> Self {
    Self(value.into())
  }
}

impl From<crate::exports::jns42::core::models::SchemaTransform> for super::BoxedSchemaTransform {
  fn from(value: crate::exports::jns42::core::models::SchemaTransform) -> Self {
    let transform = match value {
      crate::exports::jns42::core::models::SchemaTransform::Explode => {
        crate::schema_transforms::explode::transform
      }

      crate::exports::jns42::core::models::SchemaTransform::FlattenAllOf => {
        crate::schema_transforms::flatten::all_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::FlattenAnyOf => {
        crate::schema_transforms::flatten::any_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::FlattenOneOf => {
        crate::schema_transforms::flatten::one_of::transform
      }

      crate::exports::jns42::core::models::SchemaTransform::FlipAllOfAnyOf => {
        crate::schema_transforms::flip::all_of_any_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::FlipAllOfOneOf => {
        crate::schema_transforms::flip::all_of_one_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::FlipAnyOfAllOf => {
        crate::schema_transforms::flip::any_of_all_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::FlipAnyOfOneOf => {
        crate::schema_transforms::flip::any_of_one_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::FlipOneOfAllOf => {
        crate::schema_transforms::flip::one_of_all_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::FlipOneOfAnyOf => {
        crate::schema_transforms::flip::one_of_any_of::transform
      }

      crate::exports::jns42::core::models::SchemaTransform::InheritAllOf => {
        crate::schema_transforms::inherit::all_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::InheritAnyOf => {
        crate::schema_transforms::inherit::any_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::InheritOneOf => {
        crate::schema_transforms::inherit::one_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::InheritReference => {
        crate::schema_transforms::inherit::reference::transform
      }

      crate::exports::jns42::core::models::SchemaTransform::ResolveAllOf => {
        crate::schema_transforms::resolve_all_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::ResolveAnyOf => {
        crate::schema_transforms::resolve_any_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::ResolveIfThenElse => {
        crate::schema_transforms::resolve_if_then_else::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::ResolveNot => {
        crate::schema_transforms::resolve_not::transform
      }

      crate::exports::jns42::core::models::SchemaTransform::ResolveSingleAllOf => {
        crate::schema_transforms::resolve_single::all_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::ResolveSingleAnyOf => {
        crate::schema_transforms::resolve_single::any_of::transform
      }
      crate::exports::jns42::core::models::SchemaTransform::ResolveSingleOneOf => {
        crate::schema_transforms::resolve_single::one_of::transform
      }

      crate::exports::jns42::core::models::SchemaTransform::SingleType => {
        crate::schema_transforms::single_type::transform
      }

      crate::exports::jns42::core::models::SchemaTransform::Unalias => {
        crate::schema_transforms::unalias::transform
      }

      crate::exports::jns42::core::models::SchemaTransform::Name => {
        crate::schema_transforms::name::transform
      }
    };
    Box::new(transform)
  }
}

impl crate::exports::jns42::core::models::GuestSchemaArena for SchemaArenaHost {
  fn new() -> Self {
    super::SchemaArena::new().into()
  }

  fn count(&self) -> u32 {
    self.0.borrow().count() as u32
  }

  fn get_item(
    &self,
    key: crate::exports::jns42::core::models::Key,
  ) -> crate::exports::jns42::core::models::ArenaSchemaItem {
    self.0.borrow().get_item(key as usize).clone().into()
  }

  fn get_all_related(
    &self,
    key: crate::exports::jns42::core::models::Key,
  ) -> Vec<crate::exports::jns42::core::models::Key> {
    self
      .0
      .borrow()
      .get_all_related(key)
      .map(|value| value as crate::exports::jns42::core::models::Key)
      .collect()
  }

  #[allow(async_fn_in_trait)]
  fn transform(
    &self,
    transforms: Vec<crate::exports::jns42::core::models::SchemaTransform>,
  ) -> u32 {
    self
      .0
      .borrow_mut()
      .apply_transform(|arena: &mut super::SchemaArena, key: usize| {
        for transform in &transforms {
          let transform: super::BoxedSchemaTransform = (*transform).into();
          transform(arena, key)
        }
      }) as u32
  }
}

impl From<super::SchemaType> for crate::exports::jns42::core::models::SchemaType {
  fn from(value: super::SchemaType) -> Self {
    match value {
      super::SchemaType::Never => Self::Never,
      super::SchemaType::Any => Self::Any,
      super::SchemaType::Null => Self::Null,
      super::SchemaType::Boolean => Self::Boolean,
      super::SchemaType::Integer => Self::Integer,
      super::SchemaType::Number => Self::Number,
      super::SchemaType::String => Self::Str,
      super::SchemaType::Array => Self::Array,
      super::SchemaType::Object => Self::Object,
    }
  }
}

impl From<super::ArenaSchemaItem> for crate::exports::jns42::core::models::ArenaSchemaItem {
  fn from(value: super::ArenaSchemaItem) -> Self {
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
      reference: value.reference,

      if_: value.r#if,
      then: value.then,
      else_: value.r#else,

      not: value.not,

      property_names: value.property_names,
      map_properties: value.map_properties,
      array_items: value.array_items,
      contains: value.contains,

      all_of: value.all_of.map(|value| value.into_iter().collect()),
      any_of: value.any_of.map(|value| value.into_iter().collect()),
      one_of: value.one_of.map(|value| value.into_iter().collect()),
      tuple_items: value.tuple_items,

      object_properties: value
        .object_properties
        .map(|value| value.into_iter().collect()),
      pattern_properties: value
        .pattern_properties
        .map(|value| value.into_iter().collect()),
      dependent_schemas: value
        .dependent_schemas
        .map(|value| value.into_iter().collect()),

      definitions: value.definitions.map(|value| value.into_iter().collect()),

      // assertions
      options: Default::default(), // value.options,
      required: value.required.map(|value| value.into_iter().collect()),

      minimum_inclusive: value
        .minimum_inclusive
        .map(|value| value.as_f64())
        .flatten(),
      minimum_exclusive: value
        .minimum_exclusive
        .map(|value| value.as_f64())
        .flatten(),
      maximum_inclusive: value
        .maximum_inclusive
        .map(|value| value.as_f64())
        .flatten(),
      maximum_exclusive: value
        .maximum_exclusive
        .map(|value| value.as_f64())
        .flatten(),
      multiple_of: value.multiple_of.map(|value| value.as_f64()).flatten(),

      minimum_length: value.minimum_length,
      maximum_length: value.maximum_length,
      value_pattern: value.value_pattern,
      value_format: value.value_format,

      minimum_items: value.minimum_items,
      maximum_items: value.maximum_items,
      unique_items: value.unique_items,

      minimum_properties: value.minimum_properties,
      maximum_properties: value.maximum_properties,
    }
  }
}

impl crate::exports::jns42::core::models::Guest for crate::Host {
  type SchemaArena = SchemaArenaHost;
}

//   pub fn from_document_context(document_context: &DocumentContextContainer) -> Self {
//     let document_context = document_context.clone();
//     SchemaArena::from_document_context(&document_context.into()).into()
//   }
