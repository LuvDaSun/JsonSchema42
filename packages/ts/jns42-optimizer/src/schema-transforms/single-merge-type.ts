import { SchemaModel, SchemaTransform } from "../schema/index.js";

/**
 * turns the model into a single all-of with various
 * new applicators models in it
 *
 * this
 * ```yaml
 * - allOf
 *   - 100
 *   - 200
 * - anyOf
 *   - 300
 *   - 400
 * - oneOf
 *   - 500
 *   - 600
 * ```
 *
 * will become
 * ```yaml
 * - allOf
 *   - 1
 *   - 2
 *   - 3
 * - allOf
 *   parent: 0
 *   allOf
 *   - 100
 *   - 200
 * - parent: 0
 *   anyOf
 *   - 300
 *   - 400
 * - parent: 0
 *   oneOf
 *   - 500
 *   - 600
 *
 * ```
 *
 */
export const toAllOf: SchemaTransform = (arena, model, modelKey) => {
  if ("alias" in model) {
    return model;
  }

  let count = 0;
  if (model.allOf != null && model.allOf.length > 0) {
    count++;
  }
  if (model.anyOf != null && model.anyOf.length > 0) {
    count++;
  }
  if (model.oneOf != null && model.oneOf.length > 0) {
    count++;
  }
  if (model.if != null || model.then != null || model.else != null) {
    count++;
  }

  if (count <= 1) {
    return model;
  }

  let newModel = { ...model };
  delete newModel.allOf;
  delete newModel.anyOf;
  delete newModel.oneOf;
  delete newModel.if;
  delete newModel.then;
  delete newModel.else;

  newModel.allOf = [];

  if (model.allOf != null && model.allOf.length > 0) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      allOf: model.allOf,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

  if (model.anyOf != null && model.anyOf.length > 0) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      anyOf: model.anyOf,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

  if (model.oneOf != null && model.oneOf.length > 0) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      oneOf: model.oneOf,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

  if (model.if != null || model.then != null || model.else != null) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      if: model.if,
      then: model.then,
      else: model.else,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

  return newModel;
};
