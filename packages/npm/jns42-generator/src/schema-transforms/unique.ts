import assert from "assert";
import {
  SchemaModel,
  SchemaTransform,
  isAllOfSchemaModel,
  isAnyOfSchemaModel,
  isOneOfSchemaModel,
} from "../models/index.js";
import { deepUnique } from "../utils/index.js";

export const unique: SchemaTransform = (arena, model, modelKey) => {
  if (isAllOfSchemaModel(model)) {
    const set = [...makeUnique(model.allOf)];
    if (set.length === 0) {
      return {
        ...model,
        allOf: undefined,
      };
    }
    if (model.allOf.length > set.length) {
      return {
        ...model,
        allOf: [...set],
      };
    }
  }

  if (isAnyOfSchemaModel(model)) {
    const set = [...makeUnique(model.anyOf)];
    if (set.length === 0) {
      return {
        ...model,
        anyOf: undefined,
      };
    }
    if (model.anyOf.length > set.length) {
      return {
        ...model,
        anyOf: [...set],
      };
    }
  }

  if (isOneOfSchemaModel(model)) {
    const set = [...makeUnique(model.oneOf)];
    if (set.length === 0) {
      return {
        ...model,
        oneOf: undefined,
      };
    }
    if (model.oneOf.length > set.length) {
      return {
        ...model,
        oneOf: [...set],
      };
    }
  }

  return model;

  function* makeUnique(keys: number[]) {
    const modelToKey = new Map<SchemaModel, number>(
      keys.map((key) => arena.resolveItem(key)).map(([key, value]) => [value, key]),
    );
    const uniqueModels = deepUnique(modelToKey.keys());
    for (const model of uniqueModels) {
      const key = modelToKey.get(model);
      assert(key != null);
      yield key;
    }
  }
};
