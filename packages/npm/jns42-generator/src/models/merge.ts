import { SchemaArena } from "./arena.js";
import { SchemaType } from "./model.js";

export function intersectionMergeTypes(
  types: SchemaType[] | undefined,
  otherTypes: SchemaType[] | undefined,
): SchemaType[] | undefined {
  if (types === otherTypes) {
    return types;
  }

  if (types == null) {
    return otherTypes;
  }
  if (otherTypes == null) {
    return types;
  }

  if (types.length === 0) {
    return otherTypes;
  }
  if (otherTypes.length === 0) {
    return types;
  }

  if (types.length > 1 || otherTypes.length > 1) {
    throw new TypeError("can only merge single types");
  }

  const [type] = types;
  const [otherType] = otherTypes;

  if (type === "any") {
    return otherTypes;
  }
  if (otherType === "any") {
    return types;
  }

  if (type === otherType) {
    return types;
  }

  return ["never"];
}

export function mergeKeyAllOf(
  arena: SchemaArena,
  key: number | undefined,
  otherKey: number | undefined,
): number | undefined {
  if (key === otherKey) {
    return key;
  }

  if (key == null) {
    return otherKey;
  }
  if (otherKey == null) {
    return key;
  }

  const newModel = {
    allOf: [key, otherKey],
  };
  const newKey = arena.addItem(newModel);
  return newKey;
}

export function mergeKeyAnyOf(
  arena: SchemaArena,
  key: number | undefined,
  otherKey: number | undefined,
): number | undefined {
  if (key === otherKey) {
    return key;
  }

  if (key == null) {
    return otherKey;
  }
  if (otherKey == null) {
    return key;
  }

  const newModel = {
    allOf: [key, otherKey],
  };
  const newKey = arena.addItem(newModel);
  return newKey;
}
