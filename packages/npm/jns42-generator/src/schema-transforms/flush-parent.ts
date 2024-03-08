import {
  SchemaTransform,
  isAllOfSchemaModel,
  isAnyOfSchemaModel,
  isChildSchemaModel,
  isOneOfSchemaModel,
  isReferenceSchemaModel,
} from "../models/index.js";

/**
 * Flushes type properties from parents if the children have no parent relationship
 * anymore. This applies to reference, allOf, anyOf, oneOf
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
 * - types:
 *   - object
 *   required:
 *   - "a"
 *   - "b"
 *   - "c"
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
 * - oneOf:
 *   - 1
 *   - 2
 * - types:
 *   - object
 *   required:
 *   - "a"
 *   - "b"
 *   - "c"
 * - types:
 *   - object
 *   required:
 *   - "a"
 *   - "b"
 * ```
 */
export const flushParent: SchemaTransform = (arena, model, modelKey) => {
  const newModel = {
    ...model,
    not: undefined,
    types: undefined,
    options: undefined,
    required: undefined,
    propertyNames: undefined,
    contains: undefined,
    tupleItems: undefined,
    arrayItems: undefined,
    objectProperties: undefined,
    mapProperties: undefined,
  };

  if (isReferenceSchemaModel(model)) {
    const [, subModel] = arena.resolveItem(model.reference);
    if (!isChildSchemaModel(subModel)) {
      return model;
    }
    return newModel;
  }

  if (isAllOfSchemaModel(model)) {
    for (const subKey of model.allOf) {
      const [, subModel] = arena.resolveItem(subKey);
      if (!isChildSchemaModel(subModel)) {
        return model;
      }
    }
    return newModel;
  }

  if (isAnyOfSchemaModel(model)) {
    for (const subKey of model.anyOf) {
      const [, subModel] = arena.resolveItem(subKey);
      if (!isChildSchemaModel(subModel)) {
        return model;
      }
    }
    return newModel;
  }

  if (isOneOfSchemaModel(model)) {
    for (const subKey of model.oneOf) {
      const [, subModel] = arena.resolveItem(subKey);
      if (!isChildSchemaModel(subModel)) {
        return model;
      }
    }
    return newModel;
  }

  return model;
};
