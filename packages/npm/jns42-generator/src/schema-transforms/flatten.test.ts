import assert from "assert";
import test from "node:test";
import { SchemaArena } from "../models/arena.js";
import { normalizeObject } from "../utils/index.js";
import { flattenAllOf } from "./flatten.js";

test("flatten", () => {
  const arena = new SchemaArena([
    {}, // 0
    {}, // 1
    {}, // 2
    {}, // 3
    {
      allOf: [0, 1],
    }, // 4
    {
      allOf: [2, 3],
    }, // 5
    {
      allOf: [4, 5],
    }, // 6
  ]);

  while (arena.applyTransform(flattenAllOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      {}, // 0
      {}, // 1
      {}, // 2
      {}, // 3
      { allOf: [0, 1] }, // 4
      { allOf: [2, 3] }, // 5
      { allOf: [0, 1, 2, 3] }, // 6
    ],
  );
});
