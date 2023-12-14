import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { deleteUndefined, hasDoubleReference } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.allOfOneOf];

test("all-of-one-of", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "string" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ type: "string" }); // 4
  arena.addItem({ type: "string" }); // 5
  arena.addItem({ type: "oneOf", oneOf: [2, 3] }); // 6
  arena.addItem({ type: "oneOf", oneOf: [4, 5] }); // 7
  arena.addItem({ type: "allOf", allOf: [0, 1, 6, 7] }); // 8

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),
    [
      { type: "string" }, // 0
      { type: "string" }, // 1
      { type: "string" }, // 2
      { type: "string" }, // 3
      { type: "string" }, // 4
      { type: "string" }, // 5
      { type: "oneOf", oneOf: [2, 3] }, // 6
      { type: "oneOf", oneOf: [4, 5] }, // 7
      { type: "oneOf", oneOf: [9, 10, 11, 12] }, // 8
      { type: "allOf", allOf: [0, 1, 2] }, // 9
      { type: "allOf", allOf: [0, 1, 3] }, // 10
      { type: "allOf", allOf: [0, 1, 4] }, // 11
      { type: "allOf", allOf: [0, 1, 5] }, // 12
    ],
  );
  assert(!hasDoubleReference([...arena]));
});
