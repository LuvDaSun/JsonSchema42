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
