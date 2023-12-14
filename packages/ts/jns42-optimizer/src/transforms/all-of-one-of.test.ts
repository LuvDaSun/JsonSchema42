import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { hasDoubleReference } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.allOfOneOf];

test("all-of-one-of", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "string" }); // 0
  arena.addItem({ id: null, type: "string" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "string" }); // 3
  arena.addItem({ id: null, type: "string" }); // 4
  arena.addItem({ id: null, type: "string" }); // 5
  arena.addItem({ id: null, type: "oneOf", elements: [2, 3] }); // 6
  arena.addItem({ id: null, type: "oneOf", elements: [4, 5] }); // 7
  arena.addItem({ id: null, type: "allOf", elements: [0, 1, 6, 7] }); // 8

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "string" }, // 0
      { id: null, type: "string" }, // 1
      { id: null, type: "string" }, // 2
      { id: null, type: "string" }, // 3
      { id: null, type: "string" }, // 4
      { id: null, type: "string" }, // 5
      { id: null, type: "oneOf", elements: [2, 3] }, // 6
      { id: null, type: "oneOf", elements: [4, 5] }, // 7
      { id: null, type: "oneOf", elements: [9, 10, 11, 12] }, // 8
      { id: null, type: "allOf", elements: [0, 1, 2] }, // 9
      { id: null, type: "allOf", elements: [0, 1, 3] }, // 10
      { id: null, type: "allOf", elements: [0, 1, 4] }, // 11
      { id: null, type: "allOf", elements: [0, 1, 5] }, // 12
    ],
  );
  assert(!hasDoubleReference([...arena]));
});
