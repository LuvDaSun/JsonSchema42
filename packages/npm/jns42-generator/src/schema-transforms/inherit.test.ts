import assert from "assert";
import test from "node:test";
import { SchemaArena } from "../models/index.js";
import { normalizeObject } from "../utils/index.js";
import { inheritOneOf } from "./inherit.js";

test("inherit-one-of", () => {
  const arena = new SchemaArena([
    {}, // 0
    { minimumInclusive: 0, oneOf: [0] }, // 1
  ]);

  while (arena.applyTransform(inheritOneOf) > 0);

  assert.deepEqual([...arena].map(normalizeObject), [
    {}, // 0
    { oneOf: [3] }, // 1
    { minimumInclusive: 0 }, // 2
    { allOf: [0, 2] }, // 3
  ]);
});
