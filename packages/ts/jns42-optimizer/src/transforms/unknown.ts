import { TypeArenaTransform } from "../type-arena.js";

export const unknown: TypeArenaTransform = (arena, item) => {
  const { id } = item;

  switch (item.type) {
    case "allOf":
    case "anyOf":
    case "oneOf": {
      if (item.elements.length === 0) {
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
