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

      if (subItem.required != null && mergedItem.required != null) {
        // merged fields are only required when both the merged and the sub item require
        // them. We use sets to guarantee uniqueness
        const required = new Array<string>();
        const subRequired = new Set(subItem.required);
        const mergedRequired = new Set(mergedItem.required);
        for (const requiredProperty of subRequired) {
          if (mergedRequired.has(requiredProperty)) {
            required.push(requiredProperty);
          }
        }
        mergedItem.required = required;
      } else {
        mergedItem.required ??= subItem.required;
      }

      if (subItem.tupleElements != null && mergedItem.tupleElements != null) {
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
      } else {
        mergedItem.tupleElements ??= subItem.tupleElements;
      }

      if (subItem.arrayElement != null && mergedItem.arrayElement != null) {
        const newItem: types.AnyOf = {
          anyOf: [mergedItem.arrayElement, subItem.arrayElement],
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
          if (subItemProperty != null && mergedItemProperty != null) {
            const newItem: types.AnyOf = {
              anyOf: [mergedItemProperty, subItemProperty],
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
        const newItem: types.AnyOf = {
          anyOf: [mergedItem.propertyName, subItem.propertyName],
        };
        const newKey = arena.addItem(newItem);

        mergedItem.propertyName = newKey;
      } else {
        mergedItem.propertyName ??= subItem.propertyName;
      }

      if (subItem.mapElement != null && mergedItem.mapElement != null) {
        const newItem: types.AnyOf = {
          anyOf: [mergedItem.mapElement, subItem.mapElement],
        };
        const newKey = arena.addItem(newItem);

        mergedItem.mapElement = newKey;
      } else {
        mergedItem.mapElement ??= subItem.mapElement;
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
