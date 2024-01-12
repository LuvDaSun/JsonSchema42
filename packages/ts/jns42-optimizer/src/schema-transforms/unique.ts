import {
  SchemaTransform,
  isAllOfSchemaModel,
  isAnyOfSchemaModel,
  isOneOfSchemaModel,
} from "../schema/index.js";

export const unique: SchemaTransform = (arena, model, modelKey) => {
  if (isAllOfSchemaModel(model)) {
    const set = new Set(model.allOf);
    if (model.allOf.length > set.size) {
      return {
        ...model,
        allOf: [...set],
      };
    }
  }

  if (isAnyOfSchemaModel(model)) {
    const set = new Set(model.anyOf);
    if (model.anyOf.length > set.size) {
      return {
        ...model,
        anyOf: [...set],
      };
    }
  }

  if (isOneOfSchemaModel(model)) {
    const set = new Set(model.oneOf);
    if (model.oneOf.length > set.size) {
      return {
        ...model,
        oneOf: [...set],
      };
    }
  }

  return model;
};
