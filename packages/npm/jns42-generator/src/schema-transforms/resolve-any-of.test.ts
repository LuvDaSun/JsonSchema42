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
      { oneOf: [2, 0], exact: false },
      { oneOf: [2, 1], exact: false },
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
      { oneOf: [0, 1], exact: false }, // 4
      { oneOf: [6], exact: false }, // 5
      { types: ["string"], exact: false }, // 6
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
      { oneOf: [9], exact: false }, // 6
      { oneOf: [0, 2], exact: false }, // 7
      { oneOf: [10], exact: false }, // 8
      { types: ["array"], tupleItems: [7, 8], exact: false }, // 9
      { types: ["string"], exact: false }, // 10
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
      { oneOf: [6], exact: false }, // 4
      { oneOf: [0, 1], exact: false }, // 5
      { types: ["array"], arrayItems: 5, exact: false }, // 6
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
      types: ["object"],
      objectProperties: {
        a: 0,
        b: 1,
      },
    }, // 4
    {
      types: ["object"],
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
        types: ["object"],
        objectProperties: {
          a: 0,
          b: 1,
        },
      }, // 4
      {
        types: ["object"],
        required: ["b"],
        objectProperties: {
          b: 2,
          c: 3,
        },
      }, // 5
      { oneOf: [8], exact: false }, // 6
      { oneOf: [9], exact: false }, // 7
      {
        types: ["object"],
        required: ["b"],
        objectProperties: {
          a: 0,
          b: 7,
          c: 3,
        },
        exact: false,
      }, // 8
      { types: ["string"], exact: false }, // 9
    ],
  );
});

test("resolve-any-of map", () => {
  const arena = new SchemaArena([
    { types: ["string"] }, // 0
    { types: ["string"] }, // 1
    { types: ["string"] }, // 2
    { types: ["number"] }, // 3
    { types: ["object"], propertyNames: 0, mapProperties: 1 }, // 4
    { types: ["object"], propertyNames: 2, mapProperties: 3 }, // 5
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
      { types: ["object"], propertyNames: 0, mapProperties: 1 }, // 4
      { types: ["object"], propertyNames: 2, mapProperties: 3 }, // 5
      { oneOf: [9], exact: false }, // 6
      { oneOf: [10], exact: false }, // 7
      { oneOf: [1, 3], exact: false }, // 8
      { types: ["object"], propertyNames: 7, mapProperties: 8, exact: false }, // 9
      { types: ["string"], exact: false }, // 10
    ],
  );
});
