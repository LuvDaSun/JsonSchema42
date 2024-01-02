import { SchemaTransform } from "../schema/index.js";

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
  if ("alias" in model) {
    return model;
  }

  let counter = 0;
  for (const member in model) {
    switch (member) {
      case "id":
        break;

      default:
        counter++;
        break;
    }
  }

  if (counter > 1) {
    return model;
  }

  if (model.allOf != null && model.allOf.length === 1) {
    return {
      id: model.id,
      alias: model.allOf[0],
    };
  }

  if (model.anyOf != null && model.anyOf.length === 1) {
    return {
      id: model.id,
      alias: model.anyOf[0],
    };
  }

  if (model.oneOf != null && model.oneOf.length === 1) {
    return {
      id: model.id,
      alias: model.oneOf[0],
    };
  }

  return model;
};
