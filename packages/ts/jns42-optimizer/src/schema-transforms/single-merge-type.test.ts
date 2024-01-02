import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../schema/arena.js";
import { normalizeObject } from "../utils/index.js";
import { toAllOf } from "./single-merge-type.js";

test("single-merge-type", () => {
  const arena = new SchemaArena();
  arena.addItem({
    allOf: [100, 200],
    anyOf: [300, 400],
    oneOf: [500, 600],
    if: 700,
    then: 800,
    else: 900,
  });

  while (arena.applyTransform(toAllOf) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

    [
      { allOf: [1, 2, 3, 4] },
      { parent: 0, allOf: [100, 200] },
      { parent: 0, anyOf: [300, 400] },
      { parent: 0, oneOf: [500, 600] },
      { parent: 0, if: 700, then: 800, else: 900 },
    ],
  );
});
