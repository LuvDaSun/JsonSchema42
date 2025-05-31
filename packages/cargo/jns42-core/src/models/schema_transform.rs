use super::SchemaArena;
use crate::schema_transforms;
// use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
// #[wasm_bindgen]
pub enum SchemaTransform {
  Explode,
  FlattenAllOf,
  FlattenAnyOf,
  FlattenOneOf,
  FlipAllOfAnyOf,
  FlipAllOfOneOf,
  FlipAnyOfAllOf,
  FlipAnyOfOneOf,
  FlipOneOfAllOf,
  FlipOneOfAnyOf,
  InheritAllOf,
  InheritAnyOf,
  InheritOneOf,
  InheritReference,
  ResolveAllOf,
  ResolveAnyOf,
  ResolveIfThenElse,
  ResolveNot,
  ResolveSingleAllOf,
  ResolveSingleAnyOf,
  ResolveSingleOneOf,
  SingleType,
  Unalias,

  Name,
}

pub type BoxedSchemaTransform = Box<dyn Fn(&mut SchemaArena, usize)>;

impl From<SchemaTransform> for BoxedSchemaTransform {
  fn from(value: SchemaTransform) -> Self {
    let transform = match value {
      SchemaTransform::Explode => schema_transforms::explode::transform,

      SchemaTransform::FlattenAllOf => schema_transforms::flatten::all_of::transform,
      SchemaTransform::FlattenAnyOf => schema_transforms::flatten::any_of::transform,
      SchemaTransform::FlattenOneOf => schema_transforms::flatten::one_of::transform,

      SchemaTransform::FlipAllOfAnyOf => schema_transforms::flip::all_of_any_of::transform,
      SchemaTransform::FlipAllOfOneOf => schema_transforms::flip::all_of_one_of::transform,
      SchemaTransform::FlipAnyOfAllOf => schema_transforms::flip::any_of_all_of::transform,
      SchemaTransform::FlipAnyOfOneOf => schema_transforms::flip::any_of_one_of::transform,
      SchemaTransform::FlipOneOfAllOf => schema_transforms::flip::one_of_all_of::transform,
      SchemaTransform::FlipOneOfAnyOf => schema_transforms::flip::one_of_any_of::transform,

      SchemaTransform::InheritAllOf => schema_transforms::inherit::all_of::transform,
      SchemaTransform::InheritAnyOf => schema_transforms::inherit::any_of::transform,
      SchemaTransform::InheritOneOf => schema_transforms::inherit::one_of::transform,
      SchemaTransform::InheritReference => schema_transforms::inherit::reference::transform,

      SchemaTransform::ResolveAllOf => schema_transforms::resolve_all_of::transform,
      SchemaTransform::ResolveAnyOf => schema_transforms::resolve_any_of::transform,
      SchemaTransform::ResolveIfThenElse => schema_transforms::resolve_if_then_else::transform,
      SchemaTransform::ResolveNot => schema_transforms::resolve_not::transform,

      SchemaTransform::ResolveSingleAllOf => schema_transforms::resolve_single::all_of::transform,
      SchemaTransform::ResolveSingleAnyOf => schema_transforms::resolve_single::any_of::transform,
      SchemaTransform::ResolveSingleOneOf => schema_transforms::resolve_single::one_of::transform,

      SchemaTransform::SingleType => schema_transforms::single_type::transform,

      SchemaTransform::Unalias => schema_transforms::unalias::transform,

      SchemaTransform::Name => schema_transforms::name::transform,
    };
    Box::new(transform)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{ArenaSchemaItem, SchemaArenaContainer, SchemaType};
  use itertools::Itertools;

  fn run_test(
    initial: impl IntoIterator<Item = ArenaSchemaItem>,
    expected: impl IntoIterator<Item = ArenaSchemaItem>,
    transforms: impl IntoIterator<Item = SchemaTransform>,
  ) {
    let expected: Vec<_> = expected.into_iter().collect();
    let arena_input = SchemaArena::from_iter(initial);
    let transforms: Vec<_> = transforms.into_iter().collect();

    // the order of transforms should not matter! we test that here
    for transforms in transforms.iter().permutations(transforms.len()) {
      let mut arena: SchemaArenaContainer = arena_input.clone().into();
      let transforms = transforms.into_iter().cloned().collect::<Vec<_>>();

      let mut iteration = 0;
      while arena.transform(transforms.clone()) > 0 {
        iteration += 1;
        assert!(iteration < 100);
        assert!(arena.count() < 100);
      }

      let arena: SchemaArena = arena.into();
      let actual: Vec<_> = arena.iter().cloned().collect();

      assert_eq!(actual, expected)
    }
  }

  #[test]
  fn test_transform_1() {
    let transforms = [
      SchemaTransform::FlattenAllOf,
      SchemaTransform::InheritAllOf,
      SchemaTransform::InheritReference,
      SchemaTransform::ResolveAllOf,
      SchemaTransform::ResolveSingleAllOf,
      SchemaTransform::Unalias,
    ];

    let initial = [
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        object_properties: Some([("a".into(), 0), ("b".into(), 0)].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        object_properties: Some([("c".into(), 0)].into()),
        reference: Some(1),
        ..Default::default()
      }, // 2
    ];

    let expected = [
      ArenaSchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 0
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        object_properties: Some([("a".into(), 0), ("b".into(), 0)].into()),
        ..Default::default()
      }, // 1
      ArenaSchemaItem {
        reference: Some(4),
        ..Default::default()
      }, // 2
      ArenaSchemaItem {
        object_properties: Some([("c".into(), 0)].into()),
        ..Default::default()
      }, // 3
      ArenaSchemaItem {
        types: Some([SchemaType::Object].into()),
        object_properties: Some([("a".into(), 0), ("b".into(), 0), ("c".into(), 0)].into()),
        ..Default::default()
      }, // 4
    ];

    run_test(initial, expected, transforms);
  }
}
