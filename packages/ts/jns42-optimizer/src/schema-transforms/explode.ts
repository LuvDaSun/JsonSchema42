import { SchemaModel, SchemaTransform, isAliasSchemaModel } from "../schema/index.js";

/**
 * Turns the model into a single all-of with various
 * sub compound models in it.
 * This is useful for the rare case in wich a schema defines different compounds on a single
 * schema node. So if a schema has an allOf *and* a oneOf. This edge case is handled buy
 * exploding the schema into a schem of allOf with all of the compounds in it.
 *
 * this
 * ```yaml
 * - reference: 10
 * - allOf
 *   - 100
 *   - 200
 * - anyOf
 *   - 300
 *   - 400
 * - oneOf
 *   - 500
 *   - 600
 * - if: 700
 *   then: 800
 *   else: 900
 * ```
 *
 * will become
 * ```yaml
 * - allOf
 *   - 1
 *   - 2
 *   - 3
 *   - 4
 *   - 5
 * - parent: 0
 *   reference: 10
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
 * - parent: 0
 *   if: 700
 *   then: 800
 *   else: 900

 * ```
 *
 */
export const explode: SchemaTransform = (arena, model, modelKey) => {
  if (isAliasSchemaModel(model)) {
    return model;
  }

  let count = 0;
  if (model.reference != null) {
    count++;
  }
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
    // nothing to explode here
    return model;
  }

  let newModel = { ...model };
  delete newModel.reference;
  delete newModel.allOf;
  delete newModel.anyOf;
  delete newModel.oneOf;
  delete newModel.if;
  delete newModel.then;
  delete newModel.else;

  newModel.allOf = [];

  if (model.reference != null) {
    const newSubModel: SchemaModel = {
      reference: model.reference,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

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
