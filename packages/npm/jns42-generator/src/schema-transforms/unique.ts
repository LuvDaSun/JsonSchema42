import { SchemaTransform } from "../models/index.js";

export const uniqueAllOf = createTransformer("allOf");
export const uniqueAnyOf = createTransformer("anyOf");
export const uniqueOneOf = createTransformer("oneOf");

function createTransformer(member: "allOf" | "anyOf" | "oneOf"): SchemaTransform {
  return (arena, key) => {
    const item = arena.getItem(key);

    const subKeys = item[member];
    if (subKeys == null) {
      return;
    }

    const subKeySet = [...makeUnique(subKeys)];
    if (subKeys.length > subKeySet.length) {
      const itemNew = {
        ...item,
        [member]: subKeySet,
      };
      arena.setItem(key, itemNew);
    }
  };
}
