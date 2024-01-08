import { SchemaTransform, intersectionMergeTypes } from "../schema/index.js";
import { intersectionMerge, mergeKeysArray, mergeKeysRecord, unionMerge } from "../utils/index.js";

/**
 * Resolves parent relations
 *
 * This is done by merging some of the parents properties with the current model
 * and then removing the parent relation by setting it to undefined.
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

  newModel.types = intersectionMergeTypes(newModel.types, parentModel.types);
  newModel.options = intersectionMerge(newModel.options, parentModel.options);
  newModel.required = unionMerge(newModel.required, parentModel.required);
  newModel.propertyNames = mergeKey(newModel.propertyNames, parentModel.propertyNames);
  newModel.contains = mergeKey(newModel.contains, parentModel.contains);
  newModel.tupleItems = mergeKeysArray(newModel.tupleItems, parentModel.tupleItems, mergeKey);
  newModel.arrayItems = mergeKey(newModel.arrayItems, parentModel.arrayItems);
  newModel.objectProperties = mergeKeysRecord(
    newModel.objectProperties,
    parentModel.objectProperties,
    mergeKey,
  );
  newModel.mapProperties = mergeKey(newModel.mapProperties, parentModel.mapProperties);

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
