import assert from "assert";
import test from "node:test";
import { SchemaArena } from "../models/index.js";
import { normalizeObject } from "../utils/index.js";
import { resolveAnyOf } from "./resolve-any-of.js";

test("resolve-any-of utility", () => {
  const arena = new SchemaArena([
    { types: ["never"] },
    { types: ["any"] },
    { types: ["number"] },
    { anyOf: [2, 0] },
    { anyOf: [2, 1] },
  ]);

  while (arena.applyTransform(resolveAnyOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["never"] },
      { types: ["any"] },
      { types: ["number"] },
      { oneOf: [2, 0] },
      { oneOf: [2, 1] },
    ],
  );
});

test("resolve-any-of primitive", () => {
  const arena = new SchemaArena([
    { types: ["number"] }, // 0
    { types: ["string"] }, // 1
    { types: ["string"] }, // 2
    { types: ["string"] }, // 3
    { anyOf: [0, 1] }, // 4
    { anyOf: [2, 3] }, // 5
  ]);

  while (arena.applyTransform(resolveAnyOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["number"] }, // 0
      { types: ["string"] }, // 1
      { types: ["string"] }, // 2
      { types: ["string"] }, // 3
      { oneOf: [0, 1] }, // 4
      { oneOf: [6] }, // 5
      { types: ["string"] }, // 6
    ],
  );
});

test("resolve-any-of tuple", () => {
  const arena = new SchemaArena([
    { types: ["number"] }, // 0
    { types: ["string"] }, // 1
    { types: ["string"] }, // 2
    { types: ["string"] }, // 3
    { types: ["array"], tupleItems: [0, 1] }, // 4
    { types: ["array"], tupleItems: [2, 3] }, // 5
    { anyOf: [4, 5] }, // 6
  ]);

  while (arena.applyTransform(resolveAnyOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["number"] }, // 0
      { types: ["string"] }, // 1
      { types: ["string"] }, // 2
      { types: ["string"] }, // 3
      { types: ["array"], tupleItems: [0, 1] }, // 4
      { types: ["array"], tupleItems: [2, 3] }, // 5
      { oneOf: [9] }, // 6
      { oneOf: [0, 2] }, // 7
      { oneOf: [10] }, // 8
      { types: ["array"], tupleItems: [7, 8] }, // 9
      { types: ["string"] }, // 10
    ],
  );
});

test("resolve-any-of array", () => {
  const arena = new SchemaArena([
    { types: ["number"] }, // 0
    { types: ["string"] }, // 1
    { types: ["array"], arrayItems: 0 }, // 2
    { types: ["array"], arrayItems: 1 }, // 3
    { anyOf: [2, 3] }, // 4
  ]);

  while (arena.applyTransform(resolveAnyOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["number"] }, // 0
      { types: ["string"] }, // 1
      { types: ["array"], arrayItems: 0 }, // 2
      { types: ["array"], arrayItems: 1 }, // 3
      { oneOf: [6] }, // 4
      { oneOf: [0, 1] }, // 5
      { types: ["array"], arrayItems: 5 }, // 6
    ],
  );
});

test("resolve-any-of object", () => {
  const arena = new SchemaArena([
    { types: ["number"] }, // 0
    { types: ["string"] }, // 1
    { types: ["string"] }, // 2
    { types: ["string"] }, // 3
    {
      types: ["map"],
      objectProperties: {
        a: 0,
        b: 1,
      },
    }, // 4
    {
      types: ["map"],
      required: ["b"],
      objectProperties: {
        b: 2,
        c: 3,
      },
    }, // 5
    { anyOf: [4, 5] }, // 6
  ]);

  while (arena.applyTransform(resolveAnyOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["number"] }, // 0
      { types: ["string"] }, // 1
      { types: ["string"] }, // 2
      { types: ["string"] }, // 3
      {
        types: ["map"],
        objectProperties: {
          a: 0,
          b: 1,
        },
      }, // 4
      {
        types: ["map"],
        required: ["b"],
        objectProperties: {
          b: 2,
          c: 3,
        },
      }, // 5
      { oneOf: [8] }, // 6
      { oneOf: [9] }, // 7
      {
        types: ["map"],
        required: ["b"],
        objectProperties: {
          a: 0,
          b: 7,
          c: 3,
        },
      }, // 8
      { types: ["string"] }, // 9
    ],
  );
});

test("resolve-any-of map", () => {
  const arena = new SchemaArena([
    { types: ["string"] }, // 0
    { types: ["string"] }, // 1
    { types: ["string"] }, // 2
    { types: ["number"] }, // 3
    { types: ["map"], propertyNames: 0, mapProperties: 1 }, // 4
    { types: ["map"], propertyNames: 2, mapProperties: 3 }, // 5
    { anyOf: [4, 5] }, // 6
  ]);

  while (arena.applyTransform(resolveAnyOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["string"] }, // 0
      { types: ["string"] }, // 1
      { types: ["string"] }, // 2
      { types: ["number"] }, // 3
      { types: ["map"], propertyNames: 0, mapProperties: 1 }, // 4
      { types: ["map"], propertyNames: 2, mapProperties: 3 }, // 5
      { oneOf: [9] }, // 6
      { oneOf: [10] }, // 7
      { oneOf: [1, 3] }, // 8
      { types: ["map"], propertyNames: 7, mapProperties: 8 }, // 9
      { types: ["string"] }, // 10
    ],
  );
});
