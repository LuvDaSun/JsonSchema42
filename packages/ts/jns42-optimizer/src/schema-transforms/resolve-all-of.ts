import {
  SchemaModel,
  SchemaTransform,
  intersectionMergeTypes,
  isAllOfSchemaModel,
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
export const resolveAllOf: SchemaTransform = (arena, model, modelKey) => {
  // we need at least two to merge
  if (!isAllOfSchemaModel(model) || model.allOf.length < 2) {
    return model;
  }

  let newModel!: SchemaModel;
  for (const subKey of model.allOf) {
    const [, subModel] = arena.resolveItem(subKey);

    if (!isSingleTypeSchemaModel(subModel)) {
      // we want to only only merge single types this is because the intersectionMergeTypes
      // function can only merge single types
      return model;
    }

    // first pass
    if (newModel == null) {
      newModel = { ...subModel, ...model, allOf: undefined };
      continue;
    }

    newModel = {
      ...newModel,
      types: intersectionMergeTypes(newModel.types, subModel.types),
      options: intersectionMerge(newModel.options, subModel.options),
      required: unionMerge(newModel.required, subModel.required),
      propertyNames: mergeKey(newModel.propertyNames, subModel.propertyNames),
      contains: mergeKey(newModel.contains, subModel.contains),
      tupleItems: mergeKeysArray(newModel.tupleItems, subModel.tupleItems, mergeKey),
      arrayItems: mergeKey(newModel.arrayItems, subModel.arrayItems),
      objectProperties: mergeKeysRecord(
        newModel.objectProperties,
        subModel.objectProperties,
        mergeKey,
      ),
      mapProperties: mergeKey(newModel.mapProperties, subModel.mapProperties),
    };
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