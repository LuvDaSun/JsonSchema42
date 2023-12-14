import { TypeArenaTransform } from "../type-arena.js";

export const alias: TypeArenaTransform = (arena, item) => {
  const { id } = item;

  switch (item.type) {
    case "allOf": {
      const uniqueElements = new Set(item.allOf);
      if (uniqueElements.size === 1) {
        const [alias] = item.allOf;
        return { id, type: "alias", alias };
      }
      break;
    }

    case "anyOf": {
      const uniqueElements = new Set(item.anyOf);
      if (uniqueElements.size === 1) {
        const [alias] = item.anyOf;
        return { id, type: "alias", alias };
      }
      break;
    }

    case "oneOf": {
      const uniqueElements = new Set(item.oneOf);
      if (uniqueElements.size === 1) {
        const [alias] = item.oneOf;
        return { id, type: "alias", alias };
      }
      break;
    }
  }

  return item;
};
