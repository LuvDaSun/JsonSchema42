import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";
import { choose } from "../utils/choose.js";

export const anyOf: TypeArenaTransform = (arena, item) => {
  if (item.type !== "anyOf") {
    return item;
  }

  const uniqueElements = new Set<number>();
  for (const subKey of item.elements) {
    const subItem = arena.getItemUnalias(subKey);

    switch (subItem.type) {
      case "allOf":
      case "anyOf":
      case "oneOf":
        // if the sub item is one of these if cannot be processed! the
        // sub item needs to be optimized away by another transform and then
        // we might be able to try this again.
        return item;

      case "any":
        // merging with a any type will always yield any
        return { type: "any" };

      case "never":
      case "unknown":
        // don't merge these, these types have no influence on the merged type
        continue;
    }

    uniqueElements.add(subKey);
  }

  if (uniqueElements.size !== item.elements.length) {
    return {
      type: "anyOf",
      elements: [...uniqueElements],
    };
  }

  const elements = [...uniqueElements];
  const oneOfElements = new Array<number>();
  for (let count = 0; count < elements.length; count++) {
    for (const allOfElements of choose(elements, count + 1)) {
      const newItem: types.AllOf = {
        type: "allOf",
        elements: allOfElements,
      };
      const newKey = arena.addItem(newItem);
      oneOfElements.push(newKey);
    }
  }

  return {
    type: "oneOf",
    elements: oneOfElements,
  };
};
