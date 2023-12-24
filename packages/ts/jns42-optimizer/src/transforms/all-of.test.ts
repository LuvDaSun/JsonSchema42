import assert from "node:assert/strict";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { deleteUndefined } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.flatten, transforms.alias, transforms.unknown, transforms.allOf];

test("all-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ type: "unknown" });
  const n = arena.addItem({ type: "never" });
  const a = arena.addItem({ type: "any" });
  const num = arena.addItem({ type: "number" });
  arena.addItem({ allOf: [num, u] });
  arena.addItem({ allOf: [num, n] });
  arena.addItem({ allOf: [num, a] });

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
});

test("all-of alias", () => {
  const arena = new TypeArena();
  const str1 = arena.addItem({ type: "string" });
  const str2 = arena.addItem({ type: "string" });
  const allOf1 = arena.addItem({ allOf: [str2] });
  arena.addItem({ allOf: [str1, allOf1] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [{ type: "string" }, { type: "string" }, { alias: str2 }, { type: "string" }],
  );
});

test("all-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  arena.addItem({ allOf: [num, num, num] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [{ type: "number" }, { alias: num }],
  );
});

test("all-of primitive", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  const str1 = arena.addItem({ type: "string" });
  const str2 = arena.addItem({ type: "string" });
  arena.addItem({ allOf: [num, str1] });
  arena.addItem({ allOf: [str1, str2] });

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
});

test("all-of tuple", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ type: "tuple", tupleElements: [0, 1] }); // 4
  arena.addItem({ type: "tuple", tupleElements: [2, 3] }); // 5
  arena.addItem({ allOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "number" }, // 0
      { type: "string" }, // 1
      { type: "string" }, // 2
      { type: "string" }, // 3
      { type: "tuple", tupleElements: [0, 1] }, // 4
      { type: "tuple", tupleElements: [2, 3] }, // 5
      { type: "tuple", tupleElements: [7, 8] }, // 6
      { type: "never" }, // 7
      { type: "string" }, // 8
    ],
  );
});

test("all-of array", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "array", arrayElement: 0 }); // 2
  arena.addItem({ type: "array", arrayElement: 1 }); // 3
  arena.addItem({ allOf: [2, 3] }); // 4

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "number" }, // 0
      { type: "string" }, // 1
      { type: "array", arrayElement: 0 }, // 2
      { type: "array", arrayElement: 1 }, // 3
      { type: "array", arrayElement: 5 }, // 4
      { type: "never" }, // 5
    ],
  );
});

test("all-of object", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({
    type: "object",
    objectProperties: {
      a: 0,
      b: 1,
    },
  }); // 4
  arena.addItem({
    type: "object",
    required: ["b"],
    objectProperties: {
      b: 2,
      c: 3,
    },
  }); // 5
  arena.addItem({ allOf: [4, 5] }); // 6

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
        objectProperties: {
          a: 0,
          b: 1,
        },
      }, // 4
      {
        type: "object",
        required: ["b"],
        objectProperties: {
          b: 2,
          c: 3,
        },
      }, // 5
      {
        type: "object",
        required: ["b"],
        objectProperties: {
          a: 0,
          b: 7,
          c: 3,
        },
      }, // 6
      { type: "string" }, // 7
    ],
  );
});

test("all-of map", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "string" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "number" }); // 3
  arena.addItem({ type: "map", propertyName: 0, mapElement: 1 }); // 4
  arena.addItem({ type: "map", propertyName: 2, mapElement: 3 }); // 5
  arena.addItem({ allOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "string" }, // 0
      { type: "string" }, // 1
      { type: "string" }, // 2
      { type: "number" }, // 3
      { type: "map", propertyName: 0, mapElement: 1 }, // 4
      { type: "map", propertyName: 2, mapElement: 3 }, // 5
      { type: "map", propertyName: 7, mapElement: 8 }, // 6
      { type: "string" }, // 7
      { type: "never" }, // 8
    ],
  );
});
