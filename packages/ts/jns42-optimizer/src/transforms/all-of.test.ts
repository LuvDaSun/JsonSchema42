import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { hasDoubleReference } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.flatten, transforms.alias, transforms.unknown, transforms.allOf];

test("all-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ id: null, type: "unknown" });
  const n = arena.addItem({ id: null, type: "never" });
  const a = arena.addItem({ id: null, type: "any" });
  const num = arena.addItem({ id: null, type: "number" });
  arena.addItem({ id: null, type: "allOf", allOf: [num, u] });
  arena.addItem({ id: null, type: "allOf", allOf: [num, n] });
  arena.addItem({ id: null, type: "allOf", allOf: [num, a] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "unknown" },
      { id: null, type: "never" },
      { id: null, type: "any" },
      { id: null, type: "number" },
      { id: null, type: "alias", target: num },
      { id: null, type: "never" },
      { id: null, type: "alias", target: num },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of alias", () => {
  const arena = new TypeArena();
  const str1 = arena.addItem({ id: null, type: "string" });
  const str2 = arena.addItem({ id: null, type: "string" });
  const allOf1 = arena.addItem({ id: null, type: "allOf", allOf: [str2] });
  arena.addItem({ id: null, type: "allOf", allOf: [str1, allOf1] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "string" },
      { id: null, type: "string" },
      { id: null, type: "alias", target: str2 },
      { id: null, type: "string" },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ id: null, type: "number" });
  arena.addItem({ id: null, type: "allOf", allOf: [num, num, num] });

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

test("all-of primitive", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ id: null, type: "number" });
  const str1 = arena.addItem({ id: null, type: "string" });
  const str2 = arena.addItem({ id: null, type: "string" });
  arena.addItem({ id: null, type: "allOf", allOf: [num, str1] });
  arena.addItem({ id: null, type: "allOf", allOf: [str1, str2] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "number" },
      { id: null, type: "string" },
      { id: null, type: "string" },
      { id: null, type: "never" },
      { id: null, type: "string" },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of tuple", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "number" }); // 0
  arena.addItem({ id: null, type: "string" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "string" }); // 3
  arena.addItem({ id: null, type: "tuple", elements: [0, 1] }); // 4
  arena.addItem({ id: null, type: "tuple", elements: [2, 3] }); // 5
  arena.addItem({ id: null, type: "allOf", allOf: [4, 5] }); // 6

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
      { id: null, type: "tuple", elements: [7, 8] }, // 6
      { id: null, type: "never" }, // 7
      { id: null, type: "string" }, // 8
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of array", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "number" }); // 0
  arena.addItem({ id: null, type: "string" }); // 1
  arena.addItem({ id: null, type: "array", element: 0 }); // 2
  arena.addItem({ id: null, type: "array", element: 1 }); // 3
  arena.addItem({ id: null, type: "allOf", allOf: [2, 3] }); // 4

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "number" }, // 0
      { id: null, type: "string" }, // 1
      { id: null, type: "array", element: 0 }, // 2
      { id: null, type: "array", element: 1 }, // 3
      { id: null, type: "array", element: 5 }, // 4
      { id: null, type: "never" }, // 5
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of object", () => {
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
  arena.addItem({ id: null, type: "allOf", allOf: [4, 5] }); // 6

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
      {
        id: null,
        type: "object",
        properties: {
          a: { required: false, element: 0 },
          b: { required: true, element: 7 },
          c: { required: false, element: 3 },
        },
      }, // 6
      { id: null, type: "string" }, // 7
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of map", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "string" }); // 0
  arena.addItem({ id: null, type: "string" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "number" }); // 3
  arena.addItem({ id: null, type: "map", name: 0, element: 1 }); // 4
  arena.addItem({ id: null, type: "map", name: 2, element: 3 }); // 5
  arena.addItem({ id: null, type: "allOf", allOf: [4, 5] }); // 6

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
      { id: null, type: "map", name: 7, element: 8 }, // 6
      { id: null, type: "string" }, // 7
      { id: null, type: "never" }, // 8
    ],
  );
  assert(!hasDoubleReference([...arena]));
});
