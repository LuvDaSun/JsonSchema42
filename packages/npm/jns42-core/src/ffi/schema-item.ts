import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export class SchemaItemProxy {
  constructor(private readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);
  }

  [Symbol.dispose]() {
    mainFfi.exports.schema_item_drop(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.schema_item_new();
    return new SchemaItemProxy(pointer);
  }
}

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
  // is this model exactly the same as the previous, un-optimized version or is is just similar
  exact?: boolean;
  primart?: boolean;
  name?: string;

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
