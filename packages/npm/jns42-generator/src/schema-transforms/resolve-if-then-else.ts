import {
  AllOfSchemaModel,
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  TypeSchemaModel,
} from "../models/index.js";

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
export const resolveIfThenElse: SchemaTransform = (arena, key) => {
  const item = arena.getItem(key);

  if (item.if == null) {
    return;
  }

  const itemNew: OneOfSchemaModel & SchemaModel = {
    ...item,
    oneOf: [],
    if: undefined,
    then: undefined,
    else: undefined,
  };

  if (item.then != null) {
    const thenModel: AllOfSchemaModel = {
      allOf: [item.if, item.then],
    };
    const thenKey = arena.addItem(thenModel);
    itemNew.oneOf.push(thenKey);
  }

  if (item.else != null) {
    const notIfModel: TypeSchemaModel = {
      not: item.if,
    };
    const notIfKey = arena.addItem(notIfModel);

    const elseModel: AllOfSchemaModel = {
      allOf: [notIfKey, item.else],
    };
    const elseKey = arena.addItem(elseModel);
    itemNew.oneOf.push(elseKey);
  }

  arena.setItem(key, itemNew);
};
