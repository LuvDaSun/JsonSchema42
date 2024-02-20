import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../schema/arena.js";
import { normalizeObject } from "../utils/index.js";
import { flatten } from "./flatten.js";

test("flatten", () => {
  const arena = new SchemaArena();
  arena.addItem({
    allOf: [100, 200],
  });
  arena.addItem({
    allOf: [300, 400],
  });
  arena.addItem({
    allOf: [0, 1],
  });

  while (arena.applyTransform(flatten) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

    [{ allOf: [100, 200] }, { allOf: [300, 400] }, { allOf: [100, 200, 300, 400] }],
  );
});
