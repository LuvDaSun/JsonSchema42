import assert from "assert";
import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const allOf: TypeArenaTransform = (arena, item) => {
  if (item.type !== "allOf" || item.elements.length < 2) {
    return item;
  }

  const { id } = item;

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
        return { id, type: "never" };

      case "any":
      case "unknown":
        // don't merge these, these types have no influence on the merged type
        continue;
    }

    uniqueElements.add(subKey);
  }

  if (uniqueElements.size !== item.elements.length) {
    return {
      id,
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
        id,
        type: "never",
      };
    }

    switch (subItem.type) {
      case "null":
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
        const length = Math.max(mergedItem.elements.length, subItem.elements.length);
        for (let index = 0; index < length; index++) {
          if (index < subItem.elements.length && index < mergedItem.elements.length) {
            const newItem: types.AllOf = {
              type: "allOf",
              elements: [mergedItem.elements[index], subItem.elements[index]],
            };
            const newKey = arena.addItem(newItem);
            elements.push(newKey);
          } else if (index < mergedItem.elements.length) {
            elements.push(mergedItem.elements[index]);
          } else if (index < subItem.elements.length) {
            elements.push(subItem.elements[index]);
          }
        }
        mergedItem = {
          id,
          type: "tuple",
          elements,
        };
        break;
      }

      case "array": {
        assert(mergedItem.type === subItem.type);

        const newItem: types.AllOf = {
          type: "allOf",
          elements: [mergedItem.element, subItem.element],
        };
        const newKey = arena.addItem(newItem);
        mergedItem = {
          id,
          type: "array",
          element: newKey,
        };
        break;
      }

      case "object": {
        assert(mergedItem.type === subItem.type);

        const properties: types.Object["properties"] = {};

        const propertyNames = new Set([
          ...Object.keys(mergedItem.properties),
          ...Object.keys(subItem.properties),
        ]);
        for (const propertyName of propertyNames) {
          const mergedItemProperty = mergedItem.properties[propertyName];
          const subItemProperty = subItem.properties[propertyName];
          if (mergedItemProperty != null && subItemProperty != null) {
            const newItem: types.AllOf = {
              type: "allOf",
              elements: [mergedItemProperty.element, subItemProperty.element],
            };
            const newKey = arena.addItem(newItem);
            const required = mergedItemProperty.required || subItemProperty.required;
            properties[propertyName] = {
              required,
              element: newKey,
            };
          } else if (mergedItemProperty != null) {
            properties[propertyName] = { ...mergedItemProperty };
          } else if (subItemProperty != null) {
            properties[propertyName] = { ...subItemProperty };
          }
        }
        mergedItem = {
          id,
          type: "object",
          properties,
        };
        break;
      }

      case "map": {
        assert(mergedItem.type === subItem.type);

        const newNameItem: types.AllOf = {
          type: "allOf",
          elements: [mergedItem.name, subItem.name],
        };
        const newNameKey = arena.addItem(newNameItem);

        const newElementItem: types.AllOf = {
          type: "allOf",
          elements: [mergedItem.element, subItem.element],
        };
        const newElementKey = arena.addItem(newElementItem);
        mergedItem = {
          id,
          type: "map",
          name: newNameKey,
          element: newElementKey,
        };
        break;
      }
    }
  }

  assert(mergedItem != null);

  return mergedItem;
};
