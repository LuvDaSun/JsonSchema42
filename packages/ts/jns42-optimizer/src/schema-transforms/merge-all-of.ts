import {
  SchemaModel,
  SchemaTransform,
  intersectionMergeTypes,
  isSingleTypeSchemaModel,
} from "../schema/index.js";
import { intersectionMerge, mergeKeysArray, mergeKeysRecord, unionMerge } from "../utils/index.js";

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
    const [, subModel] = arena.resolveItem(subModelKey);

    if (!isSingleTypeSchemaModel(subModel)) {
      // we want to only only merge single types
      return model;
    }

    // first pass
    if (newModel == null) {
      newModel = { ...subModel, id };
      continue;
    }

    newModel.types = intersectionMergeTypes(newModel.types, subModel.types);
    newModel.options = intersectionMerge(newModel.options, subModel.options);
    newModel.required = unionMerge(newModel.required, subModel.required);
    newModel.propertyNames = mergeKey(newModel.propertyNames, subModel.propertyNames);
    newModel.contains = mergeKey(newModel.contains, subModel.contains);
    newModel.tupleItems = mergeKeysArray(newModel.tupleItems, subModel.tupleItems, mergeKey);
    newModel.arrayItems = mergeKey(newModel.arrayItems, subModel.arrayItems);
    newModel.objectProperties = mergeKeysRecord(
      newModel.objectProperties,
      subModel.objectProperties,
      mergeKey,
    );
    newModel.mapProperties = mergeKey(newModel.mapProperties, subModel.mapProperties);
  }

  return newModel;

  function mergeKey(key: number | undefined, otherKey: number | undefined): number | undefined {
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
};
