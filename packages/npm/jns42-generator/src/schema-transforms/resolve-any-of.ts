import { SchemaItem, SchemaTransform, SchemaType } from "../models/index.js";
import { intersectionMerge, mergeKeysArray, mergeKeysRecord, unionMerge } from "../utils/index.js";

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

    if (subItem.types == null || subItem.types.length !== 1) {
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

    const [type] = subItem.types;
    groupedSubKeys[type] ??= [];
    groupedSubKeys[type].push(subKey);
  }

  const subKeysNew = new Array<number>();

  // we make a oneOf with every type as it's element
  for (const [type, subKeys] of Object.entries(groupedSubKeys)) {
    if (subKeys.length < 2) {
      for (const subKey of subKeys) {
        subKeysNew.push(subKey);
      }
      // we don't need to merge!
      continue;
    }

    let subItemNew: SchemaItem = {
      exact: false,
      types: [type] as SchemaType[],
    };
    for (const subKey of subKeys) {
      const subItem = arena.getItem(subKey);

      subItemNew = {
        ...subItemNew,

        options: unionMerge(subItemNew.options, subItem.options),
        required: intersectionMerge(subItemNew.required, subItem.required),
        propertyNames: mergeKey(subItemNew.propertyNames, subItem.propertyNames),
        contains: mergeKey(subItemNew.contains, subItem.contains),
        tupleItems: mergeKeysArray(subItemNew.tupleItems, subItem.tupleItems, mergeKey),
        arrayItems: mergeKey(subItemNew.arrayItems, subItem.arrayItems),
        objectProperties: mergeKeysRecord(
          subItemNew.objectProperties,
          subItem.objectProperties,
          mergeKey,
        ),
        mapProperties: mergeKey(subItemNew.mapProperties, subItem.mapProperties),
      };
    }

    const newSubKey = arena.addItem(subItemNew);
    subKeysNew.push(newSubKey);
  }

  const itemNew: SchemaItem = {
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

    const itemNey = {
      anyOf: [key, otherKey],
    };
    const keyNew = arena.addItem(itemNey);
    return keyNew;
  }
};
