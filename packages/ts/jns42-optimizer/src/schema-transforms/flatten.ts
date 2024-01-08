import {
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
  const { id } = model;

  if (isAllOfSchemaModel(model)) {
    const elements = new Array<number>();
    for (const subKey of model.allOf) {
      const [, subModel] = arena.resolveItem(subKey);

      if (isAllOfSchemaModel(subModel)) {
        elements.push(...subModel.allOf);
      } else {
        elements.push(subKey);
      }
    }
    if (elements.length > model.allOf.length) {
      return {
        id,
        allOf: elements,
      };
    }
  }

  if (isAnyOfSchemaModel(model)) {
    const elements = new Array<number>();
    for (const subKey of model.anyOf) {
      const [, subModel] = arena.resolveItem(subKey);

      if (isAnyOfSchemaModel(subModel)) {
        elements.push(...subModel.anyOf);
      } else {
        elements.push(subKey);
      }
    }
    if (elements.length > model.anyOf.length) {
      return {
        id,
        anyOf: elements,
      };
    }
  }

  if (isOneOfSchemaModel(model)) {
    const elements = new Array<number>();
    for (const subKey of model.oneOf) {
      const [, subModel] = arena.resolveItem(subKey);

      if (isOneOfSchemaModel(subModel)) {
        elements.push(...subModel.oneOf);
      } else {
        elements.push(subKey);
      }
    }
    if (elements.length > model.oneOf.length) {
      return {
        id,
        oneOf: elements,
      };
    }
  }

  return model;
};
