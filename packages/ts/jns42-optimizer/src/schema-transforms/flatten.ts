import {
  AllOfSchemaModel,
  AnyOfSchemaModel,
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isAllOfSchemaModel,
  isAnyOfSchemaModel,
  isOneOfSchemaModel,
} from "../schema/index.js";

/**
 * Flattens nested allOf, anyOf, oneOf
 *
 * ```yaml
 * - oneOf:
 *   - 1
 *   - 2
 * - parent: 0
 *   oneOf:
 *   - 200
 *   - 300
 * - parent: 0
 *   oneOf:
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
  if (isAllOfSchemaModel(model)) {
    const newModel: SchemaModel & AllOfSchemaModel = {
      ...model,
      allOf: [],
    };
    for (const subKey of model.allOf) {
      const [, subModel] = arena.resolveItem(subKey);

      if (isAllOfSchemaModel(subModel)) {
        newModel.allOf.push(...subModel.allOf);
      } else {
        newModel.allOf.push(subKey);
      }
    }
    if (newModel.allOf.length > model.allOf.length) {
      return newModel;
    }
  }

  if (isAnyOfSchemaModel(model)) {
    const newModel: SchemaModel & AnyOfSchemaModel = {
      ...model,
      anyOf: [],
    };
    for (const subKey of model.anyOf) {
      const [, subModel] = arena.resolveItem(subKey);

      if (isAnyOfSchemaModel(subModel)) {
        newModel.anyOf.push(...subModel.anyOf);
      } else {
        newModel.anyOf.push(subKey);
      }
    }
    if (newModel.anyOf.length > model.anyOf.length) {
      return newModel;
    }
  }

  if (isOneOfSchemaModel(model)) {
    const newModel: SchemaModel & OneOfSchemaModel = {
      ...model,
      oneOf: [],
    };
    for (const subKey of model.oneOf) {
      const [, subModel] = arena.resolveItem(subKey);

      if (isOneOfSchemaModel(subModel)) {
        newModel.oneOf.push(...subModel.oneOf);
      } else {
        newModel.oneOf.push(subKey);
      }
    }
    if (newModel.oneOf.length > model.oneOf.length) {
      return newModel;
    }
  }

  return model;
};
