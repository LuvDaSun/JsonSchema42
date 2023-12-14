import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { deleteUndefined, hasDoubleReference } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.flatten, transforms.alias, transforms.unknown, transforms.anyOf];

test("any-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ type: "unknown" });
  const n = arena.addItem({ type: "never" });
  const a = arena.addItem({ type: "any" });
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "anyOf", anyOf: [num, u] });
  arena.addItem({ type: "anyOf", anyOf: [num, n] });
  arena.addItem({ type: "anyOf", anyOf: [num, a] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "unknown" },
      { type: "never" },
      { type: "any" },
      { type: "number" },
      { alias: num },
      { alias: num },
      { type: "any" },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "anyOf", anyOf: [num, num, num] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [{ type: "number" }, { alias: num }],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of primitive", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ type: "anyOf", anyOf: [0, 1] }); // 4
  arena.addItem({ type: "anyOf", anyOf: [2, 3] }); // 5

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "number" }, // 0
      { type: "string" }, // 1
      { type: "string" }, // 2
      { type: "string" }, // 3
      { type: "oneOf", oneOf: [0, 1] }, // 4
      { alias: 6 }, // 5
      { type: "string" }, // 6
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of tuple", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ type: "tuple", elements: [0, 1] }); // 4
  arena.addItem({ type: "tuple", elements: [2, 3] }); // 5
  arena.addItem({ type: "anyOf", anyOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "number" }, // 0
      { type: "string" }, // 1
      { type: "string" }, // 2
      { type: "string" }, // 3
      { type: "tuple", elements: [0, 1] }, // 4
      { type: "tuple", elements: [2, 3] }, // 5
      { alias: 9 }, // 6
      { type: "oneOf", oneOf: [0, 2] }, // 7
      { alias: 10 }, // 8
      { type: "tuple", elements: [7, 8] }, // 9
      { type: "string" }, // 10
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of array", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "array", element: 0 }); // 2
  arena.addItem({ type: "array", element: 1 }); // 3
  arena.addItem({ type: "anyOf", anyOf: [2, 3] }); // 4

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "number" }, // 0
      { type: "string" }, // 1
      { type: "array", element: 0 }, // 2
      { type: "array", element: 1 }, // 3
      { alias: 6 }, // 4
      { type: "oneOf", oneOf: [0, 1] }, // 5
      { type: "array", element: 5 }, // 6
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of object", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({
    type: "object",
    properties: {
      a: { required: false, element: 0 },
      b: { required: false, element: 1 },
    },
  }); // 4
  arena.addItem({
    type: "object",
    properties: {
      b: { required: true, element: 2 },
      c: { required: false, element: 3 },
    },
  }); // 5
  arena.addItem({ type: "anyOf", anyOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "number" }, // 0
      { type: "string" }, // 1
      { type: "string" }, // 2
      { type: "string" }, // 3
      {
        type: "object",
        properties: {
          a: { required: false, element: 0 },
          b: { required: false, element: 1 },
        },
      }, // 4
      {
        type: "object",
        properties: {
          b: { required: true, element: 2 },
          c: { required: false, element: 3 },
        },
      }, // 5
      { alias: 8 }, // 6
      { alias: 9 }, // 7
      {
        type: "object",
        properties: {
          a: { required: false, element: 0 },
          b: { required: true, element: 7 },
          c: { required: false, element: 3 },
        },
      }, // 8
      { type: "string" }, // 9
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("any-of map", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "string" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "number" }); // 3
  arena.addItem({ type: "map", name: 0, element: 1 }); // 4
  arena.addItem({ type: "map", name: 2, element: 3 }); // 5
  arena.addItem({ type: "anyOf", anyOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "string" }, // 0
      { type: "string" }, // 1
      { type: "string" }, // 2
      { type: "number" }, // 3
      { type: "map", name: 0, element: 1 }, // 4
      { type: "map", name: 2, element: 3 }, // 5
      { alias: 9 }, // 6
      { alias: 10 }, // 7
      { type: "oneOf", oneOf: [1, 3] }, // 8
      { type: "map", name: 7, element: 8 }, // 9
      { type: "string" }, // 10
    ],
  );
  assert(!hasDoubleReference([...arena]));
});
