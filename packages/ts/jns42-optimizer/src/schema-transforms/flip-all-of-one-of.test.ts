import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../schema/index.js";
import { normalizeObject } from "../utils/index.js";
import { flipAllOfOneOf } from "./flip-all-of-one-of.js";

const useTransforms = [flipAllOfOneOf];

test("flip-all-of-one-of", () => {
  const arena = new SchemaArena();
  arena.addItem({ types: ["string"] }); // 0
  arena.addItem({ types: ["string"] }); // 1
  arena.addItem({ types: ["string"] }); // 2
  arena.addItem({ types: ["string"] }); // 3
  arena.addItem({ types: ["string"] }); // 4
  arena.addItem({ types: ["string"] }); // 5
  arena.addItem({ oneOf: [2, 3] }); // 6
  arena.addItem({ oneOf: [4, 5] }); // 7
  arena.addItem({ allOf: [0, 1, 6, 7] }); // 8

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),
    [
      { types: ["string"] }, // 0
      { types: ["string"] }, // 1
      { types: ["string"] }, // 2
      { types: ["string"] }, // 3
      { types: ["string"] }, // 4
      { types: ["string"] }, // 5
      { oneOf: [2, 3] }, // 6
      { oneOf: [4, 5] }, // 7
      { oneOf: [9, 10, 11, 12] }, // 8
      { allOf: [0, 1, 2] }, // 9
      { allOf: [0, 1, 3] }, // 10
      { allOf: [0, 1, 4] }, // 11
      { allOf: [0, 1, 5] }, // 12
    ],
  );
});
