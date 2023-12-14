import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

/**
 * Flips oneOf and allOf types. If an allOf has a oneOf in it, this transform
 * will flip em! It will become a oneOf with an allOf in it.
 *
 * @param arena type arena
 * @param item the item that is currently being transformed
 * @returns the untransformed item, or a new item.
 */
export const allOfOneOf: TypeArenaTransform = (arena, item) => {
  if (!types.isAllOf(item)) {
    return item;
  }

  const uniqueElements = new Set(item.allOf);
  if (uniqueElements.size < 2) {
    return item;
  }

  const { id } = item;

  const newElements = new Array<number>();

  const baseElementEntries = [...uniqueElements]
    .map((element) => [element, arena.resolveItem(element)] as const)
    .filter(([element, item]) => types.isOneOf(item))
    .map(([element, item]) => [element, item as types.OneOf] as const);
  const leafElements = baseElementEntries.flatMap(([key, item]) => item.oneOf);
  const uniqueBaseElements = new Set(baseElementEntries.map(([key, item]) => key));
  const uniqueLeafElements = new Set(leafElements);
  if (uniqueLeafElements.size < 2) {
    return item;
  }

  for (const leafElement of uniqueLeafElements) {
    const newLeafElements = [...uniqueElements, leafElement].filter(
      (key) => !uniqueBaseElements.has(key),
    );

    const newLeafItem: types.AllOf = {
      allOf: newLeafElements,
    };
    const newLeafKey = arena.addItem(newLeafItem);
    newElements.push(newLeafKey);
  }

  return {
    id,

    oneOf: newElements,
  };
};
