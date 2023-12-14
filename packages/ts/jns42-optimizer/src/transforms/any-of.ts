import assert from "assert";
import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const anyOf: TypeArenaTransform = (arena, item) => {
  if (!types.isAnyOf(item) || item.anyOf.length < 2) {
    return item;
  }

  const { id } = item;

  const uniqueElements = new Set<number>();
  for (const subKey of item.anyOf) {
    const subItem = arena.resolveItem(subKey);

    if (!types.isType(subItem)) {
      return item;
    }

    switch (subItem.type) {
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

  if (uniqueElements.size !== item.anyOf.length) {
    return {
      id,
      anyOf: [...uniqueElements],
    };
  }

  const oneOfElements = new Array<number>();

  const groupedElements: { [type: string]: number[] } = {};
  for (const elementKey of uniqueElements) {
    const elementItem = arena.resolveItem(elementKey);

    assert(types.isType(elementItem));

    groupedElements[elementItem.type] ??= [];
    groupedElements[elementItem.type].push(elementKey);
  }

  for (const [type, subKeys] of Object.entries(groupedElements)) {
    if (subKeys.length < 2) {
      for (const subKey of subKeys) {
        oneOfElements.push(subKey);
      }
      continue;
    }

    let mergedItem = {
      type,
    } as types.Item;
    for (const subKey of subKeys) {
      const subItem = arena.resolveItem(subKey);

      assert(types.isType(subItem));

      if (subItem.tupleElements != null) {
        if (mergedItem.tupleElements == null) {
          mergedItem.tupleElements = subItem.tupleElements;
        } else {
          const elements: types.Type["tupleElements"] = [];
          const length = Math.max(mergedItem.tupleElements.length, subItem.tupleElements.length);
          for (let index = 0; index < length; index++) {
            if (index < mergedItem.tupleElements.length && index < subItem.tupleElements.length) {
              const newItem: types.AnyOf = {
                anyOf: [mergedItem.tupleElements[index], subItem.tupleElements[index]],
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
          const newItem: types.AnyOf = {
            anyOf: [mergedItem.arrayElement, subItem.arrayElement],
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
              const newItem: types.AnyOf = {
                anyOf: [mergedItemProperty.element, subItemProperty.element],
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
          const newItem: types.AnyOf = {
            anyOf: [mergedItem.propertyName, subItem.propertyName],
          };
          const newKey = arena.addItem(newItem);

          mergedItem.propertyName = newKey;
        }
      }

      if (subItem.mapElement != null) {
        if (mergedItem.mapElement == null) {
          mergedItem.mapElement = subItem.mapElement;
        } else {
          const newItem: types.AnyOf = {
            anyOf: [mergedItem.mapElement, subItem.mapElement],
          };
          const newKey = arena.addItem(newItem);

          mergedItem.mapElement = newKey;
        }
      }
    }

    assert(mergedItem != null);

    const mergedKey = arena.addItem(mergedItem);
    oneOfElements.push(mergedKey);
  }

  return {
    id,

    oneOf: oneOfElements,
  };
};
