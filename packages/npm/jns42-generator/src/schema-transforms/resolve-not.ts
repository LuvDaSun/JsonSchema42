import { SchemaItem, SchemaTransform } from "../models/index.js";
import { exclude } from "../utils/index.js";

/**
 * This transformer turns resolves the not field
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

  const subItem = arena.getItem(item.not);

  const itemNew: SchemaItem = {
    ...item,
    exact: false,
    not: undefined,
    required: exclude(item.required, subItem.required),
  };

  arena.setItem(key, itemNew);
};
