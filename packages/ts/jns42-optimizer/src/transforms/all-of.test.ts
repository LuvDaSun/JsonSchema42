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
  arena.addItem({ id: null, type: "allOf", elements: [num, u] });
  arena.addItem({ id: null, type: "allOf", elements: [num, n] });
  arena.addItem({ id: null, type: "allOf", elements: [num, a] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "unknown" },
      { id: null, type: "unknown" },
      { id: null, type: "never" },
      { id: null, type: "any" },
      { id: null, type: "number" },
      { id: null, type: "alias", target: 4 },
      { id: null, type: "never" },
      { id: null, type: "alias", target: 4 },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of alias", () => {
  const arena = new TypeArena();
  const str1 = arena.addItem({ id: null, type: "string" });
  const str2 = arena.addItem({ id: null, type: "string" });
  const allOf1 = arena.addItem({ id: null, type: "allOf", elements: [str2] });
  arena.addItem({ id: null, type: "allOf", elements: [str1, allOf1] });

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
  arena.addItem({ id: null, type: "allOf", elements: [num, num, num] });

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
  arena.addItem({ id: null, type: "allOf", elements: [num, str1] });
  arena.addItem({ id: null, type: "allOf", elements: [str1, str2] });

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
  arena.addItem({ id: null, type: "unknown" });
  arena.addItem({ id: null, type: "number" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "string" }); // 3
  arena.addItem({ id: null, type: "string" }); // 4
  arena.addItem({ id: null, type: "tuple", elements: [1, 2] }); // 5
  arena.addItem({ id: null, type: "tuple", elements: [3, 4] }); // 6
  arena.addItem({ id: null, type: "allOf", elements: [5, 6] }); // 7

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "unknown" },
      { id: null, type: "number" }, // 1
      { id: null, type: "string" }, // 2
      { id: null, type: "string" }, // 3
      { id: null, type: "string" }, // 4
      { id: null, type: "tuple", elements: [1, 2] }, // 5
      { id: null, type: "tuple", elements: [3, 4] }, // 6
      { id: null, type: "tuple", elements: [8, 9] }, // 7
      { id: null, type: "never" }, // 8
      { id: null, type: "string" }, // 9
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of array", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "unknown" });
  arena.addItem({ id: null, type: "number" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "array", element: 1 }); // 3
  arena.addItem({ id: null, type: "array", element: 2 }); // 4
  arena.addItem({ id: null, type: "allOf", elements: [3, 4] }); // 5

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "unknown" },
      { id: null, type: "number" }, // 1
      { id: null, type: "string" }, // 2
      { id: null, type: "array", element: 1 }, // 3
      { id: null, type: "array", element: 2 }, // 4
      { id: null, type: "array", element: 6 }, // 5
      { id: null, type: "never" }, // 6
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of object", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "unknown" });
  arena.addItem({ id: null, type: "number" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "string" }); // 3
  arena.addItem({ id: null, type: "string" }); // 4
  arena.addItem({
    id: null,
    type: "object",
    properties: {
      a: { required: false, element: 1 },
      b: { required: false, element: 2 },
    },
  }); // 5
  arena.addItem({
    id: null,
    type: "object",
    properties: {
      b: { required: true, element: 3 },
      c: { required: false, element: 4 },
    },
  }); // 6
  arena.addItem({ id: null, type: "allOf", elements: [5, 6] }); // 7

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "unknown" },
      { id: null, type: "number" }, // 1
      { id: null, type: "string" }, // 2
      { id: null, type: "string" }, // 3
      { id: null, type: "string" }, // 4
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
      { id: null, type: "string" }, // 8
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("all-of map", () => {
  const arena = new TypeArena();
  arena.addItem({ id: null, type: "unknown" });
  arena.addItem({ id: null, type: "string" }); // 1
  arena.addItem({ id: null, type: "string" }); // 2
  arena.addItem({ id: null, type: "string" }); // 3
  arena.addItem({ id: null, type: "number" }); // 4
  arena.addItem({ id: null, type: "map", name: 1, element: 2 }); // 5
  arena.addItem({ id: null, type: "map", name: 3, element: 4 }); // 6
  arena.addItem({ id: null, type: "allOf", elements: [5, 6] }); // 7

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "unknown" },
      { id: null, type: "string" }, // 1
      { id: null, type: "string" }, // 2
      { id: null, type: "string" }, // 3
      { id: null, type: "number" }, // 4
      { id: null, type: "map", name: 1, element: 2 }, // 5
      { id: null, type: "map", name: 3, element: 4 }, // 6
      { id: null, type: "map", name: 8, element: 9 }, // 7
      { id: null, type: "string" }, // 8
      { id: null, type: "never" }, // 9
    ],
  );
  assert(!hasDoubleReference([...arena]));
});
