import { TypeArenaTransform } from "../type-arena.js";

export const alias: TypeArenaTransform = (arena, item) => {
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
