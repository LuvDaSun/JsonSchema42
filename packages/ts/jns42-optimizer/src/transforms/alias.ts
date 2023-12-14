import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const alias: TypeArenaTransform = (arena, item) => {
  const { id } = item;

  if (types.isAlias(item)) {
    return item;
  }

  if (types.isOneOf(item) && item.oneOf.length === 1) {
    const [alias] = item.oneOf;
    return { id, alias };
  }

  if (types.isAnyOf(item) && item.anyOf.length === 1) {
    const [alias] = item.anyOf;
    return { id, alias };
  }

  if (types.isAllOf(item) && item.allOf.length === 1) {
    const [alias] = item.allOf;
    return { id, alias };
  }

  return item;
};
