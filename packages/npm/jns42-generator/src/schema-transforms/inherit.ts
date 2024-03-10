import { SchemaTransform } from "../models/index.js";
import { deepEqual } from "../utils/index.js";

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

    for (const subKey of subKeys) {
      const subItem = arena.getItem(subKey);

      const subItemNew = {
        ...subItem,
      };

      if (deepEqual(subItem, subItemNew)) {
        continue;
      }

      arena.setItem(subKey, subItemNew);
    }
  };
}
