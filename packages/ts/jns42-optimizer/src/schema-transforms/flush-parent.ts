import {
  SchemaTransform,
  isAllOfSchemaModel,
  isAnyOfSchemaModel,
  isOneOfSchemaModel,
} from "../schema/index.js";

/**
 * Flushes unused type properties from parents by first checking if all children have
 * successfully merged those properties. This applies to reference, allOf, anyOf, oneOf
 * schema models.
 *
 * ```yaml
 * - types:
 *   - object
 *   required:
 *   - "a"
 *   - "b"
 *   oneOf:
 *   - 1
 *   - 2
 * - required:
 *   - "a"
 *   - "b"
 * - types:
 *   - object
 *   required:
 *   - "a"
 *   - "b"
 * ```
 *
 * will become
 *
 * ```yaml
 * - types:
 *   - object
 *   oneOf:
 *   - 1
 *   - 2
 * - required:
 *   - "a"
 *   - "b"
 * - types:
 *   - object
 *   required:
 *   - "a"
 *   - "b"
 * ```
 */
export const flushParent: SchemaTransform = (arena, model, modelKey) => {
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
