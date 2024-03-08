import {
  SchemaTransform,
  isAliasSchemaModel,
  isAllOfSchemaModel,
  isAnyOfSchemaModel,
  isOneOfSchemaModel,
  isReferenceSchemaModel,
} from "../models/index.js";

/**
 * This transformer makes an alias if there is a single reference, allOf, anyOf or oneOf.
 *
 * ```yaml
 * - oneOf:
 *   - 1
 * ```
 *
 * will become
 *
 * ```yaml
 * - alias: 1
 * ```
 */
export const alias: SchemaTransform = (arena, modelKey) => {
  const model = arena.getItem(modelKey);

  if (isAliasSchemaModel(model)) {
    return model;
  }

  if (isReferenceSchemaModel(model)) {
    return { ...model, alias: model.reference, reference: undefined };
  }

  if (isAllOfSchemaModel(model) && model.allOf.length === 1) {
    return {
      ...model,
      alias: model.allOf[0],
      allOf: undefined,
    };
  }

  if (isAnyOfSchemaModel(model) && model.anyOf.length === 1) {
    return {
      ...model,
      alias: model.anyOf[0],
      anyOf: undefined,
    };
  }

  if (isOneOfSchemaModel(model) && model.oneOf.length === 1) {
    return {
      ...model,
      alias: model.oneOf[0],
      oneOf: undefined,
    };
  }

  return model;
};
