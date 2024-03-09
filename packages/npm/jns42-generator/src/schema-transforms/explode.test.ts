import assert from "assert";
import test from "node:test";
import { SchemaArena } from "../models/arena.js";
import { normalizeObject } from "../utils/index.js";
import { explode } from "./explode.js";

test("explode", () => {
  const arena = new SchemaArena([
    {
      reference: 10,
      allOf: [100, 200],
      anyOf: [300, 400],
      oneOf: [500, 600],
      if: 700,
      then: 800,
      else: 900,
    },
  ]);

  while (arena.applyTransform(explode) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { allOf: [1, 2, 3, 4, 5] },
      { parent: 0, reference: 10 },
      { parent: 0, allOf: [100, 200] },
      { parent: 0, anyOf: [300, 400] },
      { parent: 0, oneOf: [500, 600] },
      { parent: 0, if: 700, then: 800, else: 900 },
    ],
  );
});
