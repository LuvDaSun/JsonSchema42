import {
  SchemaTransform,
  isAliasSchemaModel,
  isAllOfSchemaModel,
  isAnyOfSchemaModel,
  isIfSchemaModel,
  isNotSchemaModel,
  isOneOfSchemaModel,
  isReferenceSchemaModel,
  isSingleTypeSchemaModel,
} from "../schema/index.js";
import { booleanMergeAnd } from "../utils/merge.js";

export const mockable: SchemaTransform = (arena, model, modelKey) => {
  let mockable = model.mockable;

  if (isSingleTypeSchemaModel(model)) {
    const type = model.types?.[0];

    mockable = booleanMergeAnd(
      mockable,
      (type === "null" ||
        type === "boolean" ||
        type === "integer" ||
        type === "number" ||
        type === "string" ||
        type === "array" ||
        type === "map") &&
        model.valueFormat == null &&
        model.uniqueItems == null &&
        // anything with a regex
        model.valuePattern == null &&
        model.propertyNames == null &&
        (model.patternProperties == null || Object.keys(model.patternProperties).length === 0),
    );
  }

  if (model.arrayItems != null) {
    const [, subModel] = arena.resolveItem(model.arrayItems);
    mockable = booleanMergeAnd(mockable, subModel.mockable);
  }

  if (model.mapProperties != null) {
    const [, subModel] = arena.resolveItem(model.mapProperties);
    mockable = booleanMergeAnd(mockable, subModel.mockable);
  }

  if (model.tupleItems != null) {
    for (const elementKey of model.tupleItems) {
      const [, subModel] = arena.resolveItem(elementKey);
      mockable = booleanMergeAnd(mockable, subModel.mockable);
    }
  }

  if (model.objectProperties != null) {
    for (const elementKey of Object.values(model.objectProperties)) {
      const [, subModel] = arena.resolveItem(elementKey);
      mockable = booleanMergeAnd(mockable, subModel.mockable);
    }
  }

  if (isAliasSchemaModel(model)) {
    const [, subModel] = arena.resolveItem(model.alias);
    mockable = booleanMergeAnd(mockable, subModel.mockable);
  }

  if (isReferenceSchemaModel(model)) {
    const [, subModel] = arena.resolveItem(model.reference);
    mockable = booleanMergeAnd(mockable, subModel.mockable);
  }

  if (isAllOfSchemaModel(model)) {
    for (const elementKey of model.allOf) {
      const [, subModel] = arena.resolveItem(elementKey);
      mockable = booleanMergeAnd(mockable, subModel.mockable);
    }
  }

  if (isAnyOfSchemaModel(model)) {
    mockable = false;
  }

  if (isOneOfSchemaModel(model)) {
    for (const elementKey of model.oneOf) {
      const [, subModel] = arena.resolveItem(elementKey);
      mockable = booleanMergeAnd(mockable, subModel.mockable);
    }
  }

  if (isIfSchemaModel(model)) {
    mockable = false;
  }

  if (isNotSchemaModel(model)) {
    mockable = false;
  }

  if (mockable === model.mockable) {
    return model;
  }

  return {
    ...model,
    mockable,
  };
};
