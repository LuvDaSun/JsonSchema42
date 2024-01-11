import {
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isOneOfSchemaModel,
  isSingleTypeSchemaModel,
} from "../schema/index.js";

export const resolveOneOf: SchemaTransform = (arena, model, modelKey) => {
  if (!isOneOfSchemaModel(model)) {
    return model;
  }

  const elementKeys = new Set(model.oneOf);
  if (elementKeys.size < 1) {
    return {
      ...model,
      oneOf: undefined,
    };
  }

  if (elementKeys.size < 2) {
    return model;
  }

  const newModel: SchemaModel & OneOfSchemaModel = {
    ...model,
    oneOf: [],
  };

  for (const elementKey of elementKeys) {
    const [, elementModel] = arena.resolveItem(elementKey);

    if (
      isSingleTypeSchemaModel(elementModel) &&
      elementModel.types != null &&
      elementModel.types[0] === "never"
    ) {
      continue;
    }

    newModel.oneOf.push(elementKey);
  }

  if (newModel.oneOf.length === model.oneOf.length) {
    return model;
  }

  return newModel;
};
