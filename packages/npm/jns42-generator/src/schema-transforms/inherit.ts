import { SchemaTransform, intersectionMergeTypes } from "../models/index.js";
import {
  booleanMergeOr,
  deepEqual,
  intersectionMerge,
  mergeKeysArray,
  mergeKeysRecord,
  numericMergeMaximum,
  numericMergeMinimum,
  numericMergeMultipleOf,
  unionMerge,
} from "../utils/index.js";

export const inheritAllOf = createTransformer("allOf");
export const inheritAnyOf = createTransformer("anyOf");
export const inheritOneOf = createTransformer("oneOf");

function createTransformer(member: "allOf" | "anyOf" | "oneOf"): SchemaTransform {
  return (arena, key) => {
    const item = arena.getItem(key);

    if (item.types != null && item.types.length > 1) {
      return;
    }

    const subKeys = item[member];
    if (subKeys == null) {
      return;
    }

    for (const subKey of subKeys) {
      const subItem = arena.getItem(subKey);

      if (subItem.types != null && subItem.types.length > 1) {
        continue;
      }

      const subItemNew = {
        ...subItem,

        types: intersectionMergeTypes(item.types, subItem.types),
        options: intersectionMerge(item.options, subItem.options),
        required: unionMerge(item.required, subItem.required),
        propertyNames: mergeKey(item.propertyNames, subItem.propertyNames),
        contains: mergeKey(item.contains, subItem.contains),
        tupleItems: mergeKeysArray(item.tupleItems, subItem.tupleItems, mergeKey),
        arrayItems: mergeKey(item.arrayItems, subItem.arrayItems),
        objectProperties: mergeKeysRecord(
          item.objectProperties,
          subItem.objectProperties,
          mergeKey,
        ),
        mapProperties: mergeKey(item.mapProperties, subItem.mapProperties),

        minimumInclusive: numericMergeMinimum(item.minimumInclusive, subItem.minimumInclusive),
        minimumExclusive: numericMergeMinimum(item.minimumExclusive, subItem.minimumExclusive),
        maximumInclusive: numericMergeMaximum(item.maximumInclusive, subItem.maximumInclusive),
        maximumExclusive: numericMergeMaximum(item.maximumExclusive, subItem.maximumExclusive),
        multipleOf: numericMergeMultipleOf(item.multipleOf, subItem.multipleOf),
        minimumLength: numericMergeMinimum(item.minimumLength, subItem.minimumLength),
        maximumLength: numericMergeMaximum(item.maximumLength, subItem.maximumLength),
        valuePattern: unionMerge(item.valuePattern, subItem.valuePattern),
        valueFormat: unionMerge(item.valueFormat, subItem.valueFormat),
        minimumItems: numericMergeMinimum(item.minimumItems, subItem.minimumItems),
        maximumItems: numericMergeMaximum(item.maximumItems, subItem.maximumItems),
        uniqueItems: booleanMergeOr(item.uniqueItems, subItem.uniqueItems),
        minimumProperties: numericMergeMinimum(item.minimumProperties, subItem.minimumProperties),
        maximumProperties: numericMergeMaximum(item.maximumProperties, subItem.maximumProperties),
      };

      if (deepEqual(subItem, subItemNew)) {
        continue;
      }

      arena.setItem(subKey, subItemNew);
    }

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
}
