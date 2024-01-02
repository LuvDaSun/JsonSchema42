import { SchemaArena, SchemaModel, SchemaModelType, SchemaTransform } from "../schema/index.js";
import { intersectionMerge, unionMerge } from "../utils/index.js";

/**
 * This transformer merges all sub schemas in allOf.
 *
 * ```yaml
 * - allOf
 *   - required: ["a", "b"]
 *     objectProperties:
 *       a: 100
 *       b: 200
 *   - objectProperties:
 *       b: 300
 *       c: 400
 * ```
 *
 * will become
 *
 * ```yaml
 * - required: ["a", "b"]
 *   objectProperties:
 *     a: 100
 *     b: 1
 *     c: 400
 * - allOf
 *   - 200
 *   - 300
 * ```
 */
export const mergeAllOf: SchemaTransform = (arena, model, modelKey) => {
  // we need at least two to merge
  if (model.allOf == null || model.allOf.length < 2) {
    return model;
  }

  const { id } = model;

  let newModel!: SchemaModel;
  for (const subModelKey of model.allOf) {
    const [resolvedSubModelKey, subModel] = arena.resolveItem(subModelKey);

    if (subModel.types != null && subModel.types.length > 1) {
      // we want to only only merge single types
      return model;
    }

    if (newModel == null) {
      newModel = { ...subModel, id };
      continue;
    }

    newModel.types = mergeTypes(newModel.types, subModel.types);
    newModel.options = intersectionMerge(newModel.options, subModel.options);
    newModel.required = unionMerge(newModel.required, subModel.required);
    newModel.propertyNames = mergeKey(arena, newModel.propertyNames, subModel.propertyNames);
    newModel.contains = mergeKey(arena, newModel.contains, subModel.contains);
    newModel.tupleItems = mergeKeysArray(arena, newModel.tupleItems, subModel.tupleItems);
    newModel.arrayItems = mergeKey(arena, newModel.arrayItems, subModel.arrayItems);
    newModel.objectProperties = mergeKeysRecord(
      arena,
      newModel.objectProperties,
      subModel.objectProperties,
    );
    newModel.mapProperties = mergeKey(arena, newModel.mapProperties, subModel.mapProperties);
  }

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
