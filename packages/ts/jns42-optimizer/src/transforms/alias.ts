import { TypeArenaTransform } from "../type-arena.js";

export const alias: TypeArenaTransform = (arena, item) => {
  const { id } = item;

  switch (item.type) {
    case "allOf":
    case "anyOf":
    case "oneOf": {
      const uniqueElements = new Set(item.elements);
      if (uniqueElements.size === 1) {
        const [target] = item.elements;
        return { id, type: "alias", target };
      }
      break;
    }
  }
  return item;
};
