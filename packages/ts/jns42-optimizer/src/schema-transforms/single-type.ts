import { SchemaModel, SchemaTransform, isAlias } from "../schema/index.js";

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
  if (isAlias(model)) {
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