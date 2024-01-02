import {
  SchemaTransform,
  isAlias,
  isAllOf,
  isAnyOf,
  isOneOf,
  isReference,
} from "../schema/index.js";

/**
 * This transformer makes the types array into a single type. This is achieved by creating a
 * few new types with a single type and putting them in a oneOf.
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
  if (isAlias(model)) {
    return model;
  }

  if (isReference(model)) {
    return {
      id: model.id,
      alias: model.reference,
    };
  }

  if (isAllOf(model) && model.allOf.length === 1) {
    return {
      id: model.id,
      alias: model.allOf[0],
    };
  }

  if (isAnyOf(model) && model.anyOf.length === 1) {
    return {
      id: model.id,
      alias: model.anyOf[0],
    };
  }

  if (isOneOf(model) && model.oneOf.length === 1) {
    return {
      id: model.id,
      alias: model.oneOf[0],
    };
  }

  return model;
};
