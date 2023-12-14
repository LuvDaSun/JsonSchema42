import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const unknown: TypeArenaTransform = (arena, item) => {
  if (types.isAlias(item)) {
    return item;
  }

  const { id } = item;

  switch (item.type) {
    case "allOf": {
      if (item.allOf.length === 0) {
        return {
          id,
          type: "unknown",
        };
      }
      break;
    }

    case "anyOf": {
      if (item.anyOf.length === 0) {
        return {
          id,
          type: "unknown",
        };
      }
      break;
    }

    case "oneOf": {
      if (item.oneOf.length === 0) {
        return {
          id,
          type: "unknown",
        };
      }
      break;
    }
  }
  return item;
};
