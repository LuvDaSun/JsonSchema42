use super::SchemaArena;
use crate::schema_transforms;

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
#[repr(transparent)]
pub struct SchemaTransform(usize);

impl SchemaTransform {
  pub const EXPLODE: Self = Self(10);

  pub const FLATTEN_ALL_OF: Self = Self(21);
  pub const FLATTEN_ANY_OF: Self = Self(22);
  pub const FLATTEN_ONE_OF: Self = Self(23);

  pub const FLIP_ALL_OF_ANY_OF: Self = Self(31);
  pub const FLIP_ALL_OF_ONE_OF: Self = Self(32);
  pub const FLIP_ANY_OF_ALL_OF: Self = Self(33);
  pub const FLIP_ANY_OF_ONE_OF: Self = Self(34);
  pub const FLIP_ONE_OF_ALL_OF: Self = Self(35);
  pub const FLIP_ONE_OF_ANY_OF: Self = Self(36);

  pub const INHERIT_ALL_OF: Self = Self(41);
  pub const INHERIT_ANY_OF: Self = Self(42);
  pub const INHERIT_ONE_OF: Self = Self(43);
  pub const INHERIT_REFERENCE: Self = Self(44);

  pub const PRIMARY: Self = Self(50);

  pub const RESOLVE_ALL_OF: Self = Self(61);
  pub const RESOLVE_ANY_OF: Self = Self(62);
  pub const RESOLVE_IF_THEN_ELSE: Self = Self(63);
  pub const RESOLVE_NOT: Self = Self(64);

  pub const RESOLVE_SINGLE_ALL_OF: Self = Self(71);
  pub const RESOLVE_SINGLE_ANY_OF: Self = Self(72);
  pub const RESOLVE_SINGLE_ONE_OF: Self = Self(73);

  pub const SINGLE_TYPE: Self = Self(80);

  pub const UNALIAS: Self = Self(90);
}

impl From<usize> for SchemaTransform {
  fn from(value: usize) -> Self {
    Self(value)
  }
}

impl From<SchemaTransform> for usize {
  fn from(value: SchemaTransform) -> Self {
    value.0
  }
}

pub type BoxedSchemaTransform = Box<dyn Fn(&mut SchemaArena, usize)>;

impl From<&SchemaTransform> for BoxedSchemaTransform {
  fn from(value: &SchemaTransform) -> Self {
    let transform = match *value {
      SchemaTransform::EXPLODE => schema_transforms::explode::transform,

      SchemaTransform::FLATTEN_ALL_OF => schema_transforms::flatten::all_of::transform,
      SchemaTransform::FLATTEN_ANY_OF => schema_transforms::flatten::any_of::transform,
      SchemaTransform::FLATTEN_ONE_OF => schema_transforms::flatten::one_of::transform,

      SchemaTransform::FLIP_ALL_OF_ANY_OF => schema_transforms::flip::all_of_any_of::transform,
      SchemaTransform::FLIP_ALL_OF_ONE_OF => schema_transforms::flip::all_of_one_of::transform,
      SchemaTransform::FLIP_ANY_OF_ALL_OF => schema_transforms::flip::any_of_all_of::transform,
      SchemaTransform::FLIP_ANY_OF_ONE_OF => schema_transforms::flip::any_of_one_of::transform,
      SchemaTransform::FLIP_ONE_OF_ALL_OF => schema_transforms::flip::one_of_all_of::transform,
      SchemaTransform::FLIP_ONE_OF_ANY_OF => schema_transforms::flip::one_of_any_of::transform,

      SchemaTransform::INHERIT_ALL_OF => schema_transforms::inherit::all_of::transform,
      SchemaTransform::INHERIT_ANY_OF => schema_transforms::inherit::any_of::transform,
      SchemaTransform::INHERIT_ONE_OF => schema_transforms::inherit::one_of::transform,
      SchemaTransform::INHERIT_REFERENCE => schema_transforms::inherit::reference::transform,

      SchemaTransform::PRIMARY => schema_transforms::primary::transform,

      SchemaTransform::RESOLVE_ALL_OF => schema_transforms::resolve_all_of::transform,
      SchemaTransform::RESOLVE_ANY_OF => schema_transforms::resolve_any_of::transform,
      SchemaTransform::RESOLVE_IF_THEN_ELSE => schema_transforms::resolve_if_then_else::transform,
      SchemaTransform::RESOLVE_NOT => schema_transforms::resolve_not::transform,

      SchemaTransform::RESOLVE_SINGLE_ALL_OF => {
        schema_transforms::resolve_single::all_of::transform
      }
      SchemaTransform::RESOLVE_SINGLE_ANY_OF => {
        schema_transforms::resolve_single::any_of::transform
      }
      SchemaTransform::RESOLVE_SINGLE_ONE_OF => {
        schema_transforms::resolve_single::one_of::transform
      }

      SchemaTransform::SINGLE_TYPE => schema_transforms::single_type::transform,

      SchemaTransform::UNALIAS => schema_transforms::unalias::transform,
      _ => unreachable!(),
    };
    Box::new(transform)
  }
  //
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::models::{SchemaItem, SchemaType};
  use itertools::Itertools;

  fn run_test(
    initial: impl IntoIterator<Item = SchemaItem>,
    expected: impl IntoIterator<Item = SchemaItem>,
    transforms: impl IntoIterator<Item = SchemaTransform>,
  ) {
    let expected: Vec<_> = expected.into_iter().collect();
    let arena_input = SchemaArena::from_iter(initial);
    let transforms: Vec<_> = transforms.into_iter().collect();

    // the order of transforms should not matter! we test that here
    for transforms in transforms.iter().permutations(transforms.len()) {
      let mut arena = arena_input.clone();
      let transforms = transforms.into_iter().cloned().collect();

      let mut iteration = 0;
      while arena.transform(&transforms) > 0 {
        iteration += 1;
        assert!(iteration < 100);
        assert!(arena.count() < 100);
      }

      let actual: Vec<_> = arena.iter().cloned().collect();

      assert_eq!(actual, expected)
    }
  }

  #[test]
  fn test_transform_1() {
    let transforms = [
      SchemaTransform::FLATTEN_ALL_OF,
      SchemaTransform::INHERIT_ALL_OF,
      SchemaTransform::INHERIT_REFERENCE,
      SchemaTransform::RESOLVE_ALL_OF,
      SchemaTransform::RESOLVE_SINGLE_ALL_OF,
      SchemaTransform::UNALIAS,
    ];

    let initial = [
      SchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 0
      SchemaItem {
        types: Some([SchemaType::Object].into()),
        object_properties: Some([("a".into(), 0), ("b".into(), 0)].into()),
        ..Default::default()
      }, // 1
      SchemaItem {
        object_properties: Some([("c".into(), 0)].into()),
        reference: Some(1),
        ..Default::default()
      }, // 2
    ];

    let expected = [
      SchemaItem {
        types: Some([SchemaType::String].into()),
        ..Default::default()
      }, // 0
      SchemaItem {
        types: Some([SchemaType::Object].into()),
        object_properties: Some([("a".into(), 0), ("b".into(), 0)].into()),
        ..Default::default()
      }, // 1
      SchemaItem {
        reference: Some(4),
        ..Default::default()
      }, // 2
      SchemaItem {
        object_properties: Some([("c".into(), 0)].into()),
        ..Default::default()
      }, // 3
      SchemaItem {
        types: Some([SchemaType::Object].into()),
        object_properties: Some([("a".into(), 0), ("b".into(), 0), ("c".into(), 0)].into()),
        ..Default::default()
      }, // 4
    ];

    run_test(initial, expected, transforms);
  }
}
