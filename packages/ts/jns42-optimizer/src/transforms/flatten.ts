import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const flatten: TypeArenaTransform = (arena, item) => {
  const { id } = item;

  if (types.isOneOf(item)) {
    const elements = new Array<number>();
    for (const subKey of item.oneOf) {
      const subItem = arena.resolveItem(subKey);

      if (types.isOneOf(subItem)) {
        elements.push(...subItem.oneOf);
      } else {
        elements.push(subKey);
      }
    }
    if (elements.length > item.oneOf.length) {
      return {
        id,
        oneOf: elements,
      };
    }
  }

  if (types.isAnyOf(item)) {
    const elements = new Array<number>();
    for (const subKey of item.anyOf) {
      const subItem = arena.resolveItem(subKey);

      if (types.isAnyOf(subItem)) {
        elements.push(...subItem.anyOf);
      } else {
        elements.push(subKey);
      }
    }
    if (elements.length > item.anyOf.length) {
      return {
        id,
        anyOf: elements,
      };
    }
  }

  if (types.isAllOf(item)) {
    const elements = new Array<number>();
    for (const subKey of item.allOf) {
      const subItem = arena.resolveItem(subKey);

      if (types.isAllOf(subItem)) {
        elements.push(...subItem.allOf);
      } else {
        elements.push(subKey);
      }
    }
    if (elements.length > item.allOf.length) {
      return {
        id,
        allOf: elements,
      };
    }
  }

  return item;
};
