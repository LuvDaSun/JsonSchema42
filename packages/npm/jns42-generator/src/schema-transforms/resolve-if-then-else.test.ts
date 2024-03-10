import assert from "assert";
import test from "node:test";
import { SchemaArena } from "../models/arena.js";
import { normalizeObject } from "../utils/index.js";
import { resolveIfThenElse } from "./resolve-if-then-else.js";

test("if-then-else", () => {
  const arena = new SchemaArena([
    {
      if: 100,
      then: 200,
      else: 300,
    },
  ]);

  while (arena.applyTransform(resolveIfThenElse) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      {
        oneOf: [1, 3],
        exact: false,
      }, // 0
      { allOf: [100, 200], exact: false }, // 1
      { not: 100, exact: false }, // 2
      { allOf: [2, 300], exact: false }, // 3
    ],
  );
});
