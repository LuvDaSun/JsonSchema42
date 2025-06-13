use super::SchemaArena;

#[cfg(target_arch = "wasm32")]
use crate::{exports, schema_transforms};

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
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

#[cfg(target_arch = "wasm32")]
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
