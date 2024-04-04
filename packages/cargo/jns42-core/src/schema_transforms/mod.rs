use crate::models::{arena::Arena, schema::SchemaItem};

pub mod explode;
pub mod flatten;
pub mod flip;
pub mod inherit;
pub mod primary;
pub mod resolve_all_of;
pub mod resolve_if_then_else;
pub mod resolve_not;
pub mod resolve_single;
pub mod single_type;

#[derive(Debug, Clone, Copy, Hash, Eq, PartialEq, Ord, PartialOrd)]
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
  pub const PRIMARY: Self = Self(50);
  pub const RESOLVE_ALL_OF: Self = Self(60);
  pub const RESOLVE_IF_THEN_ELSE: Self = Self(70);
  pub const RESOLVE_NOT: Self = Self(80);
  pub const RESOLVE_SINGLE_ALL_OF: Self = Self(91);
  pub const RESOLVE_SINGLE_ANY_OF: Self = Self(92);
  pub const RESOLVE_SINGLE_ONE_OF: Self = Self(93);
  pub const SINGLE_TYPE: Self = Self(100);
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

pub type BoxedSchemaTransform = Box<dyn Fn(&mut Arena<SchemaItem>, usize)>;

impl From<&SchemaTransform> for BoxedSchemaTransform {
  fn from(value: &SchemaTransform) -> Self {
    let transform = match *value {
      SchemaTransform::EXPLODE => explode::transform,
      SchemaTransform::FLATTEN_ALL_OF => flatten::all_of::transform,
      SchemaTransform::FLATTEN_ANY_OF => flatten::any_of::transform,
      SchemaTransform::FLATTEN_ONE_OF => flatten::one_of::transform,
      SchemaTransform::FLIP_ALL_OF_ANY_OF => flip::all_of_any_of::transform,
      SchemaTransform::FLIP_ALL_OF_ONE_OF => flip::all_of_one_of::transform,
      SchemaTransform::FLIP_ANY_OF_ALL_OF => flip::any_of_all_of::transform,
      SchemaTransform::FLIP_ANY_OF_ONE_OF => flip::any_of_one_of::transform,
      SchemaTransform::FLIP_ONE_OF_ALL_OF => flip::one_of_all_of::transform,
      SchemaTransform::FLIP_ONE_OF_ANY_OF => flip::one_of_any_of::transform,
      SchemaTransform::INHERIT_ALL_OF => inherit::all_of::transform,
      SchemaTransform::INHERIT_ANY_OF => inherit::any_of::transform,
      SchemaTransform::INHERIT_ONE_OF => inherit::one_of::transform,
      SchemaTransform::PRIMARY => primary::transform,
      SchemaTransform::RESOLVE_ALL_OF => resolve_all_of::transform,
      SchemaTransform::RESOLVE_IF_THEN_ELSE => resolve_if_then_else::transform,
      SchemaTransform::RESOLVE_NOT => resolve_not::transform,
      SchemaTransform::RESOLVE_SINGLE_ALL_OF => resolve_single::all_of::transform,
      SchemaTransform::RESOLVE_SINGLE_ANY_OF => resolve_single::any_of::transform,
      SchemaTransform::RESOLVE_SINGLE_ONE_OF => resolve_single::one_of::transform,
      SchemaTransform::SINGLE_TYPE => single_type::transform,
      _ => unreachable!(),
    };
    Box::new(transform)
  }
  //
}
