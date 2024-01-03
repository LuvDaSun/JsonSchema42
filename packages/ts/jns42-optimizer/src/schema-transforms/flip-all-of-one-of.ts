import { OneOfModel, SchemaTransform, isAllOf, isOneOf } from "../schema/index.js";
import * as types from "../types.js";

/**
 * Flips oneOf and allOf types. If an allOf has a oneOf in it, this transform
 * will flip em! It will become a oneOf with an allOf in it.
 */
export const flipAllOfOneOf: SchemaTransform = (arena, model, modelKey) => {
  // we need at least two to merge
  if (!isAllOf(model) || model.allOf.length < 2) {
    return model;
  }

  const { id } = model;

  const newElements = new Array<number>();

  const baseElementEntries = model.allOf
    .map((element) => [element, arena.resolveItem(element)] as const)
    .filter(([element, [, item]]) => isOneOf(item))
    .map(([element, [, item]]) => [element, item as OneOfModel] as const);
  const leafElements = baseElementEntries.flatMap(([key, item]) => item.oneOf);
  if (leafElements.length < 2) {
    return model;
  }

  const baseElementSet = new Set(baseElementEntries.map(([key, item]) => key));

  for (const leafElement of leafElements) {
    const newLeafElements = [...model.allOf, leafElement].filter((key) => !baseElementSet.has(key));

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
