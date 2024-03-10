import { SchemaModel, SchemaTransform, intersectionMergeTypes } from "../models/index.js";
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
export const resolveAllOf: SchemaTransform = (arena, key) => {
  const item = arena.getItem(key);

  // we need at least two to merge
  if (item.allOf == null || item.allOf.length < 2) {
    return;
  }

  if (item.types != null) {
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

  let newItem: SchemaModel = {
    ...item,
    allOf: undefined,
  };

  for (const subKey of item.allOf) {
    let subItem = arena.getItem(subKey);

    if (subItem.types != null && subItem.types.length > 1) {
      return;
    }

    if (subItem.reference != null) {
      return;
    }

    if (subItem.if != null) {
      return;
    }

    if (subItem.then != null) {
      return;
    }

    if (subItem.else != null) {
      return;
    }

    if (subItem.not != null) {
      return;
    }

    if (subItem.oneOf != null && subItem.oneOf.length > 0) {
      return;
    }

    if (subItem.anyOf != null && subItem.anyOf.length > 0) {
      return;
    }

    if (subItem.allOf != null && subItem.allOf.length > 0) {
      return;
    }

    newItem = {
      ...newItem,

      // every item needs to be exact
      exact: booleanMergeAnd(newItem.exact, subItem.exact),

      types: intersectionMergeTypes(newItem.types, subItem.types),
      options: intersectionMerge(newItem.options, subItem.options),
      required: unionMerge(newItem.required, subItem.required),
      propertyNames: mergeKey(newItem.propertyNames, subItem.propertyNames),
      contains: mergeKey(newItem.contains, subItem.contains),
      tupleItems: mergeKeysArray(newItem.tupleItems, subItem.tupleItems, mergeKey),
      arrayItems: mergeKey(newItem.arrayItems, subItem.arrayItems),
      objectProperties: mergeKeysRecord(
        newItem.objectProperties,
        subItem.objectProperties,
        mergeKey,
      ),
      mapProperties: mergeKey(newItem.mapProperties, subItem.mapProperties),

      minimumInclusive: numericMergeMinimum(newItem.minimumInclusive, subItem.minimumInclusive),
      minimumExclusive: numericMergeMinimum(newItem.minimumExclusive, subItem.minimumExclusive),
      maximumInclusive: numericMergeMaximum(newItem.maximumInclusive, subItem.maximumInclusive),
      maximumExclusive: numericMergeMaximum(newItem.maximumExclusive, subItem.maximumExclusive),
      multipleOf: numericMergeMultipleOf(newItem.multipleOf, subItem.multipleOf),
      minimumLength: numericMergeMinimum(newItem.minimumLength, subItem.minimumLength),
      maximumLength: numericMergeMaximum(newItem.maximumLength, subItem.maximumLength),
      valuePattern: unionMerge(newItem.valuePattern, subItem.valuePattern),
      valueFormat: unionMerge(newItem.valueFormat, subItem.valueFormat),
      minimumItems: numericMergeMinimum(newItem.minimumItems, subItem.minimumItems),
      maximumItems: numericMergeMaximum(newItem.maximumItems, subItem.maximumItems),
      uniqueItems: booleanMergeOr(newItem.uniqueItems, subItem.uniqueItems),
      minimumProperties: numericMergeMinimum(newItem.minimumProperties, subItem.minimumProperties),
      maximumProperties: numericMergeMaximum(newItem.maximumProperties, subItem.maximumProperties),
    };
  }

  arena.setItem(key, newItem);

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
