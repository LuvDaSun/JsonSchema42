import { TypeArenaTransform } from "../type-arena.js";

export const flatten: TypeArenaTransform = (arena, item) => {
  switch (item.type) {
    case "allOf":
    case "anyOf":
    case "oneOf": {
      let elements = new Array<number>();
      let createNewItem = false;
      for (const subIndex of item.elements) {
        const subItem = arena.getItem(subIndex);

        if (subItem.type === item.type) {
          createNewItem = true;
          elements.push(...subItem.elements);
        } else {
          elements.push(subIndex);
        }
      }
      if (createNewItem) {
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
