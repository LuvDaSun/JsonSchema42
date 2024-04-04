export enum SchemaTransform {
  explode = 10,

  flattenAllOf = 21,
  flattenAnyOf = 22,
  flattenOneOf = 23,

  flipAllOfAnyOf = 31,
  flipAllOfOneOf = 32,
  flipAnyOfAllOf = 33,
  flipAnyOfOneOf = 34,
  flipOneOfAllOf = 35,
  flipOneOfAnyOf = 36,

  inheritAllOf = 41,
  inheritAnyOf = 42,
  inheritOneOf = 43,
  inheritReference = 44,

  primary = 50,

  resolveAllOf = 61,
  resolveAnyOf = 62,
  resolveIfThenElse = 63,
  resolveNot = 64,

  resolveSingleAllOf = 71,
  resolveSingleAnyOf = 72,
  resolveSingleOneOf = 73,

  singleType = 80,
}
