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
  arena.addItem({ id: null, type: "oneOf", elements: [1, 2] }); // 3
  arena.addItem({ id: null, type: "allOf", elements: [0, 3] }); // 4

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "string" }, // 0
      { id: null, type: "string" }, // 1
      { id: null, type: "string" }, // 2
      { id: null, type: "oneOf", elements: [1, 2] }, // 3
      { id: null, type: "oneOf", elements: [5, 6] }, // 4
      { id: null, type: "allOf", elements: [0, 1] }, // 5
      { id: null, type: "allOf", elements: [0, 2] }, // 6
    ],
  );
  assert(!hasDoubleReference([...arena]));
});
