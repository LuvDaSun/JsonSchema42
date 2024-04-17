import assert from "assert";
import test from "node:test";
import { SchemaArena } from "../models/arena.js";
import { normalizeObject } from "../utils/index.js";
import { resolveAllOf } from "./resolve-all-of.js";

test("resolve-all-of utility", () => {
  const arena = new SchemaArena([
    { types: ["never"] }, // 0
    { types: ["any"] }, // 1
    { types: ["number"] }, // 2
    { allOf: [2, 0] }, // 3
    { allOf: [2, 1] }, // 4
  ]);

  while (arena.applyTransform(resolveAllOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["never"] }, // 0
      { types: ["any"] }, // 1
      { types: ["number"] }, // 2
      { types: ["never"] }, // 3
      { types: ["number"] }, // 4
    ],
  );
});

test("resolve-all-of primitive", () => {
  const arena = new SchemaArena([
    { types: ["number"] }, // 0
    { types: ["string"] }, // 1
    { types: ["string"] }, // 2
    { allOf: [0, 1] }, // 3
    { allOf: [1, 2] }, // 4
  ]);

  while (arena.applyTransform(resolveAllOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["number"] }, // 0
      { types: ["string"] }, // 1
      { types: ["string"] }, // 2
      { types: ["never"] }, // 3
      { types: ["string"] }, // 4
    ],
  );
});

test("resolve-all-of tuple", () => {
  const arena = new SchemaArena([
    { types: ["number"] }, // 0
    { types: ["string"] }, // 1
    { types: ["string"] }, // 2
    { types: ["string"] }, // 3
    { types: ["array"], tupleItems: [0, 1] }, // 4
    { types: ["array"], tupleItems: [2, 3] }, // 5
    { allOf: [4, 5] }, // 6
  ]);

  while (arena.applyTransform(resolveAllOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["number"] }, // 0
      { types: ["string"] }, // 1
      { types: ["string"] }, // 2
      { types: ["string"] }, // 3
      { types: ["array"], tupleItems: [0, 1] }, // 4
      { types: ["array"], tupleItems: [2, 3] }, // 5
      { types: ["array"], tupleItems: [7, 8] }, // 6
      { types: ["never"] }, // 7
      { types: ["string"] }, // 8
    ],
  );
});

test("resolve-all-of array", () => {
  const arena = new SchemaArena([
    { types: ["number"] }, // 0
    { types: ["string"] }, // 1
    { types: ["array"], arrayItems: 0 }, // 2
    { types: ["array"], arrayItems: 1 }, // 3
    { allOf: [2, 3] }, // 4
  ]);

  while (arena.applyTransform(resolveAllOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["number"] }, // 0
      { types: ["string"] }, // 1
      { types: ["array"], arrayItems: 0 }, // 2
      { types: ["array"], arrayItems: 1 }, // 3
      { types: ["array"], arrayItems: 5 }, // 4
      { types: ["never"] }, // 5
    ],
  );
});

test("resolve-all-of object", () => {
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
    { allOf: [4, 5] }, // 6
  ]);

  while (arena.applyTransform(resolveAllOf) > 0);

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
      {
        types: ["object"],
        required: ["b"],
        objectProperties: {
          a: 0,
          b: 7,
          c: 3,
        },
      }, // 6
      { types: ["string"] }, // 7
    ],
  );
});

test("resolve-all-of map", () => {
  const arena = new SchemaArena([
    { types: ["string"] }, // 0
    { types: ["string"] }, // 1
    { types: ["string"] }, // 2
    { types: ["number"] }, // 3
    { types: ["object"], propertyNames: 0, mapProperties: 1 }, // 4
    { types: ["object"], propertyNames: 2, mapProperties: 3 }, // 5
    { allOf: [4, 5] }, // 6
  ]);

  while (arena.applyTransform(resolveAllOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [
      { types: ["string"] }, // 0
      { types: ["string"] }, // 1
      { types: ["string"] }, // 2
      { types: ["number"] }, // 3
      { types: ["object"], propertyNames: 0, mapProperties: 1 }, // 4
      { types: ["object"], propertyNames: 2, mapProperties: 3 }, // 5
      { types: ["object"], propertyNames: 7, mapProperties: 8 }, // 6
      { types: ["string"] }, // 7
      { types: ["never"] }, // 8
    ],
  );
});
