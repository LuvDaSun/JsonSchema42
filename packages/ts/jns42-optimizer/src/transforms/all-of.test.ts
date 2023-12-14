import assert from "node:assert/strict";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { deleteUndefined, hasDoubleReference } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.flatten, transforms.alias, transforms.unknown, transforms.allOf];

test("all-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ type: "unknown" });
  const n = arena.addItem({ type: "never" });
  const a = arena.addItem({ type: "any" });
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "allOf", allOf: [num, u] });
  arena.addItem({ type: "allOf", allOf: [num, n] });
  arena.addItem({ type: "allOf", allOf: [num, a] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "unknown" },
      { type: "never" },
      { type: "any" },
      { type: "number" },
      { alias: num },
      { type: "never" },
      { alias: num },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of alias", () => {
  const arena = new TypeArena();
  const str1 = arena.addItem({ type: "string" });
  const str2 = arena.addItem({ type: "string" });
  const allOf1 = arena.addItem({ type: "allOf", allOf: [str2] });
  arena.addItem({ type: "allOf", allOf: [str1, allOf1] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [{ type: "string" }, { type: "string" }, { alias: str2 }, { type: "string" }],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "allOf", allOf: [num, num, num] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [{ type: "number" }, { alias: num }],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of primitive", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  const str1 = arena.addItem({ type: "string" });
  const str2 = arena.addItem({ type: "string" });
  arena.addItem({ type: "allOf", allOf: [num, str1] });
  arena.addItem({ type: "allOf", allOf: [str1, str2] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "number" },
      { type: "string" },
      { type: "string" },
      { type: "never" },
      { type: "string" },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of tuple", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ type: "tuple", elements: [0, 1] }); // 4
  arena.addItem({ type: "tuple", elements: [2, 3] }); // 5
  arena.addItem({ type: "allOf", allOf: [4, 5] }); // 6

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
      { type: "tuple", elements: [7, 8] }, // 6
      { type: "never" }, // 7
      { type: "string" }, // 8
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of array", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "array", element: 0 }); // 2
  arena.addItem({ type: "array", element: 1 }); // 3
  arena.addItem({ type: "allOf", allOf: [2, 3] }); // 4

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "number" }, // 0
      { type: "string" }, // 1
      { type: "array", element: 0 }, // 2
      { type: "array", element: 1 }, // 3
      { type: "array", element: 5 }, // 4
      { type: "never" }, // 5
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of object", () => {
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
  arena.addItem({ type: "allOf", allOf: [4, 5] }); // 6

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
      {
        type: "object",
        properties: {
          a: { required: false, element: 0 },
          b: { required: true, element: 7 },
          c: { required: false, element: 3 },
        },
      }, // 6
      { type: "string" }, // 7
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of map", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "string" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "number" }); // 3
  arena.addItem({ type: "map", name: 0, element: 1 }); // 4
  arena.addItem({ type: "map", name: 2, element: 3 }); // 5
  arena.addItem({ type: "allOf", allOf: [4, 5] }); // 6

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
      { type: "map", name: 7, element: 8 }, // 6
      { type: "string" }, // 7
      { type: "never" }, // 8
    ],
  );
  assert(!hasDoubleReference([...arena]));
});
