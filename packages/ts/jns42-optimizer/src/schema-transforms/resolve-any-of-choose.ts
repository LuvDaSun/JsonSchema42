import {
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isAnyOfSchemaModel,
} from "../schema/index.js";

export const resolveAnyOfChoose: SchemaTransform = (arena, model, modelKey) => {
  if (!isAnyOfSchemaModel(model) || model.anyOf.length < 2) {
    return model;
  }

  const newModel: SchemaModel & OneOfSchemaModel = {
    ...model,
    oneOf: [],
    anyOf: undefined,
  };

  return newModel;
};
