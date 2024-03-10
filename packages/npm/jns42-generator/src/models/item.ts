/*
There is one big model that is the SchemaModel. All properties of the schema are here. Then  there
are quite a few states of the schema model. These states are a subset of the properties of the
SchemaModel. The optimizer algorithms change the SchemaModel into another state until a state is
reached that can be transformed into a generator model.
*/

/**
 * Key for referencing other schemas
 */
export type SchemaKey = number;
/**
 * Type for the SchemaItem
 */
export type SchemaType =
  | "never"
  | "any"
  | "null"
  | "boolean"
  | "integer"
  | "number"
  | "string"
  | "array"
  | "map";

/**
 * the entire SchemaItem, everything is optional!
 */
export type SchemaItem = {
  // the original parent of this item
  parent?: SchemaKey;

  // is this model exactly the same as the previous, un-optimized version or is is just similar
  exact?: boolean;

  id?: string;
  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;

  types?: SchemaType[];

  reference?: SchemaKey;

  if?: SchemaKey;
  then?: SchemaKey;
  else?: SchemaKey;

  not?: SchemaKey;

  mapProperties?: SchemaKey;
  arrayItems?: SchemaKey;
  propertyNames?: SchemaKey;
  contains?: SchemaKey;

  oneOf?: SchemaKey[];
  anyOf?: SchemaKey[];
  allOf?: SchemaKey[];
  tupleItems?: SchemaKey[];

  objectProperties?: Record<string, SchemaKey>;
  patternProperties?: Record<string, SchemaKey>;
  dependentSchemas?: Record<string, SchemaKey>;

  options?: any[];
  required?: string[];

  minimumInclusive?: number;
  minimumExclusive?: number;
  maximumInclusive?: number;
  maximumExclusive?: number;
  multipleOf?: number;
  minimumLength?: number;
  maximumLength?: number;
  valuePattern?: string[];
  valueFormat?: string[];
  minimumItems?: number;
  maximumItems?: number;
  uniqueItems?: boolean;
  minimumProperties?: number;
  maximumProperties?: number;
};

export type AliasSchemaModel = {
  reference: SchemaKey;

  exact?: boolean;
  id?: string;
  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;
};
export function isAliasSchemaModel(model: SchemaItem): model is AliasSchemaModel {
  return hasMembers(
    model,
    ["reference"],
    ["exact", "id", "title", "description", "examples", "deprecated"],
  );
}

export type MetaSchemaModel = {
  id?: string;
  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;
};
export const metaSchemaOptional = ["id", "title", "description", "examples", "deprecated"] as const;
export function isMetaSchemaModel(model: SchemaItem): model is MetaSchemaModel {
  return hasMembers(model, [], metaSchemaOptional);
}

export type TypeSchemaModel = Partial<MetaSchemaModel> & {
  types?: SchemaType[];

  not?: SchemaKey;

  dependentSchemas?: Record<string, SchemaKey>;
  objectProperties?: Record<string, SchemaKey>;
  mapProperties?: SchemaKey;
  patternProperties?: Record<string, SchemaKey>;
  propertyNames?: SchemaKey;
  tupleItems?: SchemaKey[];
  arrayItems?: SchemaKey;
  contains?: SchemaKey;
  required?: string[];
  options?: any[];

  minimumInclusive?: number;
  minimumExclusive?: number;
  maximumInclusive?: number;
  maximumExclusive?: number;
  multipleOf?: number;
  minimumLength?: number;
  maximumLength?: number;
  valuePattern?: string[];
  valueFormat?: string[];
  minimumItems?: number;
  maximumItems?: number;
  uniqueItems?: boolean;
  minimumProperties?: number;
  maximumProperties?: number;
};
export const typeSchemaOptional = [
  "types",

  "not",

  "dependentSchemas",
  "objectProperties",
  "mapProperties",
  "patternProperties",
  "propertyNames",
  "tupleItems",
  "arrayItems",
  "contains",
  "required",
  "options",

  "minimumInclusive",
  "minimumExclusive",
  "maximumInclusive",
  "maximumExclusive",
  "multipleOf",
  "minimumLength",
  "maximumLength",
  "valuePattern",
  "valueFormat",
  "minimumItems",
  "maximumItems",
  "uniqueItems",
  "minimumProperties",
  "maximumProperties",
] as const;
export function isTypeSchemaModel(model: SchemaItem): model is TypeSchemaModel {
  return hasMembers(model, [], [...typeSchemaOptional, ...metaSchemaOptional]);
}

export type SingleTypeSchemaModel = Partial<MetaSchemaModel> &
  TypeSchemaModel & {
    types?: [SchemaType];
  };
export function isSingleTypeSchemaModel(model: SchemaItem): model is SingleTypeSchemaModel {
  return (
    hasMembers(model, [], [...typeSchemaOptional, ...metaSchemaOptional]) &&
    (model.types == null || model.types.length === 1)
  );
}

export type ChildSchemaModel = Partial<MetaSchemaModel> &
  Partial<TypeSchemaModel> &
  Partial<ReferenceSchemaModel> &
  Partial<AllOfSchemaModel> &
  Partial<AnyOfSchemaModel> &
  Partial<OneOfSchemaModel> &
  Partial<IfSchemaModel> & {
    parent: SchemaKey;
  };
export const parentSchemaRequired = ["parent"] as const;
export function isChildSchemaModel(model: SchemaItem): model is ChildSchemaModel {
  return hasMembers(model, parentSchemaRequired, [
    ...metaSchemaOptional,
    ...typeSchemaOptional,
    ...referenceSchemaRequired,
    ...allOfSchemaRequired,
    ...anyOfSchemaRequired,
    ...oneOfSchemaRequired,
    ...ifSchemaRequired,
    ...ifSchemaOptional,
  ]);
}

export type ReferenceSchemaModel = Partial<MetaSchemaModel> & {
  reference: SchemaKey;
};
export const referenceSchemaRequired = ["reference"] as const;
export function isReferenceSchemaModel(model: SchemaItem): model is ReferenceSchemaModel {
  return hasMembers(model, referenceSchemaRequired, [...metaSchemaOptional]);
}

export type OneOfSchemaModel = Partial<MetaSchemaModel> & {
  oneOf: SchemaKey[];
};
export const oneOfSchemaRequired = ["oneOf"] as const;
export function isOneOfSchemaModel(model: SchemaItem): model is OneOfSchemaModel {
  return hasMembers(model, oneOfSchemaRequired, [...metaSchemaOptional]);
}

export type AnyOfSchemaModel = Partial<MetaSchemaModel> & {
  anyOf: SchemaKey[];
};
export const anyOfSchemaRequired = ["anyOf"] as const;
export function isAnyOfSchemaModel(model: SchemaItem): model is AnyOfSchemaModel {
  return hasMembers(model, anyOfSchemaRequired, [...metaSchemaOptional]);
}

export type AllOfSchemaModel = Partial<MetaSchemaModel> & {
  allOf: SchemaKey[];
};
export const allOfSchemaRequired = ["allOf"] as const;
export function isAllOfSchemaModel(model: SchemaItem): model is AllOfSchemaModel {
  return hasMembers(model, allOfSchemaRequired, [...metaSchemaOptional]);
}

export type IfSchemaModel = Partial<MetaSchemaModel> & {
  if: SchemaKey;
  then?: SchemaKey;
  else?: SchemaKey;
};
export const ifSchemaRequired = ["if"] as const;
export const ifSchemaOptional = ["then", "else"] as const;
export function isIfSchemaModel(model: SchemaItem): model is IfSchemaModel {
  return hasMembers(model, ifSchemaRequired, [...ifSchemaOptional, ...metaSchemaOptional]);
}

function hasMembers<T>(model: T, required: Iterable<keyof T>, optional: Iterable<keyof T>) {
  const requiredSet = new Set(required);
  const optionalSet = new Set(optional);
  let requiredCount = 0;
  for (const member in model) {
    if (model[member] === undefined) {
      continue;
    }

    if (requiredSet.has(member)) {
      requiredCount++;
      continue;
    }
    if (optionalSet.has(member)) {
      continue;
    }
    return false;
  }
  return requiredCount === requiredSet.size;
}
