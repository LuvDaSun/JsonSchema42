import { SchemaModel, SchemaTransform } from "../models/index.js";
import { exclude } from "../utils/index.js";

/**
 * This transformer turns if-then-else into a one-of
 *
 * ```yaml
 * - required:
 *   - a
 *   - b
 *   not: 1
 * - required
 *   - a
 *
 *
 * will become
 *
 * ```yaml
 * - required:
 *   - b
 * - required
 *   - a
 * ```
 */
export const resolveNot: SchemaTransform = (arena, key) => {
  const item = arena.getItem(key);

  if (item.not == null) {
    return;
  }

  if (item.reference != null) {
    return;
  }

  const subItem = arena.getItem(item.not);

  const itemNew: SchemaModel = {
    ...item,
    exact: false,
    not: undefined,
    required: exclude(item.required, subItem.required),
  };

  arena.setItem(key, itemNew);
};
