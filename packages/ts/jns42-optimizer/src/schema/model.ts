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
 * Type for the SchemaModel
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
 * the entire SchemaModel, everything is optional!
 */
export type SchemaModel = {
  alias?: SchemaKey;
  parent?: SchemaKey;

  mockable?: boolean;
  id?: string;
  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;

  reference?: SchemaKey;
  oneOf?: SchemaKey[];
  anyOf?: SchemaKey[];
  allOf?: SchemaKey[];
  if?: SchemaKey;
  then?: SchemaKey;
  else?: SchemaKey;
  not?: SchemaKey;

  types?: SchemaType[];

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

export type MetaSchemaModel = {
  mockable?: boolean;
  id?: string;
  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;
};
export const metaSchemaOptional = [
  "mockable",
  "id",
  "title",
  "description",
  "examples",
  "deprecated",
] as const;
export function isMetaSchemaModel(model: SchemaModel): model is MetaSchemaModel {
  return hasMembers(model, [], metaSchemaOptional);
}

export type TypeSchemaModel = Partial<MetaSchemaModel> &
  Partial<NotSchemaModel> & {
    types?: SchemaType[];
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
export function isTypeSchemaModel(model: SchemaModel): model is TypeSchemaModel {
  return hasMembers(
    model,
    [],
    [...typeSchemaOptional, ...metaSchemaOptional, ...notSchemaRequired],
  );
}

export type SingleTypeSchemaModel = Partial<MetaSchemaModel> &
  Partial<NotSchemaModel> &
  TypeSchemaModel & {
    types?: [SchemaType];
  };
export function isSingleTypeSchemaModel(model: SchemaModel): model is SingleTypeSchemaModel {
  return (
    hasMembers(model, [], [...typeSchemaOptional, ...metaSchemaOptional, ...notSchemaRequired]) &&
    (model.types == null || model.types.length === 1)
  );
}

export type ChildSchemaModel = Partial<MetaSchemaModel> &
  Partial<TypeSchemaModel> &
  Partial<ReferenceSchemaModel> &
  Partial<AllOfSchemaModel> &
  Partial<AnyOfSchemaModel> &
  Partial<OneOfSchemaModel> &
  Partial<IfSchemaModel> &
  Partial<NotSchemaModel> & {
    parent: SchemaKey;
  };
export const parentSchemaRequired = ["parent"] as const;
export function isChildSchemaModel(model: SchemaModel): model is ChildSchemaModel {
  return hasMembers(model, parentSchemaRequired, [
    ...metaSchemaOptional,
    ...typeSchemaOptional,
    ...referenceSchemaRequired,
    ...allOfSchemaRequired,
    ...anyOfSchemaRequired,
    ...oneOfSchemaRequired,
    ...ifSchemaRequired,
    ...ifSchemaOptional,
    ...notSchemaRequired,
  ]);
}

export type AliasSchemaModel = Partial<MetaSchemaModel> &
  Partial<NotSchemaModel> & {
    alias: SchemaKey;
  };
export const aliasSchemaRequired = ["alias"] as const;
export function isAliasSchemaModel(model: SchemaModel): model is AliasSchemaModel {
  return hasMembers(model, aliasSchemaRequired, [...metaSchemaOptional, ...notSchemaRequired]);
}

export type ReferenceSchemaModel = Partial<MetaSchemaModel> &
  Partial<NotSchemaModel> & {
    reference: SchemaKey;
  };
export const referenceSchemaRequired = ["reference"] as const;
export function isReferenceSchemaModel(model: SchemaModel): model is ReferenceSchemaModel {
  return hasMembers(model, referenceSchemaRequired, [...metaSchemaOptional, ...notSchemaRequired]);
}

export type OneOfSchemaModel = Partial<MetaSchemaModel> &
  Partial<NotSchemaModel> & {
    oneOf: SchemaKey[];
  };
export const oneOfSchemaRequired = ["oneOf"] as const;
export function isOneOfSchemaModel(model: SchemaModel): model is OneOfSchemaModel {
  return hasMembers(model, oneOfSchemaRequired, [...metaSchemaOptional, ...notSchemaRequired]);
}

export type AnyOfSchemaModel = Partial<MetaSchemaModel> &
  Partial<NotSchemaModel> & {
    anyOf: SchemaKey[];
  };
export const anyOfSchemaRequired = ["anyOf"] as const;
export function isAnyOfSchemaModel(model: SchemaModel): model is AnyOfSchemaModel {
  return hasMembers(model, anyOfSchemaRequired, [...metaSchemaOptional, ...notSchemaRequired]);
}

export type AllOfSchemaModel = Partial<MetaSchemaModel> &
  Partial<NotSchemaModel> & {
    allOf: SchemaKey[];
  };
export const allOfSchemaRequired = ["allOf"] as const;
export function isAllOfSchemaModel(model: SchemaModel): model is AllOfSchemaModel {
  return hasMembers(model, allOfSchemaRequired, [...metaSchemaOptional, ...notSchemaRequired]);
}

export type IfSchemaModel = Partial<MetaSchemaModel> &
  Partial<NotSchemaModel> & {
    if: SchemaKey;
    then?: SchemaKey;
    else?: SchemaKey;
  };
export const ifSchemaRequired = ["if"] as const;
export const ifSchemaOptional = ["then", "else"] as const;
export function isIfSchemaModel(model: SchemaModel): model is IfSchemaModel {
  return hasMembers(model, ifSchemaRequired, [
    ...ifSchemaOptional,
    ...metaSchemaOptional,
    ...notSchemaRequired,
  ]);
}

export type NotSchemaModel = Partial<MetaSchemaModel> & {
  not: SchemaKey;
};
export const notSchemaRequired = ["not"] as const;
export function isNotSchemaModel(model: SchemaModel): model is NotSchemaModel {
  return hasMembers(model, notSchemaRequired, metaSchemaOptional);
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
