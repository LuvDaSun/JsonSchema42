import { TypeArenaTransform } from "../type-arena.js";

export const flatten: TypeArenaTransform = (arena, item) => {
  switch (item.type) {
    case "allOf":
    case "anyOf":
    case "oneOf": {
      let elements = new Array<number>();
      let createNew = false;
      for (const subIndex of item.elements) {
        const subItem = arena.getItemUnalias(subIndex);

        if (subItem.type === item.type) {
          createNew = true;
          elements.push(...subItem.elements);
        } else {
          elements.push(subIndex);
        }
      }
      if (createNew) {
        return {
          type: item.type,
          elements,
        };
      }
      break;
    }
  }
  return item;
};
