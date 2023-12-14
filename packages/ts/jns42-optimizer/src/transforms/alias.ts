import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const alias: TypeArenaTransform = (arena, item) => {
  const { id } = item;

  if (types.isAlias(item)) {
    return item;
  }

  switch (item.type) {
    case "allOf": {
      const uniqueElements = new Set(item.allOf);
      if (uniqueElements.size === 1) {
        const [alias] = item.allOf;
        return { id, alias };
      }
      break;
    }

    case "anyOf": {
      const uniqueElements = new Set(item.anyOf);
      if (uniqueElements.size === 1) {
        const [alias] = item.anyOf;
        return { id, alias };
      }
      break;
    }

    case "oneOf": {
      const uniqueElements = new Set(item.oneOf);
      if (uniqueElements.size === 1) {
        const [alias] = item.oneOf;
        return { id, alias };
      }
      break;
    }
  }

  return item;
};
