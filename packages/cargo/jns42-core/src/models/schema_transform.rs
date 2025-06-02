use super::SchemaArena;

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
