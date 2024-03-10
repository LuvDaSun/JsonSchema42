import { SchemaItem, SchemaTransform } from "../models/index.js";

/**
 * Turns the model into a single all-of with various
 * sub compound models in it.
 * This is useful for the rare case in which a schema defines different compounds on a single
 * schema node. So if a schema has an allOf *and* a oneOf. This edge case is handled buy
 * exploding the schema into a schema of allOf with all of the compounds in it.
 *
 * this
 * ```yaml
 * - reference: 10
 * - allOf
 *   - 100
 *   - 200
 * - anyOf
 *   - 300
 *   - 400
 * - oneOf
 *   - 500
 *   - 600
 * - if: 700
 *   then: 800
 *   else: 900
 * ```
 *
 * will become
 * ```yaml
 * - allOf
 *   - 1
 *   - 2
 *   - 3
 *   - 4
 * - parent: 0
 *   reference: 10
 * - allOf
 *   parent: 0
 *   allOf
 *   - 100
 *   - 200
 * - parent: 0
 *   anyOf
 *   - 300
 *   - 400
 * - parent: 0
 *   oneOf
 *   - 500
 *   - 600
 * - parent: 0
 *   if: 700
 *   then: 800
 *   else: 900
 *
 * ```
 *
 */
export const explode: SchemaTransform = (arena, key) => {
  const item = arena.getItem(key);

  const subItems = new Array<SchemaItem>();

  if (item.types != null && item.types.length > 0) {
    subItems.push({
      parent: key,
      types: item.types,
    });
  }

  if (item.reference != null) {
    subItems.push({
      parent: key,
      reference: item.reference,
    });
  }

  if (item.allOf != null && item.allOf.length > 0) {
    subItems.push({
      parent: key,
      allOf: item.allOf,
    });
  }

  if (item.anyOf != null && item.anyOf.length > 0) {
    subItems.push({
      parent: key,
      anyOf: item.anyOf,
    });
  }

  if (item.oneOf != null && item.oneOf.length > 0) {
    subItems.push({
      parent: key,
      oneOf: item.oneOf,
    });
  }

  if (item.if != null || item.then != null || item.else != null) {
    subItems.push({
      parent: key,
      if: item.if,
      then: item.then,
      else: item.else,
    });
  }

  if (subItems.length > 1) {
    let subKeys = subItems.map((subItem) => arena.addItem(subItem));
    arena.setItem(key, {
      ...item,
      types: undefined,
      reference: undefined,
      allOf: subKeys,
      anyOf: undefined,
      oneOf: undefined,
      if: undefined,
      then: undefined,
      else: undefined,
    });
  }
};
