import {
  SchemaModel,
  SchemaTransform,
  intersectionMergeTypes,
  isChildSchemaModel,
} from "../models/index.js";
import {
  booleanMergeAnd,
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
 * Resolves parent relations
 *
 * This is done by merging some of the parents properties with the current model
 * and then removing the parent relation by setting it to undefined.
 *
 */
export const resolveParent: SchemaTransform = (arena, model, modelKey) => {
  // we need to have a parent, we need to be a child
  if (!isChildSchemaModel(model)) {
    return model;
  }

  const [, parentModel] = arena.resolveItem(model.parent);

  // we don't want the parent to be a child (aka have a parent)
  if (isChildSchemaModel(parentModel)) {
    return model;
  }

  const newModel: SchemaModel = {
    ...model,
    parent: undefined,
    not: mergeKey(model.not, parentModel.not),
    mockable: booleanMergeAnd(model.mockable, parentModel.mockable),

    types: intersectionMergeTypes(model.types, parentModel.types),
    options: intersectionMerge(model.options, parentModel.options),
    required: unionMerge(model.required, parentModel.required),
    propertyNames: mergeKey(model.propertyNames, parentModel.propertyNames),
    contains: mergeKey(model.contains, parentModel.contains),
    tupleItems: mergeKeysArray(model.tupleItems, parentModel.tupleItems, mergeKey),
    arrayItems: mergeKey(model.arrayItems, parentModel.arrayItems),
    objectProperties: mergeKeysRecord(
      model.objectProperties,
      parentModel.objectProperties,
      mergeKey,
    ),
    mapProperties: mergeKey(model.mapProperties, parentModel.mapProperties),

    minimumInclusive: numericMergeMinimum(model.minimumInclusive, parentModel.minimumInclusive),
    minimumExclusive: numericMergeMinimum(model.minimumExclusive, parentModel.minimumExclusive),
    maximumInclusive: numericMergeMaximum(model.maximumInclusive, parentModel.maximumInclusive),
    maximumExclusive: numericMergeMaximum(model.maximumExclusive, parentModel.maximumExclusive),
    multipleOf: numericMergeMultipleOf(model.multipleOf, parentModel.multipleOf),
    minimumLength: numericMergeMinimum(model.minimumLength, parentModel.minimumLength),
    maximumLength: numericMergeMaximum(model.maximumLength, parentModel.maximumLength),
    valuePattern: unionMerge(model.valuePattern, parentModel.valuePattern),
    valueFormat: unionMerge(model.valueFormat, parentModel.valueFormat),
    minimumItems: numericMergeMinimum(model.minimumItems, parentModel.minimumItems),
    maximumItems: numericMergeMaximum(model.maximumItems, parentModel.maximumItems),
    uniqueItems: booleanMergeOr(model.uniqueItems, parentModel.uniqueItems),
    minimumProperties: numericMergeMinimum(model.minimumProperties, parentModel.minimumProperties),
    maximumProperties: numericMergeMaximum(model.maximumProperties, parentModel.maximumProperties),
  };

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
