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

    if ("oneOf" in subItem || "anyOf" in subItem || "allOf" in subItem) {
      return item;
    }

    if (subItem.type === "never") {
      // merging with never will result in never
      return {
        id,
        type: "never",
      };
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

    if (subItem.required != null && mergedItem.required != null) {
      // merging required means that fields of both subItem and mergedItem need
      // to be required. We use a Set to guarantee uniqueness
      const required = new Set([...subItem.required, ...mergedItem.required]);
      mergedItem.required = [...required];
    } else {
      mergedItem.required ??= subItem.required;
    }

    if (subItem.tupleElements != null && mergedItem.tupleElements != null) {
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
    } else {
      mergedItem.tupleElements ??= subItem.tupleElements;
    }

    if (subItem.arrayElement != null && mergedItem.arrayElement != null) {
      const newItem: types.AllOf = {
        allOf: [mergedItem.arrayElement, subItem.arrayElement],
      };
      const newKey = arena.addItem(newItem);

      mergedItem.arrayElement = newKey;
    } else {
      mergedItem.arrayElement ??= subItem.arrayElement;
    }

    if (subItem.objectProperties != null && mergedItem.objectProperties != null) {
      const properties: types.Type["objectProperties"] = {};

      const propertyNames = new Set([
        ...Object.keys(mergedItem.objectProperties),
        ...Object.keys(subItem.objectProperties),
      ]);
      for (const propertyName of propertyNames) {
        const mergedItemProperty = mergedItem.objectProperties[propertyName];
        const subItemProperty = subItem.objectProperties[propertyName];
        if (mergedItemProperty != null && subItemProperty != null) {
          // merging the properties as a new allOf type, this will be
          // further optimized in a next pass
          const newItem: types.AllOf = {
            allOf: [mergedItemProperty, subItemProperty],
          };
          const newKey = arena.addItem(newItem);
          properties[propertyName] = newKey;
        } else if (mergedItemProperty != null) {
          properties[propertyName] = mergedItemProperty;
        } else if (subItemProperty != null) {
          properties[propertyName] = subItemProperty;
        }
      }

      mergedItem.objectProperties = properties;
    } else {
      mergedItem.objectProperties ??= subItem.objectProperties;
    }

    if (subItem.propertyName != null && mergedItem.propertyName != null) {
      const newItem: types.AllOf = {
        allOf: [mergedItem.propertyName, subItem.propertyName],
      };
      const newKey = arena.addItem(newItem);

      mergedItem.propertyName = newKey;
    } else {
      mergedItem.propertyName ??= subItem.propertyName;
    }

    if (subItem.mapElement != null && mergedItem.mapElement != null) {
      const newItem: types.AllOf = {
        allOf: [mergedItem.mapElement, subItem.mapElement],
      };
      const newKey = arena.addItem(newItem);

      mergedItem.mapElement = newKey;
    } else {
      mergedItem.mapElement ??= subItem.mapElement;
    }
  }

  assert(mergedItem != null);

  return mergedItem;
};
