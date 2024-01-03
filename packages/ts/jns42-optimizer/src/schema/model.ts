export type SchemaModelKey = number;
export type SchemaModelType =
  | "never"
  | "any"
  | "null"
  | "boolean"
  | "integer"
  | "number"
  | "string"
  | "array"
  | "map";

export type SchemaModel = {
  $schema?: string;
  id?: string;

  alias?: SchemaModelKey;
  parent?: SchemaModelKey;

  title?: string;
  description?: string;
  examples?: any[];
  deprecated?: boolean;

  types?: SchemaModelType[];

  reference?: SchemaModelKey;
  oneOf?: SchemaModelKey[];
  anyOf?: SchemaModelKey[];
  allOf?: SchemaModelKey[];
  if?: SchemaModelKey;
  then?: SchemaModelKey;
  else?: SchemaModelKey;
  not?: SchemaModelKey;
  dependentSchemas?: Record<string, SchemaModelKey>;
  objectProperties?: Record<string, SchemaModelKey>;
  mapProperties?: SchemaModelKey;
  patternProperties?: Record<string, SchemaModelKey>;
  propertyNames?: SchemaModelKey;
  tupleItems?: SchemaModelKey[];
  arrayItems?: SchemaModelKey;
  contains?: SchemaModelKey;
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

export type TypeModel = {
  id?: string;
  types: [SchemaModelType];
  objectProperties?: Record<string, SchemaModelKey>;
  mapProperties?: SchemaModelKey;
  patternProperties?: Record<string, SchemaModelKey>;
  propertyNames?: SchemaModelKey;
  tupleItems?: SchemaModelKey[];
  arrayItems?: SchemaModelKey;
  contains?: SchemaModelKey;
  required?: string[];
  options?: any[];
};
export function isType(model: SchemaModel): model is TypeModel {
  return hasMembers(
    model,
    new Set(["types"]),
    new Set([
      "$schema",
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

export type AliasModel = {
  id?: string;
  alias: SchemaModelKey;
};
export function isAlias(model: SchemaModel): model is AliasModel {
  return hasMembers(model, new Set(["alias"]), new Set(["id"]));
}

export type ReferenceModel = {
  id?: string;
  reference: SchemaModelKey;
};
export function isReference(model: SchemaModel): model is ReferenceModel {
  return hasMembers(
    model,
    new Set(["reference"]),
    new Set([
      "$schema",
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

export type OneOfModel = {
  id?: string;
  oneOf: SchemaModelKey[];
};
export function isOneOf(model: SchemaModel): model is OneOfModel {
  return hasMembers(
    model,
    new Set(["oneOf"]),
    new Set([
      "$schema",
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

export type AnyOfModel = {
  id?: string;
  anyOf: SchemaModelKey[];
};
export function isAnyOf(model: SchemaModel): model is AnyOfModel {
  return hasMembers(
    model,
    new Set(["anyOf"]),
    new Set([
      "$schema",
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

export type AllOfModel = {
  id?: string;
  allOf: SchemaModelKey[];
};
export function isAllOf(model: SchemaModel): model is AllOfModel {
  return hasMembers(
    model,
    new Set(["allOf"]),
    new Set([
      "$schema",
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
    if (model[member] === undefined) {
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
