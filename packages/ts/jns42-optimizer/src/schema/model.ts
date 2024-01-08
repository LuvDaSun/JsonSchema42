import { isEmpty } from "../utils/index.js";

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
  id?: string;

  alias?: SchemaKey;
  parent?: SchemaKey;

  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;

  types?: SchemaType[];

  reference?: SchemaKey;
  oneOf?: SchemaKey[];
  anyOf?: SchemaKey[];
  allOf?: SchemaKey[];
  if?: SchemaKey;
  then?: SchemaKey;
  else?: SchemaKey;
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
  valuePattern?: string;
  valueFormat?: string;
  minimumItems?: number;
  maximumItems?: number;
  uniqueItems?: boolean;
  minimumProperties?: number;
  maximumProperties?: number;
};

export type SingleTypeSchemaModel = {
  id?: string;
  types: [SchemaType];
  objectProperties?: Record<string, SchemaKey>;
  mapProperties?: SchemaKey;
  patternProperties?: Record<string, SchemaKey>;
  propertyNames?: SchemaKey;
  tupleItems?: SchemaKey[];
  arrayItems?: SchemaKey;
  contains?: SchemaKey;
  required?: string[];
  options?: any[];
};
export function isSingleTypeSchemaModel(model: SchemaModel): model is SingleTypeSchemaModel {
  return hasMembers(
    model,
    new Set(["types"]),
    new Set([
      "id",
      "objectProperties",
      "mapProperties",
      "patternProperties",
      "propertyNames",
      "tupleItems",
      "arrayItems",
      "contains",
      "required",
      "options",
    ]),
  );
}

export type AliasSchemaModel = {
  id?: string;
  alias: SchemaKey;
};
export function isAlias(model: SchemaModel): model is AliasSchemaModel {
  return hasMembers(model, new Set(["alias"]), new Set(["id"]));
}

export type ReferenceSchemaModel = {
  id?: string;
  reference: SchemaKey;
};
export function isReferenceSchemaModel(model: SchemaModel): model is ReferenceSchemaModel {
  return hasMembers(
    model,
    new Set(["reference"]),
    new Set([
      "id",
      "objectProperties",
      "mapProperties",
      "patternProperties",
      "propertyNames",
      "tupleItems",
      "arrayItems",
      "contains",
      "required",
      "options",
    ]),
  );
}

export type OneOfSchemaModel = {
  id?: string;
  oneOf: SchemaKey[];
};
export function isOneOfSchemaModel(model: SchemaModel): model is OneOfSchemaModel {
  return hasMembers(
    model,
    new Set(["oneOf"]),
    new Set([
      "id",
      "objectProperties",
      "mapProperties",
      "patternProperties",
      "propertyNames",
      "tupleItems",
      "arrayItems",
      "contains",
      "required",
      "options",
    ]),
  );
}

export type AnyOfSchemaModel = {
  id?: string;
  anyOf: SchemaKey[];
};
export function isAnyOfSchemaModel(model: SchemaModel): model is AnyOfSchemaModel {
  return hasMembers(
    model,
    new Set(["anyOf"]),
    new Set([
      "id",
      "objectProperties",
      "mapProperties",
      "patternProperties",
      "propertyNames",
      "tupleItems",
      "arrayItems",
      "contains",
      "required",
      "options",
    ]),
  );
}

export type AllOfSchemaModel = {
  id?: string;
  allOf: SchemaKey[];
};
export function isAllOfSchemaModel(model: SchemaModel): model is AllOfSchemaModel {
  return hasMembers(
    model,
    new Set(["allOf"]),
    new Set([
      "id",
      "objectProperties",
      "mapProperties",
      "patternProperties",
      "propertyNames",
      "tupleItems",
      "arrayItems",
      "contains",
      "required",
      "options",
    ]),
  );
}

function hasMembers<T>(model: T, required = new Set<keyof T>(), optional = new Set<keyof T>()) {
  let requiredCount = 0;
  for (const member in model) {
    if (isEmpty(model[member])) {
      continue;
    }

    if (required.has(member)) {
      requiredCount++;
      continue;
    }
    if (optional.has(member)) {
      continue;
    }
    return false;
  }
  return requiredCount === required.size;
}
