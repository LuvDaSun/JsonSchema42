import { isThen } from "schema-intermediate";
import { SchemaTransform } from "../schema/index.js";

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
 *   - 1
 *   - 2
 * - allOf:
 *   - 100
 *   - 200
 * - allOf:
 *   - 1
 *   - 300
 * - not: 100
 * ```
 */
export const resolveIfThenElse: SchemaTransform = (arena, model, modelKey) => {
  // we need at least two to merge
  if (!isThen(model)) {
    return model;
  }

  return model;
};
