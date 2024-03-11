import { SchemaTransform } from "../models/index.js";

/**
 * This transformer makes the types array into a single type. This is achieved by creating a
 * few new types with a single type and putting them in a oneOf.
 *
 * ```yaml
 * - types:
 *   - number
 *   - string
 * ```
 *
 * will become
 *
 * ```yaml
 * - oneOf:
 *   - 1
 *   - 2
 * - parent: 0
 *   types:
 *   - number
 * - parent: 0
 *   types:
 *   - string
 * ```
 */
export const singleType: SchemaTransform = (arena, key) => {
  const item = arena.getItem(key);

  if (item.types == null) {
    return;
  }

  switch (item.types.length) {
    case 0: {
      arena.setItem(key, {
        ...item,
        types: undefined,
      });
      break;
    }
    case 1: {
      break;
    }
    default: {
      arena.setItem(key, {
        ...item,
        types: undefined,
        oneOf: item.types.map((type) => arena.addItem({ types: [type] })),
      });
    }
  }
};
