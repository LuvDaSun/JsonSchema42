import { SchemaTransform } from "../models/index.js";

export const inheritAllOf = createTransformer("allOf");
export const inheritAnyOf = createTransformer("anyOf");
export const inheritOneOf = createTransformer("oneOf");

function createTransformer(member: "allOf" | "anyOf" | "oneOf"): SchemaTransform {
  return (arena, key) => {
    const item = arena.getItem(key);

    const subKeys = item[member];
    if (subKeys == null) {
      return;
    }

    const baseItemNew = {
      types: item.types,
      options: item.options,
      required: item.required,
      propertyNames: item.propertyNames,
      contains: item.contains,
      tupleItems: item.tupleItems,
      arrayItems: item.arrayItems,
      objectProperties: item.objectProperties,
      mapProperties: item.mapProperties,

      minimumInclusive: item.minimumInclusive,
      minimumExclusive: item.minimumExclusive,
      maximumInclusive: item.maximumInclusive,
      maximumExclusive: item.maximumExclusive,
      multipleOf: item.multipleOf,
      minimumLength: item.minimumLength,
      maximumLength: item.maximumLength,
      valuePattern: item.valuePattern,
      valueFormat: item.valueFormat,
      minimumItems: item.minimumItems,
      maximumItems: item.maximumItems,
      uniqueItems: item.uniqueItems,
      minimumProperties: item.minimumProperties,
      maximumProperties: item.maximumProperties,
    };

    if (
      baseItemNew.types == null &&
      baseItemNew.options == null &&
      baseItemNew.required == null &&
      baseItemNew.propertyNames == null &&
      baseItemNew.contains == null &&
      baseItemNew.tupleItems == null &&
      baseItemNew.arrayItems == null &&
      baseItemNew.objectProperties == null &&
      baseItemNew.mapProperties == null &&
      baseItemNew.minimumInclusive == null &&
      baseItemNew.minimumExclusive == null &&
      baseItemNew.maximumInclusive == null &&
      baseItemNew.maximumExclusive == null &&
      baseItemNew.multipleOf == null &&
      baseItemNew.minimumLength == null &&
      baseItemNew.maximumLength == null &&
      baseItemNew.valuePattern == null &&
      baseItemNew.valueFormat == null &&
      baseItemNew.minimumItems == null &&
      baseItemNew.maximumItems == null &&
      baseItemNew.uniqueItems == null &&
      baseItemNew.minimumProperties == null &&
      baseItemNew.maximumProperties == null
    ) {
      return;
    }

    const baseKeyNew = arena.addItem(baseItemNew);

    const subKeysNew = new Array<number>();

    for (const subKey of subKeys) {
      const subItemNew = {
        allOf: [subKey, baseKeyNew],
      };

      const subKeyNew = arena.addItem(subItemNew);
      subKeysNew.push(subKeyNew);
    }

    const itemNew = {
      ...item,
      [member]: subKeysNew,

      types: undefined,
      options: undefined,
      required: undefined,
      propertyNames: undefined,
      contains: undefined,
      tupleItems: undefined,
      arrayItems: undefined,
      objectProperties: undefined,
      mapProperties: undefined,

      minimumInclusive: undefined,
      minimumExclusive: undefined,
      maximumInclusive: undefined,
      maximumExclusive: undefined,
      multipleOf: undefined,
      minimumLength: undefined,
      maximumLength: undefined,
      valuePattern: undefined,
      valueFormat: undefined,
      minimumItems: undefined,
      maximumItems: undefined,
      uniqueItems: undefined,
      minimumProperties: undefined,
      maximumProperties: undefined,
    };

    arena.setItem(key, itemNew);
  };
}
