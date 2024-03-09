import { SchemaTransform } from "../models/index.js";

/**
 * Flattens nested allOf, anyOf, oneOf
 *
 * ```yaml
 * - oneOf:
 *   - 1
 *   - 2
 * - parent: 0
 *   oneOf:
 *   - 200
 *   - 300
 * - parent: 0
 *   oneOf:
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

export const flattenAllOf = createTransformer("allOf");
export const flattenAnyOf = createTransformer("anyOf");
export const flattenOneOf = createTransformer("oneOf");

function createTransformer(member: "allOf" | "anyOf" | "oneOf"): SchemaTransform {
  return (arena, key) => {
    const item = arena.getItem(key);

    const subKeys = item[member];
    if (subKeys != null) {
      let subKeysNew = subKeys
        .map((subKey) => [subKey, arena.getItem(subKey)] as const)
        .flatMap(([subKey, subItem]) => {
          const subSubKeys = subItem[member];
          if (subSubKeys == null) {
            return [subKey];
          } else {
            return subSubKeys;
          }
        });

      if (subKeys.length !== subKeysNew.length) {
        arena.setItem(key, { ...item, [member]: subKeysNew });
      }
    }
  };
}
