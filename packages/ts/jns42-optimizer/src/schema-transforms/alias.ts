import {
  SchemaTransform,
  isAliasSchemaModel,
  isAllOfSchemaModel,
  isAnyOfSchemaModel,
  isOneOfSchemaModel,
  isReferenceSchemaModel,
} from "../schema/index.js";

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
export const alias: SchemaTransform = (arena, model, modelKey) => {
  if (isAliasSchemaModel(model)) {
    return model;
  }

  if (isReferenceSchemaModel(model)) {
    return {
      id: model.id,
      alias: model.reference,
    };
  }

  if (isAllOfSchemaModel(model) && model.allOf.length === 1) {
    return {
      id: model.id,
      alias: model.allOf[0],
    };
  }

  if (isAnyOfSchemaModel(model) && model.anyOf.length === 1) {
    return {
      id: model.id,
      alias: model.anyOf[0],
    };
  }

  if (isOneOfSchemaModel(model) && model.oneOf.length === 1) {
    return {
      id: model.id,
      alias: model.oneOf[0],
    };
  }

  return model;
};
