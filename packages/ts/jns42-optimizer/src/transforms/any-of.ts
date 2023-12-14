import assert from "assert";
import { TypeArenaTransform } from "../type-arena.js";
import * as types from "../types.js";

export const anyOf: TypeArenaTransform = (arena, item) => {
  if (item.type !== "anyOf" || item.anyOf.length < 2) {
    return item;
  }

  const { id } = item;

  const uniqueElements = new Set<number>();
  for (const subKey of item.anyOf) {
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

  if (uniqueElements.size !== item.anyOf.length) {
    return {
      id,
      type: "anyOf",
      anyOf: [...uniqueElements],
    };
  }

  const oneOfElements = new Array<number>();

  const groupedElements: { [type: string]: number[] } = {};
  for (const elementKey of uniqueElements) {
    const elementItem = arena.resolveItem(elementKey);
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

    let mergedItem: types.Item | undefined;
    for (const subKey of subKeys) {
      const subItem = arena.resolveItem(subKey);

      // if there is no merged item, we have nothing to compare to! we will be able to do this
      // in the next cycle
      if (mergedItem == null) {
        mergedItem = subItem;
        continue;
      }

      switch (type) {
        case "null":
        case "integer":
        case "number":
        case "string":
          mergedItem = {
            id: null,
            type,
          };
          break;

        case "tuple": {
          assert(type === mergedItem.type);
          assert(type === subItem.type);

          const elements: types.Tuple["elements"] = [];
          const length = Math.max(mergedItem.elements.length, subItem.elements.length);
          for (let index = 0; index < length; index++) {
            if (index < mergedItem.elements.length && index < subItem.elements.length) {
              const newItem: types.AnyOf = {
                id: null,
                type: "anyOf",
                anyOf: [mergedItem.elements[index], subItem.elements[index]],
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
          assert(type === mergedItem.type);
          assert(type === subItem.type);

          const newItem: types.AnyOf = {
            id: null,
            type: "anyOf",
            anyOf: [mergedItem.element, subItem.element],
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
          assert(type === mergedItem.type);
          assert(type === subItem.type);

          const properties: types.Object["properties"] = {};

          const propertyNames = new Set([
            ...Object.keys(mergedItem.properties),
            ...Object.keys(subItem.properties),
          ]);
          for (const propertyName of propertyNames) {
            const mergedItemProperty = mergedItem.properties[propertyName];
            const subItemProperty = subItem.properties[propertyName];
            if (mergedItemProperty != null && subItemProperty != null) {
              const newItem: types.AnyOf = {
                id: null,
                type: "anyOf",
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
          mergedItem = {
            id,
            type: "object",
            properties,
          };
          break;
        }

        case "map": {
          assert(type === mergedItem.type);
          assert(type === subItem.type);

          const newNameItem: types.AnyOf = {
            id: null,
            type: "anyOf",
            anyOf: [mergedItem.name, subItem.name],
          };
          const newNameKey = arena.addItem(newNameItem);

          const newElementItem: types.AnyOf = {
            id: null,
            type: "anyOf",
            anyOf: [mergedItem.element, subItem.element],
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

    const mergedKey = arena.addItem(mergedItem);
    oneOfElements.push(mergedKey);
  }

  return {
    id,
    type: "oneOf",
    oneOf: oneOfElements,
  };
};
