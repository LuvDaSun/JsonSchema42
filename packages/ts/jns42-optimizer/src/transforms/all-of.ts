import assert from "assert";
import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const allOf: TypeArenaTransform = (arena, item) => {
  if (!types.isAllOf(item) || item.allOf.length < 2) {
    return item;
  }

  const { id } = item;

  let mergedItem: types.Item | undefined;
  for (const subKey of item.allOf) {
    const subItem = arena.resolveItem(subKey);

    if (subItem.type === "never") {
      // merging with never will result in never
      return {
        id,
        type: "never",
      };
    }

    if ("oneOf" in subItem || "anyOf" in subItem || "allOf" in subItem) {
      return item;
    }

    // if there is no merged item, we have nothing to compare to! we will be able to do this
    // in the next cycle
    if (mergedItem == null) {
      mergedItem = { id, ...subItem };
      continue;
    }

    if ("type" in subItem && "type" in mergedItem && subItem.type !== mergedItem.type) {
      // we cannot merge two types that are not the same!
      return {
        id,
        type: "never",
      };
    }

    mergedItem.type ??= subItem.type;

    if (subItem.tupleElements != null) {
      if (mergedItem.tupleElements == null) {
        mergedItem.tupleElements = subItem.tupleElements;
      } else {
        const elements: types.Type["tupleElements"] = [];
        const length = Math.max(mergedItem.tupleElements.length, subItem.tupleElements.length);
        for (let index = 0; index < length; index++) {
          if (index < subItem.tupleElements.length && index < mergedItem.tupleElements.length) {
            const newItem: types.AllOf = {
              allOf: [mergedItem.tupleElements[index], subItem.tupleElements[index]],
            };
            const newKey = arena.addItem(newItem);
            elements.push(newKey);
          } else if (index < mergedItem.tupleElements.length) {
            elements.push(mergedItem.tupleElements[index]);
          } else if (index < subItem.tupleElements.length) {
            elements.push(subItem.tupleElements[index]);
          }
        }

        mergedItem.tupleElements = elements;
      }
    }

    if (subItem.arrayElement != null) {
      if (mergedItem.arrayElement == null) {
        mergedItem.arrayElement = subItem.arrayElement;
      } else {
        const newItem: types.AllOf = {
          allOf: [mergedItem.arrayElement, subItem.arrayElement],
        };
        const newKey = arena.addItem(newItem);

        mergedItem.arrayElement = newKey;
      }
    }

    if (subItem.objectProperties != null) {
      if (mergedItem.objectProperties == null) {
        mergedItem.objectProperties = subItem.objectProperties;
      } else {
        const properties: types.Type["objectProperties"] = {};

        const propertyNames = new Set([
          ...Object.keys(mergedItem.objectProperties),
          ...Object.keys(subItem.objectProperties),
        ]);
        for (const propertyName of propertyNames) {
          const mergedItemProperty = mergedItem.objectProperties[propertyName];
          const subItemProperty = subItem.objectProperties[propertyName];
          if (mergedItemProperty != null && subItemProperty != null) {
            const newItem: types.AllOf = {
              allOf: [mergedItemProperty.element, subItemProperty.element],
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

        mergedItem.objectProperties = properties;
      }
    }

    if (subItem.propertyName != null) {
      if (mergedItem.propertyName == null) {
        mergedItem.propertyName = subItem.propertyName;
      } else {
        const newItem: types.AllOf = {
          allOf: [mergedItem.propertyName, subItem.propertyName],
        };
        const newKey = arena.addItem(newItem);

        mergedItem.propertyName = newKey;
      }
    }

    if (subItem.mapElement != null) {
      if (mergedItem.mapElement == null) {
        mergedItem.mapElement = subItem.mapElement;
      } else {
        const newItem: types.AllOf = {
          allOf: [mergedItem.mapElement, subItem.mapElement],
        };
        const newKey = arena.addItem(newItem);

        mergedItem.mapElement = newKey;
      }
    }
  }

  assert(mergedItem != null);

  return mergedItem;
};
