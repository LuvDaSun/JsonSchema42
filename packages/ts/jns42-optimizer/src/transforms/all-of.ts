import assert from "assert";
import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const allOf: TypeArenaTransform = (arena, item) => {
  if (item.type !== "allOf") {
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

      case "never":
        // merging with a never type will always yield never
        return { type: "never" };

      case "any":
      case "unknown":
        // don't merge these, these types have no influence on the merged type
        continue;
    }

    uniqueElements.add(subKey);
  }

  if (uniqueElements.size !== item.elements.length) {
    return {
      type: "allOf",
      elements: [...uniqueElements],
    };
  }

  let mergedItem: types.Union | undefined;
  for (const subKey of uniqueElements) {
    const subItem = arena.getItemUnalias(subKey);

    // if there is no merged item, we have nothing to compare to! we will be able to do this
    // in the next cycle
    if (mergedItem == null) {
      mergedItem = subItem;
      continue;
    }

    if (subItem.type !== mergedItem.type) {
      // we cannot merge two types that are not the same!
      return {
        type: "never",
      };
    }

    switch (subItem.type) {
      case "boolean":
      case "integer":
      case "number":
      case "string":
        mergedItem = {
          type: subItem.type,
        };
        break;

      case "tuple": {
        assert(mergedItem.type === subItem.type);

        const elements: types.Tuple["elements"] = [];
        const length = Math.max(subItem.elements.length, mergedItem.elements.length);
        for (let index = 0; index < length; index++) {
          if (index < subItem.elements.length && index < mergedItem.elements.length) {
            const newItem: types.AllOf = {
              type: "allOf",
              elements: [subItem.elements[index], mergedItem.elements[index]],
            };
            const newKey = arena.addItem(newItem);
            elements.push(newKey);
          } else if (index < subItem.elements.length) {
            elements.push(subItem.elements[index]);
          } else if (index < mergedItem.elements.length) {
            elements.push(mergedItem.elements[index]);
          }
        }
        return {
          type: "tuple",
          elements,
        };
      }

      case "array": {
        assert(mergedItem.type === subItem.type);

        const newItem: types.AllOf = {
          type: "allOf",
          elements: [subItem.element, mergedItem.element],
        };
        const newKey = arena.addItem(newItem);
        return {
          type: "array",
          element: newKey,
        };
      }

      case "object": {
        assert(mergedItem.type === subItem.type);

        const properties: types.Object["properties"] = {};

        const propertyNames = new Set([
          ...Object.keys(subItem.properties),
          ...Object.keys(mergedItem.properties),
        ]);
        for (const propertyName of propertyNames) {
          const subItemProperty = subItem.properties[propertyName];
          const mergedItemProperty = mergedItem.properties[propertyName];
          if (subItemProperty != null && mergedItemProperty != null) {
            const newItem: types.AllOf = {
              type: "allOf",
              elements: [subItemProperty.element, mergedItemProperty.element],
            };
            const newKey = arena.addItem(newItem);
            const required = subItemProperty.required || mergedItemProperty.required;
            properties[propertyName] = {
              required,
              element: newKey,
            };
          } else if (subItemProperty != null) {
            properties[propertyName] = { ...subItemProperty };
          } else if (mergedItemProperty != null) {
            properties[propertyName] = { ...mergedItemProperty };
          }
        }
        return {
          type: "object",
          properties,
        };
      }

      case "map": {
        assert(mergedItem.type === subItem.type);

        const newNameItem: types.AllOf = {
          type: "allOf",
          elements: [subItem.name, mergedItem.name],
        };
        const newNameKey = arena.addItem(newNameItem);

        const newElementItem: types.AllOf = {
          type: "allOf",
          elements: [subItem.element, mergedItem.element],
        };
        const newElementKey = arena.addItem(newElementItem);
        return {
          type: "map",
          name: newNameKey,
          element: newElementKey,
        };
      }
    }
  }

  // if there is no merged item, the length of elements was 0,
  // that is an unknown type, we don't know what type it is
  // supposed to be
  return mergedItem ?? { type: "unknown" };
};
