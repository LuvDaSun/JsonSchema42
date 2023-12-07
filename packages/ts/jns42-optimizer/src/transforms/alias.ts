import { ArenaTransform } from "../arena.js";
import * as types from "../types.js";

export const alias: ArenaTransform<types.Union> = (arena, item) => {
  switch (item.type) {
    case "allOf":
    case "anyOf":
    case "oneOf":
      if (item.elements.length === 1) {
        const [target] = item.elements;
        return { type: "alias", target };
      }
      break;
  }
  return item;
};
