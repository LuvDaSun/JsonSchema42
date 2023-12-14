import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { hasDoubleReference } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.flatten, transforms.alias, transforms.unknown, transforms.anyOf];

test("any-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ id: null, type: "unknown" });
  const n = arena.addItem({ id: null, type: "never" });
  const a = arena.addItem({ id: null, type: "any" });
  const num = arena.addItem({ id: null, type: "number" });
  arena.addItem({ id: null, type: "anyOf", anyOf: [num, u] });
  arena.addItem({ id: null, type: "anyOf", anyOf: [num, n] });
  arena.addItem({ id: null, type: "anyOf", anyOf: [num, a] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "unknown" },
      { id: null, type: "never" },
      { id: null, type: "any" },
      { id: null, type: "number" },
      { id: null, type: "alias", target: num },
      { id: null, type: "alias", target: num },
      { id: null, type: "any" },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ id: null, type: "number" });
  arena.addItem({ id: null, type: "anyOf", anyOf: [num, num, num] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "number" },
      { id: null, type: "alias", target: num },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of primitive", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "number" }); // 0
  arena.addItem({ id: null, type: "string" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "string" }); // 3
  arena.addItem({ id: null, type: "anyOf", anyOf: [0, 1] }); // 4
  arena.addItem({ id: null, type: "anyOf", anyOf: [2, 3] }); // 5

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "number" }, // 0
      { id: null, type: "string" }, // 1
      { id: null, type: "string" }, // 2
      { id: null, type: "string" }, // 3
      { id: null, type: "oneOf", elements: [0, 1] }, // 4
      { id: null, type: "alias", target: 6 }, // 5
      { id: null, type: "string" }, // 6
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of tuple", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "number" }); // 0
  arena.addItem({ id: null, type: "string" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "string" }); // 3
  arena.addItem({ id: null, type: "tuple", elements: [0, 1] }); // 4
  arena.addItem({ id: null, type: "tuple", elements: [2, 3] }); // 5
  arena.addItem({ id: null, type: "anyOf", anyOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "number" }, // 0
      { id: null, type: "string" }, // 1
      { id: null, type: "string" }, // 2
      { id: null, type: "string" }, // 3
      { id: null, type: "tuple", elements: [0, 1] }, // 4
      { id: null, type: "tuple", elements: [2, 3] }, // 5
      { id: null, type: "alias", target: 9 }, // 6
      { id: null, type: "oneOf", elements: [0, 2] }, // 7
      { id: null, type: "alias", target: 10 }, // 8
      { id: null, type: "tuple", elements: [7, 8] }, // 9
      { id: null, type: "string" }, // 10
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of array", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "number" }); // 0
  arena.addItem({ id: null, type: "string" }); // 1
  arena.addItem({ id: null, type: "array", element: 0 }); // 2
  arena.addItem({ id: null, type: "array", element: 1 }); // 3
  arena.addItem({ id: null, type: "anyOf", anyOf: [2, 3] }); // 4

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "number" }, // 0
      { id: null, type: "string" }, // 1
      { id: null, type: "array", element: 0 }, // 2
      { id: null, type: "array", element: 1 }, // 3
      { id: null, type: "alias", target: 6 }, // 4
      { id: null, type: "oneOf", elements: [0, 1] }, // 5
      { id: null, type: "array", element: 5 }, // 6
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of object", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "number" }); // 0
  arena.addItem({ id: null, type: "string" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "string" }); // 3
  arena.addItem({
    id: null,
    type: "object",
    properties: {
      a: { required: false, element: 0 },
      b: { required: false, element: 1 },
    },
  }); // 4
  arena.addItem({
    id: null,
    type: "object",
    properties: {
      b: { required: true, element: 2 },
      c: { required: false, element: 3 },
    },
  }); // 5
  arena.addItem({ id: null, type: "anyOf", anyOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "number" }, // 0
      { id: null, type: "string" }, // 1
      { id: null, type: "string" }, // 2
      { id: null, type: "string" }, // 3
      {
        id: null,
        type: "object",
        properties: {
          a: { required: false, element: 0 },
          b: { required: false, element: 1 },
        },
      }, // 4
      {
        id: null,
        type: "object",
        properties: {
          b: { required: true, element: 2 },
          c: { required: false, element: 3 },
        },
      }, // 5
      { id: null, type: "alias", target: 8 }, // 6
      { id: null, type: "alias", target: 9 }, // 7
      {
        id: null,
        type: "object",
        properties: {
          a: { required: false, element: 0 },
          b: { required: true, element: 7 },
          c: { required: false, element: 3 },
        },
      }, // 8
      { id: null, type: "string" }, // 9
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of map", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "string" }); // 0
  arena.addItem({ id: null, type: "string" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "number" }); // 3
  arena.addItem({ id: null, type: "map", name: 0, element: 1 }); // 4
  arena.addItem({ id: null, type: "map", name: 2, element: 3 }); // 5
  arena.addItem({ id: null, type: "anyOf", anyOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "string" }, // 0
      { id: null, type: "string" }, // 1
      { id: null, type: "string" }, // 2
      { id: null, type: "number" }, // 3
      { id: null, type: "map", name: 0, element: 1 }, // 4
      { id: null, type: "map", name: 2, element: 3 }, // 5
      { id: null, type: "alias", target: 9 }, // 6
      { id: null, type: "alias", target: 10 }, // 7
      { id: null, type: "oneOf", elements: [1, 3] }, // 8
      { id: null, type: "map", name: 7, element: 8 }, // 9
      { id: null, type: "string" }, // 10
    ],
  );
  assert(!hasDoubleReference([...arena]));
});
