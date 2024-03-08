import {
  SchemaTransform,
  isAliasSchemaModel,
  isAllOfSchemaModel,
  isAnyOfSchemaModel,
  isIfSchemaModel,
  isOneOfSchemaModel,
  isReferenceSchemaModel,
  isSingleTypeSchemaModel,
} from "../models/index.js";
import { booleanMergeAnd, booleanMergeOr } from "../utils/merge.js";

export const mockable: SchemaTransform = (arena, modelKey) => {
  const model = arena.getItem(modelKey);

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

  if (model.tupleItems != null) {
    let subMockable: boolean | undefined;
    for (const elementKey of model.tupleItems) {
      const [, subModel] = arena.resolveItem(elementKey);
      subMockable = booleanMergeAnd(subMockable, subModel.mockable);
    }
    mockable = booleanMergeAnd(mockable, subMockable);
  } else {
    if (model.arrayItems != null && model.minimumItems != null) {
      const [, subModel] = arena.resolveItem(model.arrayItems);
      mockable = booleanMergeAnd(mockable, subModel.mockable);
    }
  }

  if (model.objectProperties != null) {
    let subMockable: boolean | undefined;
    for (const elementKey of Object.values(model.objectProperties)) {
      const [, subModel] = arena.resolveItem(elementKey);
      subMockable = booleanMergeAnd(subMockable, subModel.mockable);
    }
    mockable = booleanMergeAnd(mockable, subMockable);
  } else {
    if (model.mapProperties != null && model.minimumProperties != null) {
      const [, subModel] = arena.resolveItem(model.mapProperties);
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
    let subMockable: boolean | undefined;
    // all sub schemas need to be mockable
    for (const elementKey of model.allOf) {
      const [, subModel] = arena.resolveItem(elementKey);
      subMockable = booleanMergeAnd(subMockable, subModel.mockable);
    }
    mockable = booleanMergeAnd(mockable, subMockable);
  }

  if (isAnyOfSchemaModel(model)) {
    // anyof can never me mocked
    mockable = false;
  }

  if (isOneOfSchemaModel(model)) {
    let subMockable: boolean | undefined;
    // one of can be mocked if one of the elements can be mocked
    for (const elementKey of model.oneOf) {
      const [, subModel] = arena.resolveItem(elementKey);
      subMockable = booleanMergeOr(subMockable, subModel.mockable);
    }
    mockable = booleanMergeAnd(mockable, subMockable);
  }

  if (isIfSchemaModel(model)) {
    mockable = false;
  }

  if (model.not != null) {
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
