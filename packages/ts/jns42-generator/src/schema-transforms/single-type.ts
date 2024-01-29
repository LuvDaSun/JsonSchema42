import {
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isAliasSchemaModel,
  isSingleTypeSchemaModel,
  isTypeSchemaModel,
} from "../schema/index.js";

/**
 * This transformer makes the types array into a single type. This is achieved by creating a
 * few new types with a single type and putting them in a oneOf.
 *
 * ```yaml
 * - types:
 *   - number
 *   - string
 * ```
 *
 * will become
 *
 * ```yaml
 * - oneOf:
 *   - 1
 *   - 2
 * - parent: 0
 *   types:
 *   - number
 * - parent: 0
 *   types:
 *   - string
 * ```
 */
export const singleType: SchemaTransform = (arena, model, modelKey) => {
  if (isAliasSchemaModel(model)) {
    return model;
  }

  if (isSingleTypeSchemaModel(model)) {
    return model;
  }

  if (!isTypeSchemaModel(model)) {
    return model;
  }

  if (model.types == null) {
    return model;
  }

  if (model.types.length == 0) {
    return {
      ...model,
      types: undefined,
    };
  }

  // copy the model
  const newModel: SchemaModel & OneOfSchemaModel = { ...model, types: undefined, oneOf: [] };

  for (const type of model.types) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      mockable: model.mockable,
      types: [type],
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.oneOf.push(newSubKey);
  }

  return newModel;
};
