import { TypeArenaTransform } from "../type-arena.js";

export const oneOf: TypeArenaTransform = (arena, item) => {
  if (item.type !== "oneOf" || item.elements.length < 2) {
    return item;
  }

  const { id } = item;

  const uniqueElements = new Set<number>();
  for (const subKey of item.elements) {
    const subItem = arena.resolveItem(subKey);

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
        return { id, type: "any" };

      case "never":
      case "unknown":
        // don't merge these, these types have no influence on the merged type
        continue;
    }

    uniqueElements.add(subKey);
  }

  if (uniqueElements.size !== item.elements.length) {
    return {
      id,
      type: "oneOf",
      elements: [...uniqueElements],
    };
  }

  return item;
};
