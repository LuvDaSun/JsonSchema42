import assert from "assert";
import test from "node:test";
import { SchemaArena } from "../models/arena.js";
import { normalizeObject } from "../utils/index.js";
import { flattenAllOf } from "./flatten.js";

test("flatten", () => {
  const arena = new SchemaArena([
    {},
    {},
    {},
    {},
    {
      allOf: [0, 1],
    },
    {
      allOf: [2, 3],
    },
    {
      allOf: [4, 5],
    },
  ]);

  while (arena.applyTransform(flattenAllOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [{}, {}, {}, {}, { allOf: [0, 1] }, { allOf: [2, 3] }, { allOf: [0, 1, 2, 3] }],
  );
});
