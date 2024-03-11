import { SchemaItem, SchemaTransform } from "../models/index.js";

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

  if (item.oneOf != null) {
    return;
  }

  const subKeys = new Array<number>();

  if (item.then != null) {
    const thenItem: SchemaItem = {
      exact: false,
      allOf: [item.if, item.then],
    };
    const thenKey = arena.addItem(thenItem);
    subKeys.push(thenKey);
  }

  if (item.else != null) {
    const notIfItem: SchemaItem = {
      exact: false,
      not: item.if,
    };
    const notIfKey = arena.addItem(notIfItem);

    const elseItem: SchemaItem = {
      exact: false,
      allOf: [notIfKey, item.else],
    };
    const elseKey = arena.addItem(elseItem);
    subKeys.push(elseKey);
  }

  if (subKeys.length === 0) {
    const itemNew: SchemaItem = {
      ...item,
      if: undefined,
      then: undefined,
      else: undefined,
    };
    arena.setItem(key, itemNew);
    return;
  }

  const itemNew: SchemaItem = {
    ...item,
    exact: false,
    oneOf: subKeys,
    if: undefined,
    then: undefined,
    else: undefined,
  };
  arena.setItem(key, itemNew);
};
