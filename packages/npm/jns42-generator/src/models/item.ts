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
  | "object";

/**
 * the entire SchemaItem, everything is optional!
 */
export type SchemaItem = {
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
