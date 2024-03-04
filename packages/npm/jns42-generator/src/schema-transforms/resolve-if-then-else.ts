import {
  AllOfSchemaModel,
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  TypeSchemaModel,
  isIfSchemaModel,
} from "../schema/index.js";

/**
 * This transformer turns if-then-else into a one-of
 *
 * ```yaml
 * - if: 100
 *   then: 200
 *   else : 300
 * ```
 *
 * will become
 *
 * ```yaml
 * - oneOf
 *   - 2
 *   - 3
 * - not: 100
 * - allOf:
 *   - 100
 *   - 200
 * - allOf:
 *   - 1
 *   - 300
 * ```
 */
export const resolveIfThenElse: SchemaTransform = (arena, model, modelKey) => {
  if (!isIfSchemaModel(model)) {
    return model;
  }

  const newModel: OneOfSchemaModel & SchemaModel = {
    ...model,
    oneOf: [],
    if: undefined,
    then: undefined,
    else: undefined,
  };

  if (model.then != null) {
    const thenModel: AllOfSchemaModel = {
      allOf: [model.if, model.then],
    };
    const thenKey = arena.addItem(thenModel);
    newModel.oneOf.push(thenKey);
  }

  if (model.else != null) {
    const notIfModel: TypeSchemaModel = {
      not: model.if,
    };
    const notIfKey = arena.addItem(notIfModel);

    const elseModel: AllOfSchemaModel = {
      allOf: [notIfKey, model.else],
    };
    const elseKey = arena.addItem(elseModel);
    newModel.oneOf.push(elseKey);
  }

  return newModel;
};
