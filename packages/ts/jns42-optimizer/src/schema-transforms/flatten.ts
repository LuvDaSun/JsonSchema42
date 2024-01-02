import { SchemaTransform, isAllOf, isAnyOf, isOneOf } from "../schema/index.js";

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

  if (isAllOf(model)) {
    const elements = new Array<number>();
    for (const subKey of model.allOf) {
      const [, subModel] = arena.resolveItem(subKey);

      if (isAllOf(subModel)) {
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

  if (isAnyOf(model)) {
    const elements = new Array<number>();
    for (const subKey of model.anyOf) {
      const [, subModel] = arena.resolveItem(subKey);

      if (isAnyOf(subModel)) {
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

  if (isOneOf(model)) {
    const elements = new Array<number>();
    for (const subKey of model.oneOf) {
      const [, subModel] = arena.resolveItem(subKey);

      if (isOneOf(subModel)) {
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
