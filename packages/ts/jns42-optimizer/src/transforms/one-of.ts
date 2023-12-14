import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const oneOf: TypeArenaTransform = (arena, item) => {
  if (!types.isOneOf(item) || item.oneOf.length < 2) {
    return item;
  }

  const { id } = item;

  const uniqueElements = new Set<number>();
  for (const subKey of item.oneOf) {
    const subItem = arena.resolveItem(subKey);

    if (!("type" in subItem)) {
      return item;
    }

    switch (subItem.type) {
      case "any":
        // merging with a any type will always yield any
        return { id, type: "any" };

      case "never":
      case "unknown":
        // don't merge these, these types have no influence on the merged type
        continue;
    }

    uniqueElements.add(subKey);
  }

  if (uniqueElements.size !== item.oneOf.length) {
    return {
      id,

      oneOf: [...uniqueElements],
    };
  }

  return item;
};
