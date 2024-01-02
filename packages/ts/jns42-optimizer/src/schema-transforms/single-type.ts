import { SchemaModel, SchemaTransform, isSingleType } from "../schema/index.js";

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
 * - types:
 *   - number
 * - types:
 *   - string
 * ```
 *
 * @param arena
 * @param model
 * @returns
 */

export const singleType: SchemaTransform = (arena, model, modelKey) => {
  if (model.types == null || isSingleType(model)) {
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
