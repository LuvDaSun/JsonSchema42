import assert from "assert";
import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const flatten: TypeArenaTransform = (arena, item) => {
  if (types.isAlias(item)) {
    return item;
  }

  const { id } = item;

  switch (item.type) {
    case "allOf": {
      let elements = new Array<number>();
      let createNew = false;
      for (const subKey of item.allOf) {
        const subItem = arena.resolveItem(subKey);

        assert("type" in subItem);

        if (subItem.type === item.type) {
          createNew = true;
          elements.push(...subItem.allOf);
        } else {
          elements.push(subKey);
        }
      }
      if (createNew) {
        return {
          id,
          type: item.type,
          allOf: elements,
        };
      }
      break;
    }

    case "anyOf": {
      let elements = new Array<number>();
      let createNew = false;
      for (const subKey of item.anyOf) {
        const subItem = arena.resolveItem(subKey);

        assert("type" in subItem);

        if (subItem.type === item.type) {
          createNew = true;
          elements.push(...subItem.anyOf);
        } else {
          elements.push(subKey);
        }
      }
      if (createNew) {
        return {
          id,
          type: item.type,
          anyOf: elements,
        };
      }
      break;
    }

    case "oneOf": {
      let elements = new Array<number>();
      let createNew = false;
      for (const subKey of item.oneOf) {
        const subItem = arena.resolveItem(subKey);

        assert("type" in subItem);

        if (subItem.type === item.type) {
          createNew = true;
          elements.push(...subItem.oneOf);
        } else {
          elements.push(subKey);
        }
      }
      if (createNew) {
        return {
          id,
          type: item.type,
          oneOf: elements,
        };
      }
      break;
    }
  }

  return item;
};
