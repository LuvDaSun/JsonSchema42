import {
  SchemaModel,
  SchemaTransform,
  intersectionMergeTypes,
  isAllOfSchemaModel,
  isSingleTypeSchemaModel,
} from "../models/index.js";
import {
  booleanMergeOr,
  intersectionMerge,
  mergeKeysArray,
  mergeKeysRecord,
  numericMergeMaximum,
  numericMergeMinimum,
  numericMergeMultipleOf,
  unionMerge,
} from "../utils/index.js";

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
export const resolveAllOf: SchemaTransform = (arena, modelKey) => {
  const model = arena.getItem(modelKey);

  // we need at least two to merge
  if (!isAllOfSchemaModel(model) || model.allOf.length < 2) {
    return model;
  }

  let newModel!: SchemaModel;
  for (const elementKey of model.allOf) {
    let [, elementModel] = arena.resolveItem(elementKey);

    if (!isSingleTypeSchemaModel(elementModel)) {
      // we want to only only merge single types this is because the intersectionMergeTypes
      // function can only merge single types
      return model;
    }

    // first pass
    if (newModel == null) {
      newModel = {
        ...elementModel,
        allOf: undefined,
        // meta fields
        id: model.id,
        title: model.title,
        description: model.description,
        examples: model.examples,
        deprecated: model.deprecated,
      };
      continue;
    }

    newModel = {
      ...newModel,

      types: intersectionMergeTypes(newModel.types, elementModel.types),
      options: intersectionMerge(newModel.options, elementModel.options),
      required: unionMerge(newModel.required, elementModel.required),
      propertyNames: mergeKey(newModel.propertyNames, elementModel.propertyNames),
      contains: mergeKey(newModel.contains, elementModel.contains),
      tupleItems: mergeKeysArray(newModel.tupleItems, elementModel.tupleItems, mergeKey),
      arrayItems: mergeKey(newModel.arrayItems, elementModel.arrayItems),
      objectProperties: mergeKeysRecord(
        newModel.objectProperties,
        elementModel.objectProperties,
        mergeKey,
      ),
      mapProperties: mergeKey(newModel.mapProperties, elementModel.mapProperties),

      minimumInclusive: numericMergeMinimum(
        newModel.minimumInclusive,
        elementModel.minimumInclusive,
      ),
      minimumExclusive: numericMergeMinimum(
        newModel.minimumExclusive,
        elementModel.minimumExclusive,
      ),
      maximumInclusive: numericMergeMaximum(
        newModel.maximumInclusive,
        elementModel.maximumInclusive,
      ),
      maximumExclusive: numericMergeMaximum(
        newModel.maximumExclusive,
        elementModel.maximumExclusive,
      ),
      multipleOf: numericMergeMultipleOf(newModel.multipleOf, elementModel.multipleOf),
      minimumLength: numericMergeMinimum(newModel.minimumLength, elementModel.minimumLength),
      maximumLength: numericMergeMaximum(newModel.maximumLength, elementModel.maximumLength),
      valuePattern: unionMerge(newModel.valuePattern, elementModel.valuePattern),
      valueFormat: unionMerge(newModel.valueFormat, elementModel.valueFormat),
      minimumItems: numericMergeMinimum(newModel.minimumItems, elementModel.minimumItems),
      maximumItems: numericMergeMaximum(newModel.maximumItems, elementModel.maximumItems),
      uniqueItems: booleanMergeOr(newModel.uniqueItems, elementModel.uniqueItems),
      minimumProperties: numericMergeMinimum(
        newModel.minimumProperties,
        elementModel.minimumProperties,
      ),
      maximumProperties: numericMergeMaximum(
        newModel.maximumProperties,
        elementModel.maximumProperties,
      ),
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
