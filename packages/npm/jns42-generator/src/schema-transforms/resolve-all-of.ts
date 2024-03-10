import { SchemaItem, SchemaTransform, intersectionMergeTypes } from "../models/index.js";
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

  let itemNew: SchemaItem = {
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

    itemNew = {
      ...itemNew,

      // every item needs to be exact
      exact: booleanMergeAnd(itemNew.exact, subItem.exact),

      types: intersectionMergeTypes(itemNew.types, subItem.types),
      options: intersectionMerge(itemNew.options, subItem.options),
      required: unionMerge(itemNew.required, subItem.required),
      propertyNames: mergeKey(itemNew.propertyNames, subItem.propertyNames),
      contains: mergeKey(itemNew.contains, subItem.contains),
      tupleItems: mergeKeysArray(itemNew.tupleItems, subItem.tupleItems, mergeKey),
      arrayItems: mergeKey(itemNew.arrayItems, subItem.arrayItems),
      objectProperties: mergeKeysRecord(
        itemNew.objectProperties,
        subItem.objectProperties,
        mergeKey,
      ),
      mapProperties: mergeKey(itemNew.mapProperties, subItem.mapProperties),

      minimumInclusive: numericMergeMinimum(itemNew.minimumInclusive, subItem.minimumInclusive),
      minimumExclusive: numericMergeMinimum(itemNew.minimumExclusive, subItem.minimumExclusive),
      maximumInclusive: numericMergeMaximum(itemNew.maximumInclusive, subItem.maximumInclusive),
      maximumExclusive: numericMergeMaximum(itemNew.maximumExclusive, subItem.maximumExclusive),
      multipleOf: numericMergeMultipleOf(itemNew.multipleOf, subItem.multipleOf),
      minimumLength: numericMergeMinimum(itemNew.minimumLength, subItem.minimumLength),
      maximumLength: numericMergeMaximum(itemNew.maximumLength, subItem.maximumLength),
      valuePattern: unionMerge(itemNew.valuePattern, subItem.valuePattern),
      valueFormat: unionMerge(itemNew.valueFormat, subItem.valueFormat),
      minimumItems: numericMergeMinimum(itemNew.minimumItems, subItem.minimumItems),
      maximumItems: numericMergeMaximum(itemNew.maximumItems, subItem.maximumItems),
      uniqueItems: booleanMergeOr(itemNew.uniqueItems, subItem.uniqueItems),
      minimumProperties: numericMergeMinimum(itemNew.minimumProperties, subItem.minimumProperties),
      maximumProperties: numericMergeMaximum(itemNew.maximumProperties, subItem.maximumProperties),
    };
  }

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
