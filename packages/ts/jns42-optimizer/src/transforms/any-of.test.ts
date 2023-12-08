import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { hasDoubleReference } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.flatten, transforms.alias, transforms.unknown, transforms.anyOf];

test("any-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ type: "unknown" });
  const n = arena.addItem({ type: "never" });
  const a = arena.addItem({ type: "any" });
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "anyOf", elements: [num, u] });
  arena.addItem({ type: "anyOf", elements: [num, n] });
  arena.addItem({ type: "anyOf", elements: [num, a] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena],
    [
      { type: "unknown" },
      { type: "never" },
      { type: "any" },
      { type: "number" },
      { type: "alias", target: 4 },
      { type: "alias", target: 4 },
      { type: "any" },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "anyOf", elements: [num, num, num] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual([...arena], [{ type: "number" }, { type: "alias", target: num }]);
  assert(!hasDoubleReference([...arena]));
});

test("any-of primitive", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ type: "string" }); // 4
  arena.addItem({ type: "anyOf", elements: [1, 2] }); // 5
  arena.addItem({ type: "anyOf", elements: [3, 4] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena],
    [
      { type: "number" }, // 1
      { type: "string" }, // 2
      { type: "string" }, // 3
      { type: "string" }, // 4
      { type: "oneOf", elements: [1, 2] }, // 5
      { type: "alias", target: 7 }, // 6
      { type: "string" }, // 7
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of tuple", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ type: "string" }); // 4
  arena.addItem({ type: "tuple", elements: [1, 2] }); // 5
  arena.addItem({ type: "tuple", elements: [3, 4] }); // 6
  arena.addItem({ type: "anyOf", elements: [5, 6] }); // 7

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena],
    [
      { type: "number" }, // 1
      { type: "string" }, // 2
      { type: "string" }, // 3
      { type: "string" }, // 4
      { type: "tuple", elements: [1, 2] }, // 5
      { type: "tuple", elements: [3, 4] }, // 6
      { type: "tuple", elements: [8, 9] }, // 7
      { type: "oneOf", elements: [1, 3] }, // 8
      { type: "alias", target: 10 }, // 9
      { type: "string" }, // 10
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of array", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "array", element: 1 }); // 3
  arena.addItem({ type: "array", element: 2 }); // 4
  arena.addItem({ type: "anyOf", elements: [3, 4] }); // 5

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena],
    [
      { type: "number" }, // 1
      { type: "string" }, // 2
      { type: "array", element: 1 }, // 3
      { type: "array", element: 2 }, // 4
      { type: "array", element: 6 }, // 5
      { type: "oneOf", elements: [1, 2] }, // 6
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of object", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ type: "string" }); // 4
  arena.addItem({
    type: "object",
    properties: {
      a: { required: false, element: 1 },
      b: { required: false, element: 2 },
    },
  }); // 5
  arena.addItem({
    type: "object",
    properties: {
      b: { required: true, element: 3 },
      c: { required: false, element: 4 },
    },
  }); // 6
  arena.addItem({ type: "anyOf", elements: [5, 6] }); // 7

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena],
    [
      { type: "number" }, // 1
      { type: "string" }, // 2
      { type: "string" }, // 3
      { type: "string" }, // 4
      {
        type: "object",
        properties: {
          a: { required: false, element: 1 },
          b: { required: false, element: 2 },
        },
      }, // 5
      {
        type: "object",
        properties: {
          b: { required: true, element: 3 },
          c: { required: false, element: 4 },
        },
      }, // 6
      {
        type: "object",
        properties: {
          a: { required: false, element: 1 },
          b: { required: true, element: 8 },
          c: { required: false, element: 4 },
        },
      }, // 7
      { type: "alias", target: 9 }, // 8
      { type: "string" }, // 9
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of map", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ type: "number" }); // 4
  arena.addItem({ type: "map", name: 1, element: 2 }); // 5
  arena.addItem({ type: "map", name: 3, element: 4 }); // 6
  arena.addItem({ type: "anyOf", elements: [5, 6] }); // 7

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena],
    [
      { type: "string" }, // 1
      { type: "string" }, // 2
      { type: "string" }, // 3
      { type: "number" }, // 4
      { type: "map", name: 1, element: 2 }, // 5
      { type: "map", name: 3, element: 4 }, // 6
      { type: "map", name: 8, element: 9 }, // 7
      { type: "alias", target: 10 }, // 8
      { type: "oneOf", elements: [2, 4] }, // 9
      { type: "string" }, // 10
    ],
  );
  assert(!hasDoubleReference([...arena]));
});
