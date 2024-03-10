import { SchemaTransform } from "../models/index.js";

/**
 * This transformer makes an alias if there is a single reference, allOf, anyOf or oneOf.
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
export const resolveSingleAllOf = createTransformer("allOf");
export const resolveSingleAnyOf = createTransformer("anyOf");
export const resolveSingleOneOf = createTransformer("oneOf");

function createTransformer(member: "allOf" | "anyOf" | "oneOf"): SchemaTransform {
  return (arena, key) => {
    const item = arena.getItem(key);

    const subKeys = item[member];
    if (subKeys == null) {
      return;
    }

    switch (subKeys.length) {
      case 0: {
        arena.setItem(key, { ...item, [member]: null });
        break;
      }

      case 1: {
        if (item.reference != null) {
          return;
        }
        arena.setItem(key, { ...item, reference: subKeys[0], [member]: null });
        break;
      }

      default: {
      }
    }
  };
}
