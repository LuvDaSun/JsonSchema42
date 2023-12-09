import { TypeArenaTransform } from "../type-arena.js";

export const flatten: TypeArenaTransform = (arena, item) => {
  const { id } = item;

  switch (item.type) {
    case "allOf":
    case "anyOf":
    case "oneOf": {
      let elements = new Array<number>();
      let createNew = false;
      for (const subKey of item.elements) {
        const subItem = arena.getItemUnalias(subKey);

        if (subItem.type === item.type) {
          createNew = true;
          elements.push(...subItem.elements);
        } else {
          elements.push(subKey);
        }
      }
      if (createNew) {
        debugger;
        return {
          id,
          type: item.type,
          elements,
        };
      }
      break;
    }
  }
  return item;
};
