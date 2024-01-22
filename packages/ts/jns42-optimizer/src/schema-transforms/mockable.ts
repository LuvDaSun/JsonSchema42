import { SchemaTransform } from "../schema/index.js";
import { booleanMergeAnd } from "../utils/merge.js";

export const mockable: SchemaTransform = (arena, model, modelKey) => {
  let mockable = model.mockable;

  mockable = booleanMergeAnd(
    mockable,
    // probably never
    model.not == null &&
      model.if == null &&
      model.then == null &&
      model.else == null &&
      (model.anyOf == null || model.anyOf.length === 0) &&
      // maybe in the future...
      model.valueFormat == null &&
      model.uniqueItems == null &&
      // anything with a regex
      model.valuePattern == null &&
      model.propertyNames == null &&
      (model.patternProperties == null || Object.keys(model.patternProperties).length === 0),
  );

  if (model.alias != null) {
    const [, subModel] = arena.resolveItem(model.alias);
    mockable = booleanMergeAnd(mockable, subModel.mockable);
  }

  if (model.reference != null) {
    const [, subModel] = arena.resolveItem(model.reference);
    mockable = booleanMergeAnd(mockable, subModel.mockable);
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

  if (model.oneOf != null) {
    for (const elementKey of model.oneOf) {
      const [, subModel] = arena.resolveItem(elementKey);
      mockable = booleanMergeAnd(mockable, subModel.mockable);
    }
  }

  if (mockable === model.mockable) {
    return model;
  }

  return {
    ...model,
    mockable,
  };
};
