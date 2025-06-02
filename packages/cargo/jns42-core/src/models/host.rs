use super::*;
use crate::schema_transforms;
use crate::{Host, exports};
use std::cell;

impl exports::jns42::core::models::Guest for Host {
  type SchemaArena = SchemaArenaHost;
}

pub struct SchemaArenaHost(cell::RefCell<SchemaArena>);

impl From<SchemaArena> for SchemaArenaHost {
  fn from(value: SchemaArena) -> Self {
    Self(value.into())
  }
}

impl From<SchemaArenaHost> for exports::jns42::core::models::SchemaArena {
  fn from(value: SchemaArenaHost) -> Self {
    Self::new(value)
  }
}

impl From<SchemaArena> for exports::jns42::core::models::SchemaArena {
  fn from(value: SchemaArena) -> Self {
    SchemaArenaHost::from(value).into()
  }
}

impl exports::jns42::core::models::GuestSchemaArena for SchemaArenaHost {
  fn new() -> Self {
    SchemaArena::new().into()
  }

  fn count(&self) -> u32 {
    self.0.borrow().count() as u32
  }

  fn get_item(
    &self,
    key: exports::jns42::core::models::Key,
  ) -> exports::jns42::core::models::ArenaSchemaItem {
    self.0.borrow().get_item(key as usize).clone().into()
  }

  fn get_all_related(
    &self,
    key: exports::jns42::core::models::Key,
  ) -> Vec<exports::jns42::core::models::Key> {
    self
      .0
      .borrow()
      .get_all_related(key as usize)
      .map(|value| value as exports::jns42::core::models::Key)
      .collect()
  }

  fn transform(&self, transforms: Vec<exports::jns42::core::models::SchemaTransform>) -> u32 {
    self
      .0
      .borrow_mut()
      .apply_transform(|arena: &mut SchemaArena, key: usize| {
        for transform in &transforms {
          let transform: BoxedSchemaTransform = (*transform).into();
          transform(arena, key)
        }
      }) as u32
  }

  fn from_document_context(
    document_context: exports::jns42::core::documents::DocumentContext,
  ) -> exports::jns42::core::models::SchemaArena {
    let document_context = document_context.into();
    let schema_arena = SchemaArena::from_document_context(&document_context);
    schema_arena.into()
  }

  fn clone(&self) -> exports::jns42::core::models::SchemaArena {
    exports::jns42::core::models::SchemaArena::new(SchemaArenaHost::from(self.0.borrow().clone()))
  }
}

impl From<exports::jns42::core::models::SchemaTransform> for BoxedSchemaTransform {
  fn from(value: exports::jns42::core::models::SchemaTransform) -> Self {
    let transform = match value {
      exports::jns42::core::models::SchemaTransform::Explode => {
        schema_transforms::explode::transform
      }

      exports::jns42::core::models::SchemaTransform::FlattenAllOf => {
        schema_transforms::flatten::all_of::transform
      }
      exports::jns42::core::models::SchemaTransform::FlattenAnyOf => {
        schema_transforms::flatten::any_of::transform
      }
      exports::jns42::core::models::SchemaTransform::FlattenOneOf => {
        schema_transforms::flatten::one_of::transform
      }

      exports::jns42::core::models::SchemaTransform::FlipAllOfAnyOf => {
        schema_transforms::flip::all_of_any_of::transform
      }
      exports::jns42::core::models::SchemaTransform::FlipAllOfOneOf => {
        schema_transforms::flip::all_of_one_of::transform
      }
      exports::jns42::core::models::SchemaTransform::FlipAnyOfAllOf => {
        schema_transforms::flip::any_of_all_of::transform
      }
      exports::jns42::core::models::SchemaTransform::FlipAnyOfOneOf => {
        schema_transforms::flip::any_of_one_of::transform
      }
      exports::jns42::core::models::SchemaTransform::FlipOneOfAllOf => {
        schema_transforms::flip::one_of_all_of::transform
      }
      exports::jns42::core::models::SchemaTransform::FlipOneOfAnyOf => {
        schema_transforms::flip::one_of_any_of::transform
      }

      exports::jns42::core::models::SchemaTransform::InheritAllOf => {
        schema_transforms::inherit::all_of::transform
      }
      exports::jns42::core::models::SchemaTransform::InheritAnyOf => {
        schema_transforms::inherit::any_of::transform
      }
      exports::jns42::core::models::SchemaTransform::InheritOneOf => {
        schema_transforms::inherit::one_of::transform
      }
      exports::jns42::core::models::SchemaTransform::InheritReference => {
        schema_transforms::inherit::reference::transform
      }

      exports::jns42::core::models::SchemaTransform::ResolveAllOf => {
        schema_transforms::resolve_all_of::transform
      }
      exports::jns42::core::models::SchemaTransform::ResolveAnyOf => {
        schema_transforms::resolve_any_of::transform
      }
      exports::jns42::core::models::SchemaTransform::ResolveIfThenElse => {
        schema_transforms::resolve_if_then_else::transform
      }
      exports::jns42::core::models::SchemaTransform::ResolveNot => {
        schema_transforms::resolve_not::transform
      }

      exports::jns42::core::models::SchemaTransform::ResolveSingleAllOf => {
        schema_transforms::resolve_single::all_of::transform
      }
      exports::jns42::core::models::SchemaTransform::ResolveSingleAnyOf => {
        schema_transforms::resolve_single::any_of::transform
      }
      exports::jns42::core::models::SchemaTransform::ResolveSingleOneOf => {
        schema_transforms::resolve_single::one_of::transform
      }

      exports::jns42::core::models::SchemaTransform::SingleType => {
        schema_transforms::single_type::transform
      }

      exports::jns42::core::models::SchemaTransform::Unalias => {
        schema_transforms::unalias::transform
      }

      exports::jns42::core::models::SchemaTransform::Name => schema_transforms::name::transform,
    };
    Box::new(transform)
  }
}

impl From<SchemaType> for exports::jns42::core::models::SchemaType {
  fn from(value: SchemaType) -> Self {
    match value {
      SchemaType::Never => Self::Never,
      SchemaType::Any => Self::Any,
      SchemaType::Null => Self::Null,
      SchemaType::Boolean => Self::Boolean,
      SchemaType::Integer => Self::Integer,
      SchemaType::Number => Self::Number,
      SchemaType::String => Self::Str,
      SchemaType::Array => Self::Array,
      SchemaType::Object => Self::Object,
    }
  }
}

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

// #[cfg(test)]
// mod tests {
//   use *;
//   use exports::jns42::core::models::{
//     ArenaSchemaItem, GuestSchemaArena, SchemaTransform, SchemaType,
//   };
//   use itertools::Itertools;

//   fn run_test(
//     initial: impl IntoIterator<Item = ArenaSchemaItem>,
//     expected: impl IntoIterator<Item = ArenaSchemaItem>,
//     transforms: impl IntoIterator<Item = SchemaTransform>,
//   ) {
//     let expected: Vec<_> = expected.into_iter().collect();
//     let arena_input = models::SchemaArena::from_iter(initial);
//     let transforms: Vec<_> = transforms.into_iter().collect();

//     // the order of transforms should not matter! we test that here
//     for transforms in transforms.iter().permutations(transforms.len()) {
//       let arena: SchemaArenaHost = arena_input.clone().into();
//       let transforms = transforms.into_iter().cloned().collect::<Vec<_>>();

//       let mut iteration = 0;
//       while arena.transform(transforms.clone()) > 0 {
//         iteration += 1;
//         assert!(iteration < 100);
//         assert!(arena.count() < 100);
//       }

//       let arena: SchemaArena = arena.into();
//       let actual: Vec<_> = arena.iter().cloned().collect();

//       assert_eq!(actual, expected)
//     }
//   }

//   #[test]
//   fn test_transform_1() {
//     let transforms = [
//       SchemaTransform::FlattenAllOf,
//       SchemaTransform::InheritAllOf,
//       SchemaTransform::InheritReference,
//       SchemaTransform::ResolveAllOf,
//       SchemaTransform::ResolveSingleAllOf,
//       SchemaTransform::Unalias,
//     ];

//     let initial = [
//       ArenaSchemaItem {
//         types: Some([SchemaType::Str].into()),
//         ..Default::default()
//       }, // 0
//       ArenaSchemaItem {
//         types: Some([SchemaType::Object].into()),
//         object_properties: Some([("a".into(), 0), ("b".into(), 0)].into()),
//         ..Default::default()
//       }, // 1
//       ArenaSchemaItem {
//         object_properties: Some([("c".into(), 0)].into()),
//         reference: Some(1),
//         ..Default::default()
//       }, // 2
//     ];

//     let expected = [
//       ArenaSchemaItem {
//         types: Some([SchemaType::Str].into()),
//         ..Default::default()
//       }, // 0
//       ArenaSchemaItem {
//         types: Some([SchemaType::Object].into()),
//         object_properties: Some([("a".into(), 0), ("b".into(), 0)].into()),
//         ..Default::default()
//       }, // 1
//       ArenaSchemaItem {
//         reference: Some(4),
//         ..Default::default()
//       }, // 2
//       ArenaSchemaItem {
//         object_properties: Some([("c".into(), 0)].into()),
//         ..Default::default()
//       }, // 3
//       ArenaSchemaItem {
//         types: Some([SchemaType::Object].into()),
//         object_properties: Some([("a".into(), 0), ("b".into(), 0), ("c".into(), 0)].into()),
//         ..Default::default()
//       }, // 4
//     ];

//     run_test(initial, expected, transforms);
//   }
// }
