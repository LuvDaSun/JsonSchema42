import { SchemaTransform, mergeKeyAllOf, mergeTypes } from "../schema/index.js";
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

  newModel.types = mergeTypes(newModel.types, parentModel.types);
  newModel.options = intersectionMerge(newModel.options, parentModel.options);
  newModel.required = unionMerge(newModel.required, parentModel.required);
  newModel.propertyNames = mergeKeyAllOf(arena, newModel.propertyNames, parentModel.propertyNames);
  newModel.contains = mergeKeyAllOf(arena, newModel.contains, parentModel.contains);
  newModel.tupleItems = mergeKeysArray(
    newModel.tupleItems,
    parentModel.tupleItems,
    (key, otherKey) => mergeKeyAllOf(arena, key, otherKey),
  );
  newModel.arrayItems = mergeKeyAllOf(arena, newModel.arrayItems, parentModel.arrayItems);
  newModel.objectProperties = mergeKeysRecord(
    newModel.objectProperties,
    parentModel.objectProperties,
    (key, otherKey) => mergeKeyAllOf(arena, key, otherKey),
  );
  newModel.mapProperties = mergeKeyAllOf(arena, newModel.mapProperties, parentModel.mapProperties);

  return newModel;
};
