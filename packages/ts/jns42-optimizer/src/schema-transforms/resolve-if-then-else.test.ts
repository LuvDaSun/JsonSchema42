import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../schema/arena.js";
import { normalizeObject } from "../utils/index.js";
import { resolveIfThenElse } from "./resolve-if-then-else.js";

test("if-then-else", () => {
  const arena = new SchemaArena();
  arena.addItem({
    if: 100,
    then: 200,
    else: 300,
  });

  while (arena.applyTransform(resolveIfThenElse) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

    [
      {
        oneOf: [2, 3],
      }, // 0
      { not: [100] }, // 1
      { allOf: [100, 200] }, // 2
      { allOf: [1, 300] }, // 3
    ],
  );
});
