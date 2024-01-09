import {
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isOneOfSchemaModel,
  isSingleTypeSchemaModel,
} from "../schema/index.js";

export const resolveOneOf: SchemaTransform = (arena, model, modelKey) => {
  if (!isOneOfSchemaModel(model) || model.oneOf.length < 2) {
    return model;
  }

  const newModel: SchemaModel & OneOfSchemaModel = {
    ...model,
    oneOf: [],
  };

  for (const element of model.oneOf) {
    const [, subModel] = arena.resolveItem(element);

    if (
      isSingleTypeSchemaModel(subModel) &&
      subModel.types != null &&
      subModel.types[0] === "never"
    ) {
      continue;
    }

    newModel.oneOf.push(element);
  }

  if (newModel.oneOf.length === model.oneOf.length) {
    return model;
  }

  return newModel;
};
