import assert from "assert";
import { SchemaArena, SchemaModel, SchemaTransform, isAnyOf, isType } from "../schema/index.js";
import { intersectionMerge } from "../utils/index.js";

export const mergeAnyOf: SchemaTransform = (arena, model, modelKey) => {
  if (!isAnyOf(model) || model.anyOf.length < 2) {
    return model;
  }

  const { id } = model;

  const oneOfElements = new Array<number>();

  const groupedElements: { [type: string]: number[] } = {};
  for (const elementKey of model.anyOf) {
    const [, elementModel] = arena.resolveItem(elementKey);

    if (!isType(elementModel)) {
      return model;
    }

    groupedElements[elementModel.types[0]] ??= [];
    groupedElements[elementModel.types[0]].push(elementKey);
  }

  for (const [type, subKeys] of Object.entries(groupedElements)) {
    if (subKeys.length < 2) {
      for (const subKey of subKeys) {
        oneOfElements.push(subKey);
      }
      continue;
    }

    let newModel!: SchemaModel;
    for (const subKey of subKeys) {
      const [, subModel] = arena.resolveItem(subKey);

      // this will never happen because of the isType guard earlier
      assert(isType(subModel));

      // first pass
      if (newModel == null) {
        newModel = { ...subModel };
        continue;
      }

      newModel.options = intersectionMerge(newModel.options, subModel.options);
      newModel.required = intersectionMerge(newModel.required, subModel.required);
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

    const newKey = arena.addItem(newModel);
    oneOfElements.push(newKey);
  }

  return {
    id,
    oneOf: oneOfElements,
  };
};

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
    anyOf: [key, otherKey],
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
