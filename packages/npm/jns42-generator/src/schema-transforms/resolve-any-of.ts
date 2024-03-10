import { SchemaModel, SchemaTransform } from "../models/index.js";
import { intersectionMerge, mergeKeysArray, mergeKeysRecord } from "../utils/index.js";

export const resolveAnyOf: SchemaTransform = (arena, key) => {
  const item = arena.getItem(key);

  // we need at least two to merge
  if (item.anyOf == null || item.anyOf.length < 2) {
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

  if (item.allOf != null && item.allOf.length > 0) {
    return;
  }

  // first we group elements by their type
  const groupedSubKeys: { [type: string]: number[] } = {};
  for (const subKey of item.anyOf) {
    const subItem = arena.getItem(subKey);

    if (subItem.types != null && subItem.types.length > 1) {
      // we can only work with single types
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

    const type = subItem.types != null && subItem.types.length === 1 ? subItem.types[0] : "";

    groupedSubKeys[type] ??= [];
    groupedSubKeys[type].push(subKey);
  }

  const subKeysNew = new Array<number>();

  // we make a oneOf with every type as it's element
  for (const [, subKeys] of Object.entries(groupedSubKeys)) {
    if (subKeys.length < 2) {
      for (const subKey of subKeys) {
        subKeysNew.push(subKey);
      }
      // we don't need to merge!
      continue;
    }

    let subModelNew: SchemaModel = {
      exact: false,
    };
    for (const subKey of subKeys) {
      const subItem = arena.getItem(subKey);

      subModelNew = {
        ...subModelNew,
        options: intersectionMerge(subModelNew.options, subItem.options),
        required: intersectionMerge(subModelNew.required, subItem.required),
        propertyNames: mergeKey(subModelNew.propertyNames, subItem.propertyNames),
        contains: mergeKey(subModelNew.contains, subItem.contains),
        tupleItems: mergeKeysArray(subModelNew.tupleItems, subItem.tupleItems, mergeKey),
        arrayItems: mergeKey(subModelNew.arrayItems, subItem.arrayItems),
        objectProperties: mergeKeysRecord(
          subModelNew.objectProperties,
          subItem.objectProperties,
          mergeKey,
        ),
        mapProperties: mergeKey(subModelNew.mapProperties, subItem.mapProperties),
      };
    }

    const newSubKey = arena.addItem(subModelNew);
    subKeysNew.push(newSubKey);
  }

  const itemNew: SchemaModel = {
    ...item,
    exact: false,
    oneOf: subKeysNew,
    anyOf: undefined,
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

    const newModel = {
      anyOf: [key, otherKey],
    };
    const newKey = arena.addItem(newModel);
    return newKey;
  }
};
