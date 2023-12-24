import assert from "node:assert/strict";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { deleteUndefined } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.flatten, transforms.alias, transforms.unknown, transforms.anyOf];

test("any-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ type: "unknown" });
  const n = arena.addItem({ type: "never" });
  const a = arena.addItem({ type: "any" });
  const num = arena.addItem({ type: "number" });
  arena.addItem({ anyOf: [num, u] });
  arena.addItem({ anyOf: [num, n] });
  arena.addItem({ anyOf: [num, a] });

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
});

test("any-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  arena.addItem({ anyOf: [num, num, num] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [{ type: "number" }, { alias: num }],
  );
});

test("any-of primitive", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ anyOf: [0, 1] }); // 4
  arena.addItem({ anyOf: [2, 3] }); // 5

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "number" }, // 0
      { type: "string" }, // 1
      { type: "string" }, // 2
      { type: "string" }, // 3
      { oneOf: [0, 1] }, // 4
      { alias: 6 }, // 5
      { type: "string" }, // 6
    ],
  );
});

test("any-of tuple", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "string" }); // 3
  arena.addItem({ type: "tuple", tupleElements: [0, 1] }); // 4
  arena.addItem({ type: "tuple", tupleElements: [2, 3] }); // 5
  arena.addItem({ anyOf: [4, 5] }); // 6

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
      { alias: 9 }, // 6
      { oneOf: [0, 2] }, // 7
      { alias: 10 }, // 8
      { type: "tuple", tupleElements: [7, 8] }, // 9
      { type: "string" }, // 10
    ],
  );
});

test("any-of array", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "number" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "array", arrayElement: 0 }); // 2
  arena.addItem({ type: "array", arrayElement: 1 }); // 3
  arena.addItem({ anyOf: [2, 3] }); // 4

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "number" }, // 0
      { type: "string" }, // 1
      { type: "array", arrayElement: 0 }, // 2
      { type: "array", arrayElement: 1 }, // 3
      { alias: 6 }, // 4
      { oneOf: [0, 1] }, // 5
      { type: "array", arrayElement: 5 }, // 6
    ],
  );
});

test("any-of object", () => {
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
  arena.addItem({ anyOf: [4, 5] }); // 6

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
      { alias: 8 }, // 6
      { alias: 9 }, // 7
      {
        type: "object",
        required: ["b"],
        objectProperties: {
          a: 0,
          b: 7,
          c: 3,
        },
      }, // 8
      { type: "string" }, // 9
    ],
  );
});

test("any-of map", () => {
  const arena = new TypeArena();
  arena.addItem({ type: "string" }); // 0
  arena.addItem({ type: "string" }); // 1
  arena.addItem({ type: "string" }); // 2
  arena.addItem({ type: "number" }); // 3
  arena.addItem({ type: "map", propertyName: 0, mapElement: 1 }); // 4
  arena.addItem({ type: "map", propertyName: 2, mapElement: 3 }); // 5
  arena.addItem({ anyOf: [4, 5] }); // 6

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
      { alias: 9 }, // 6
      { alias: 10 }, // 7
      { oneOf: [1, 3] }, // 8
      { type: "map", propertyName: 7, mapElement: 8 }, // 9
      { type: "string" }, // 10
    ],
  );
});
