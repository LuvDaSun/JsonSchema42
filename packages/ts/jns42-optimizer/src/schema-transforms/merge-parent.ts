import { SchemaArena, SchemaModelType, SchemaTransform } from "../schema/index.js";

/**
 * Merges and resolves parent relations
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

  return newModel;
};

function mergeTypes(types: undefined, otherTypes: undefined): undefined;
function mergeTypes(
  types: SchemaModelType[],
  otherTypes: SchemaModelType[] | undefined,
): SchemaModelType[];
function mergeTypes(
  types: SchemaModelType[] | undefined,
  otherTypes: SchemaModelType[],
): SchemaModelType[];
function mergeTypes(
  types: SchemaModelType[] | undefined,
  otherTypes: SchemaModelType[] | undefined,
): SchemaModelType[] | undefined;
function mergeTypes(
  types: SchemaModelType[] | undefined,
  otherTypes: SchemaModelType[] | undefined,
): SchemaModelType[] | undefined {
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

function mergeKey(arena: SchemaArena, key: undefined, otherKey: undefined): undefined;
function mergeKey(arena: SchemaArena, key: number, otherKey: number | undefined): number;
function mergeKey(arena: SchemaArena, key: number | undefined, otherKey: number): number;
function mergeKey(
  arena: SchemaArena,
  key: number | undefined,
  otherKey: number | undefined,
): number | undefined;
function mergeKey(
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

function mergeKeysArray(arena: SchemaArena, keys: undefined, otherKeys: undefined): undefined;
function mergeKeysArray(
  arena: SchemaArena,
  keys: number[],
  otherKeys: number[] | undefined,
): number[];
function mergeKeysArray(
  arena: SchemaArena,
  keys: number[] | undefined,
  otherKeys: number[],
): number[];
function mergeKeysArray(
  arena: SchemaArena,
  keys: number[] | undefined,
  otherKeys: number[] | undefined,
): number[] | undefined;
function mergeKeysArray(
  arena: SchemaArena,
  keys: number[] | undefined,
  otherKeys: number[] | undefined,
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
    resultKeys.push(mergeKey(arena, keys[index], otherKeys[index]));
  }
  return resultKeys;
}

function mergeKeysRecord(arena: SchemaArena, keys: undefined, otherKeys: undefined): undefined;
function mergeKeysRecord(
  arena: SchemaArena,
  keys: Record<string, number> | undefined,
  otherKeys: Record<string, number>,
): Record<string, number>;
function mergeKeysRecord(
  arena: SchemaArena,
  keys: Record<string, number>,
  otherKeys: Record<string, number> | undefined,
): Record<string, number>;
function mergeKeysRecord(
  arena: SchemaArena,
  keys: Record<string, number> | undefined,
  otherKeys: Record<string, number> | undefined,
): Record<string, number> | undefined;
function mergeKeysRecord(
  arena: SchemaArena,
  keys: Record<string, number> | undefined,
  otherKeys: Record<string, number> | undefined,
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
    resultKeys[propertyName] = mergeKey(arena, keys[propertyName], otherKeys[propertyName]);
  }
  return resultKeys;
}
