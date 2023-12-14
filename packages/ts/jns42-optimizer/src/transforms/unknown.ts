import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const unknown: TypeArenaTransform = (arena, item) => {
  if (types.isAlias(item)) {
    return item;
  }

  const { id } = item;

  if (types.isOneOf(item) && item.oneOf.length === 0) {
    return {
      id,
      type: "unknown",
    };
  }

  if (types.isAnyOf(item) && item.anyOf.length === 0) {
    return {
      id,
      type: "unknown",
    };
  }

  if (types.isAllOf(item) && item.allOf.length === 0) {
    return {
      id,
      type: "unknown",
    };
  }

  return item;
};
