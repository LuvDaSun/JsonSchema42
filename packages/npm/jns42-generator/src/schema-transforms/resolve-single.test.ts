import assert from "assert";
import test from "node:test";
import { SchemaArena } from "../models/arena.js";
import { normalizeObject } from "../utils/index.js";
import { resolveSingleAllOf } from "./resolve-single.js";

test("alias", () => {
  const arena = new SchemaArena([{ allOf: [100] }]);

  while (arena.applyTransform(resolveSingleAllOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [{ reference: 100 }],
  );
});
