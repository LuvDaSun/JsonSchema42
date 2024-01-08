/*
There is one big model that is the SchemaModel. All properties of the schema are here. Then  there
are quite a few states of the schema model. These states are a subset of the properties of the
SchemaModel. The optimizer algorithms change the SchemaModel into another state until a state is
reached that can be transormed into a generator model.
*/

/**
 * Key for referencing other schemas
 */
export type SchemaKey = number;
/**
 * Type for the SchmaModel
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
 * the entire SchemaModel, everyting is optional!
 */
export type SchemaModel = {
  alias?: SchemaKey;
  parent?: SchemaKey;

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
  valuePattern?: string;
  valueFormat?: string;
  minimumItems?: number;
  maximumItems?: number;
  uniqueItems?: boolean;
  minimumProperties?: number;
  maximumProperties?: number;
};

export type MetaSchemaModel = {
  id?: string;
  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;
};
const metaSchemaOptional = ["id", "title", "description", "examples", "deprecated"] as const;
export function isMetaSchemaModel(model: SchemaModel): model is MetaSchemaModel {
  return hasMembers(model, [], metaSchemaOptional);
}

export type TypeSchemaModel = {
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
  valuePattern?: string;
  valueFormat?: string;
  minimumItems?: number;
  maximumItems?: number;
  uniqueItems?: boolean;
  minimumProperties?: number;
  maximumProperties?: number;
};
const typeSchemaOptional = [
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
  return hasMembers(model, [], [...typeSchemaOptional, ...metaSchemaOptional]);
}

export type SingleTypeSchemaModel = Partial<TypeSchemaModel & MetaSchemaModel> & {
  types: [SchemaType];
};
const singleTypeSchemaRequired = ["types"] as const;
export function isSingleTypeSchemaModel(model: SchemaModel): model is SingleTypeSchemaModel {
  return (
    hasMembers(model, singleTypeSchemaRequired, [...typeSchemaOptional, ...metaSchemaOptional]) &&
    model.types!.length == 1
  );
}

export type ChildSchemaModel = Partial<
  TypeSchemaModel &
    MetaSchemaModel &
    ReferenceSchemaModel &
    AllOfSchemaModel &
    AnyOfSchemaModel &
    OneOfSchemaModel &
    IfSchemaModel &
    NotSchemaModel
> & {
  parent: SchemaKey;
};
const parentSchemaRequired = ["parent"] as const;
export function isChildSchemaModel(model: SchemaModel): model is ChildSchemaModel {
  return hasMembers(model, parentSchemaRequired, [
    ...typeSchemaOptional,
    ...metaSchemaOptional,
    ...referenceSchemaRequired,
    ...allOfSchemaRequired,
    ...anyOfSchemaRequired,
    ...oneOfSchemaRequired,
    ...ifSchemaRequired,
    ...ifSchemaOptional,
    ...notSchemaRequired,
  ]);
}

export type AliasSchemaModel = Partial<MetaSchemaModel> & {
  alias: SchemaKey;
};
const aliasSchemaRequired = ["alias"] as const;
export function isAliasSchemaModel(model: SchemaModel): model is AliasSchemaModel {
  return hasMembers(model, aliasSchemaRequired, metaSchemaOptional);
}

export type ReferenceSchemaModel = Partial<MetaSchemaModel> & {
  reference: SchemaKey;
};
const referenceSchemaRequired = ["reference"] as const;
export function isReferenceSchemaModel(model: SchemaModel): model is ReferenceSchemaModel {
  return hasMembers(model, referenceSchemaRequired, metaSchemaOptional);
}

export type OneOfSchemaModel = Partial<MetaSchemaModel> & {
  oneOf: SchemaKey[];
};
const oneOfSchemaRequired = ["oneOf"] as const;
export function isOneOfSchemaModel(model: SchemaModel): model is OneOfSchemaModel {
  return hasMembers(model, oneOfSchemaRequired, metaSchemaOptional);
}

export type AnyOfSchemaModel = Partial<MetaSchemaModel> & {
  anyOf: SchemaKey[];
};
const anyOfSchemaRequired = ["anyOf"] as const;
export function isAnyOfSchemaModel(model: SchemaModel): model is AnyOfSchemaModel {
  return hasMembers(model, anyOfSchemaRequired, metaSchemaOptional);
}

export type AllOfSchemaModel = Partial<MetaSchemaModel> & {
  allOf: SchemaKey[];
};
const allOfSchemaRequired = ["allOf"] as const;
export function isAllOfSchemaModel(model: SchemaModel): model is AllOfSchemaModel {
  return hasMembers(model, allOfSchemaRequired, metaSchemaOptional);
}

export type IfSchemaModel = Partial<MetaSchemaModel> & {
  if: SchemaKey;
  then?: SchemaKey;
  else?: SchemaKey;
};
const ifSchemaRequired = ["id"] as const;
const ifSchemaOptional = ["then", "else"] as const;
export function isIfSchemaModel(model: SchemaModel): model is IfSchemaModel {
  return hasMembers(model, ifSchemaRequired, [...ifSchemaOptional, ...metaSchemaOptional]);
}

export type NotSchemaModel = Partial<MetaSchemaModel> & {
  not: SchemaKey;
};
const notSchemaRequired = ["not"] as const;
export function isNotSchemaModel(model: SchemaModel): model is NotSchemaModel {
  return hasMembers(model, [], notSchemaRequired);
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
