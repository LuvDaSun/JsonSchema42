import { SchemaModel, SchemaTransform } from "../schema/index.js";

/**
 * Flattens nested allOf, anyOf, oneOf
 *
 * ```yaml
 * - oneOf:
 *   - 1
 *   - 2
 * - parent: 0
 *    oneOf:
 *   - 200
 *   - 300
 * - parent: 0
 * - oneOf:
 *   - 400
 *   - 500
 * ```
 *
 * will become
 *
 * ```yaml
 * - oneOf:
 *   - 200
 *   - 300
 *   - 400
 *   - 500
 * ```
 */
export const flatten: SchemaTransform = (arena, model, modelKey) => {
  if ("alias" in model) {
    return model;
  }

  if (model.types == null || model.types.length == 1) {
    return model;
  }

  if (model.oneOf != null) {
    return model;
  }

  // copy the model
  const newModel = { ...model };
  // remove the types
  delete newModel.types;

  // create the oneOf
  newModel.oneOf = [];
  for (const type of model.types) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      types: [type],
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.oneOf.push(newSubKey);
  }

  return newModel;
};
