import { hasProperties } from "./utils/index.js";

export type Item = Partial<Alias & OneOf & AnyOf & AllOf & Type>;

export interface Base {
  id?: string;
  required?: string[];
  tupleElements?: number[];
  arrayElement?: number;
  objectProperties?: { [name: string]: number };
  propertyName?: number;
  mapElement?: number;
}

const optionalBaseProperties = new Array<keyof Base>(
  "id",
  "required",
  "tupleElements",
  "arrayElement",
  "objectProperties",
  "propertyName",
  "mapElement",
);

export interface Alias extends Base {
  id?: string;
  alias: number;
}
export function isAlias(item: Item): item is Alias {
  if (!("alias" in item)) {
    return false;
  }
  return hasProperties(item, ["alias"], optionalBaseProperties);
}

export interface OneOf extends Base {
  oneOf: number[];
}
export function isOneOf(item: Item): item is OneOf {
  if (!("oneOf" in item)) {
    return false;
  }
  return hasProperties(item, ["oneOf"], optionalBaseProperties);
}

export interface AnyOf extends Base {
  anyOf: number[];
}
export function isAnyOf(item: Item): item is AnyOf {
  if (!("anyOf" in item)) {
    return false;
  }
  return hasProperties(item, ["anyOf"], optionalBaseProperties);
}

export interface AllOf extends Base {
  allOf: number[];
}
export function isAllOf(item: Item): item is AllOf {
  if (!("allOf" in item)) {
    return false;
  }
  return hasProperties(item, ["allOf"], optionalBaseProperties);
}

export interface Type extends Base {
  type:
    | "unknown"
    | "never"
    | "any"
    | "null"
    | "boolean"
    | "integer"
    | "number"
    | "string"
    | "tuple"
    | "array"
    | "object"
    | "map";
}
export function isType(item: Item): item is Type {
  if (!("type" in item)) {
    return false;
  }
  return hasProperties(item, ["type"], optionalBaseProperties);
}

/**
 * retrieves depenencies of a type item or alias
 *
 * @param item the type to get dependencies
 */
export function* dependencies(item: Item) {
  if (item.alias != null) {
    yield item.alias;
  }

  if (item.oneOf != null) {
    yield* item.oneOf;
  }

  if (item.anyOf != null) {
    yield* item.anyOf;
  }

  if (item.allOf != null) {
    yield* item.allOf;
  }

  if (item.tupleElements != null) {
    yield* item.tupleElements;
  }

  if (item.arrayElement != null) {
    yield item.arrayElement;
  }

  if (item.objectProperties != null) {
    yield* Object.values(item.objectProperties).map((element) => element);
  }

  if (item.propertyName != null) {
    yield item.propertyName;
  }

  if (item.mapElement != null) {
    yield item.mapElement;
  }
}
