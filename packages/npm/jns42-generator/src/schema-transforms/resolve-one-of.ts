import {
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isOneOfSchemaModel,
  isSingleTypeSchemaModel,
} from "../models/index.js";

export const resolveOneOf: SchemaTransform = (arena, model, modelKey) => {
  // we need at least two to merge
  if (!isOneOfSchemaModel(model) || model.oneOf.length < 2) {
    return model;
  }

  const newModel: SchemaModel & OneOfSchemaModel = {
    ...model,
    oneOf: [],
  };

  for (const elementKey of model.oneOf) {
    const [, elementModel] = arena.resolveItem(elementKey);

    if (!isSingleTypeSchemaModel(elementModel)) {
      return model;
    }

    if (elementModel.types != null && elementModel.types[0] === "never") {
      continue;
    }

    newModel.oneOf.push(elementKey);
  }

  if (newModel.oneOf.length === model.oneOf.length) {
    return model;
  }

  return newModel;
};
