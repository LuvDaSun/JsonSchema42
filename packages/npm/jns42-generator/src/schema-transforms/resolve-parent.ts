import { SchemaItem, SchemaTransform, intersectionMergeTypes } from "../models/index.js";
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
 * Resolves parent relations
 *
 * This is done by merging some of the parents properties with the current model
 * and then removing the parent relation by setting it to undefined.
 *
 */
export const resolveParent: SchemaTransform = (arena, key) => {
  const item = arena.getItem(key);

  // we need to have a parent, we need to be a child
  if (item.parent == null) {
    return;
  }

  if (item.types != null && item.types.length > 1) {
    return;
  }

  if (item.reference != null) {
    return;
  }

  if (item.if != null) {
    return;
  }

  if (item.then != null) {
    return;
  }

  if (item.else != null) {
    return;
  }

  if (item.not != null) {
    return;
  }

  if (item.oneOf != null && item.oneOf.length > 0) {
    return;
  }

  if (item.anyOf != null && item.anyOf.length > 0) {
    return;
  }

  if (item.allOf != null && item.allOf.length > 0) {
    return;
  }

  const parentItem = arena.getItem(item.parent);

  // we don't want the parent to be a child (aka have a parent)
  if (parentItem.parent == null) {
    return item;
  }

  if (parentItem.types != null && parentItem.types.length > 1) {
    return;
  }

  if (parentItem.reference != null) {
    return;
  }

  if (parentItem.if != null) {
    return;
  }

  if (parentItem.then != null) {
    return;
  }

  if (parentItem.else != null) {
    return;
  }

  if (parentItem.not != null) {
    return;
  }

  if (parentItem.oneOf != null && parentItem.oneOf.length > 0) {
    return;
  }

  if (parentItem.anyOf != null && parentItem.anyOf.length > 0) {
    return;
  }

  if (parentItem.allOf != null && parentItem.allOf.length > 0) {
    return;
  }

  const itemNew: SchemaItem = {
    ...item,
    parent: undefined,

    types: intersectionMergeTypes(item.types, parentItem.types),
    options: intersectionMerge(item.options, parentItem.options),
    required: unionMerge(item.required, parentItem.required),
    propertyNames: mergeKey(item.propertyNames, parentItem.propertyNames),
    contains: mergeKey(item.contains, parentItem.contains),
    tupleItems: mergeKeysArray(item.tupleItems, parentItem.tupleItems, mergeKey),
    arrayItems: mergeKey(item.arrayItems, parentItem.arrayItems),
    objectProperties: mergeKeysRecord(item.objectProperties, parentItem.objectProperties, mergeKey),
    mapProperties: mergeKey(item.mapProperties, parentItem.mapProperties),

    minimumInclusive: numericMergeMinimum(item.minimumInclusive, parentItem.minimumInclusive),
    minimumExclusive: numericMergeMinimum(item.minimumExclusive, parentItem.minimumExclusive),
    maximumInclusive: numericMergeMaximum(item.maximumInclusive, parentItem.maximumInclusive),
    maximumExclusive: numericMergeMaximum(item.maximumExclusive, parentItem.maximumExclusive),
    multipleOf: numericMergeMultipleOf(item.multipleOf, parentItem.multipleOf),
    minimumLength: numericMergeMinimum(item.minimumLength, parentItem.minimumLength),
    maximumLength: numericMergeMaximum(item.maximumLength, parentItem.maximumLength),
    valuePattern: unionMerge(item.valuePattern, parentItem.valuePattern),
    valueFormat: unionMerge(item.valueFormat, parentItem.valueFormat),
    minimumItems: numericMergeMinimum(item.minimumItems, parentItem.minimumItems),
    maximumItems: numericMergeMaximum(item.maximumItems, parentItem.maximumItems),
    uniqueItems: booleanMergeOr(item.uniqueItems, parentItem.uniqueItems),
    minimumProperties: numericMergeMinimum(item.minimumProperties, parentItem.minimumProperties),
    maximumProperties: numericMergeMaximum(item.maximumProperties, parentItem.maximumProperties),
  };

  arena.setItem(key, itemNew);

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

    const itemNew = {
      allOf: [key, otherKey],
    };
    const keyNew = arena.addItem(itemNew);
    return keyNew;
  }
};
