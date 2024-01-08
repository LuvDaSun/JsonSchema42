import { SchemaArena, SchemaTransform, SchemaType } from "../schema/index.js";
import { intersectionMerge, unionMerge } from "../utils/index.js";

/**
 * Resolves parent relations
 *
 */
export const mergeParent: SchemaTransform = (arena, model, modelKey) => {
  // we need a parent
  if (model.parent == null) {
    return model;
  }

  const [, parentModel] = arena.resolveItem(model.parent);

  // we don't want the parent to have a parent
  if (parentModel.parent != null) {
    return model;
  }

  const newModel = { ...model };
  delete newModel.parent;

  newModel.types = mergeTypes(newModel.types, parentModel.types);
  newModel.options = intersectionMerge(newModel.options, parentModel.options);
  newModel.required = unionMerge(newModel.required, parentModel.required);
  newModel.propertyNames = mergeKeyAllOf(arena, newModel.propertyNames, parentModel.propertyNames);
  newModel.contains = mergeKeyAllOf(arena, newModel.contains, parentModel.contains);
  newModel.tupleItems = mergeKeysArray(
    arena,
    newModel.tupleItems,
    parentModel.tupleItems,
    mergeKeyAllOf,
  );
  newModel.arrayItems = mergeKeyAllOf(arena, newModel.arrayItems, parentModel.arrayItems);
  newModel.objectProperties = mergeKeysRecord(
    arena,
    newModel.objectProperties,
    parentModel.objectProperties,
    mergeKeyAllOf,
  );
  newModel.mapProperties = mergeKeyAllOf(arena, newModel.mapProperties, parentModel.mapProperties);

  return newModel;
};

function mergeTypes(
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
function mergeKeyAllOf(
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

function mergeKeysArray(
  arena: SchemaArena,
  keys: number[] | undefined,
  otherKeys: number[] | undefined,
  mergeKey: (
    arena: SchemaArena,
    key: number | undefined,
    otherKey: number | undefined,
  ) => number | undefined,
): number[] | undefined {
  if (keys === otherKeys) {
    return keys;
  }

  if (keys == null) {
    return otherKeys;
  }

  if (otherKeys == null) {
    return keys;
  }

  const resultKeys = new Array<number>();
  const length = Math.max(keys.length, otherKeys.length);
  for (let index = 0; index < length; index++) {
    const key = mergeKey(arena, keys[index], otherKeys[index]);
    if (key == null) {
      continue;
    }
    resultKeys.push(key);
  }
  return resultKeys;
}

function mergeKeysRecord(
  arena: SchemaArena,
  keys: Record<string, number> | undefined,
  otherKeys: Record<string, number> | undefined,
  mergeKey: (
    arena: SchemaArena,
    key: number | undefined,
    otherKey: number | undefined,
  ) => number | undefined,
): Record<string, number> | undefined {
  if (keys === otherKeys) {
    return keys;
  }

  if (keys == null) {
    return otherKeys;
  }

  if (otherKeys == null) {
    return keys;
  }

  const resultKeys: Record<string, number> = {};
  const propertyNames = new Set([...Object.keys(keys), ...Object.keys(otherKeys)]);
  for (const propertyName of propertyNames) {
    const key = mergeKey(arena, keys[propertyName], otherKeys[propertyName]);
    if (key == null) {
      continue;
    }
    resultKeys[propertyName] = key;
  }
  return resultKeys;
}
