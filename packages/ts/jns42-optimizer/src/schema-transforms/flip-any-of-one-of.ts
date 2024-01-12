import {
  AnyOfSchemaModel,
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isAnyOfSchemaModel,
  isOneOfSchemaModel,
  isSingleTypeSchemaModel,
} from "../schema/index.js";

export const flipAnyOfOneOf: SchemaTransform = (arena, model, modelKey) => {
  // we need at least two to merge
  if (!isAnyOfSchemaModel(model)) {
    return model;
  }

  const elementKeys = new Set(model.anyOf);
  if (elementKeys.size < 1) {
    return {
      ...model,
      anyOf: undefined,
    };
  }

  if (elementKeys.size < 2) {
    return model;
  }

  const newModel: SchemaModel & OneOfSchemaModel = { ...model, oneOf: [], anyOf: undefined };

  const baseElementEntries = [...elementKeys]
    .map((element) => [element, arena.resolveItem(element)] as const)
    .filter(([element, [, item]]) => isOneOfSchemaModel(item))
    .map(([element, [, item]]) => [element, item as OneOfSchemaModel] as const);
  const leafElements = baseElementEntries.flatMap(([key, item]) => item.oneOf);
  if (leafElements.length < 2) {
    return model;
  }

  const baseElementSet = new Set(baseElementEntries.map(([key, item]) => key));

  for (const leafElement of leafElements) {
    const [, leafModel] = arena.resolveItem(leafElement);
    if (!isSingleTypeSchemaModel(leafModel)) {
      return model;
    }
  }

  for (const leafElement of leafElements) {
    const newLeafElements = [...model.anyOf, leafElement].filter((key) => !baseElementSet.has(key));
    const newLeafModel: AnyOfSchemaModel = {
      anyOf: newLeafElements,
    };
    const newLeafKey = arena.addItem(newLeafModel);
    newModel.oneOf.push(newLeafKey);
  }

  return newModel;
};
