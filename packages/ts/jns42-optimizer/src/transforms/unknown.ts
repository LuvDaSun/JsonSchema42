import { TypeArenaTransform } from "../type-arena.js";

export const unknown: TypeArenaTransform = (arena, item) => {
  switch (item.type) {
    case "allOf":
    case "anyOf":
    case "oneOf": {
      if (item.elements.length === 0) {
        return {
          type: "unknown",
        };
      }
      break;
    }
  }
  return item;
};
