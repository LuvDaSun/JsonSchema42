import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../schema/arena.js";
import { normalizeObject } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.mergeAllOf, transforms.alias];

test("resolve-all-of utility", () => {
  const arena = new SchemaArena();
  const n = arena.addItem({ types: ["never"] });
  const a = arena.addItem({ types: ["any"] });
  const num = arena.addItem({ types: ["number"] });
  arena.addItem({ allOf: [num, n] });
  arena.addItem({ allOf: [num, a] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

    [
      { types: ["never"] },
      { types: ["any"] },
      { types: ["number"] },
      { types: ["never"] },
      { types: ["number"] },
    ],
  );
});

test("resolve-all-of alias", () => {
  const arena = new SchemaArena();
  const str1 = arena.addItem({ types: ["string"] });
  const str2 = arena.addItem({ types: ["string"] });
  const allOf1 = arena.addItem({ allOf: [str2] });
  arena.addItem({ allOf: [str1, allOf1] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

    [{ types: ["string"] }, { types: ["string"] }, { alias: str2 }, { types: ["string"] }],
  );
});

test("resolve-all-of primitive", () => {
  const arena = new SchemaArena();
  const num = arena.addItem({ types: ["number"] });
  const str1 = arena.addItem({ types: ["string"] });
  const str2 = arena.addItem({ types: ["string"] });
  arena.addItem({ allOf: [num, str1] });
  arena.addItem({ allOf: [str1, str2] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

    [
      { types: ["number"] },
      { types: ["string"] },
      { types: ["string"] },
      { types: ["never"] },
      { types: ["string"] },
    ],
  );
});

test("resolve-all-of tuple", () => {
  const arena = new SchemaArena();
  arena.addItem({ types: ["number"] }); // 0
  arena.addItem({ types: ["string"] }); // 1
  arena.addItem({ types: ["string"] }); // 2
  arena.addItem({ types: ["string"] }); // 3
  arena.addItem({ types: ["array"], tupleItems: [0, 1] }); // 4
  arena.addItem({ types: ["array"], tupleItems: [2, 3] }); // 5
  arena.addItem({ allOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

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
  const arena = new SchemaArena();
  arena.addItem({ types: ["number"] }); // 0
  arena.addItem({ types: ["string"] }); // 1
  arena.addItem({ types: ["array"], arrayItems: 0 }); // 2
  arena.addItem({ types: ["array"], arrayItems: 1 }); // 3
  arena.addItem({ allOf: [2, 3] }); // 4

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

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
  const arena = new SchemaArena();
  arena.addItem({ types: ["number"] }); // 0
  arena.addItem({ types: ["string"] }); // 1
  arena.addItem({ types: ["string"] }); // 2
  arena.addItem({ types: ["string"] }); // 3
  arena.addItem({
    types: ["map"],
    objectProperties: {
      a: 0,
      b: 1,
    },
  }); // 4
  arena.addItem({
    types: ["map"],
    required: ["b"],
    objectProperties: {
      b: 2,
      c: 3,
    },
  }); // 5
  arena.addItem({ allOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

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
      {
        types: ["map"],
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
  const arena = new SchemaArena();
  arena.addItem({ types: ["string"] }); // 0
  arena.addItem({ types: ["string"] }); // 1
  arena.addItem({ types: ["string"] }); // 2
  arena.addItem({ types: ["number"] }); // 3
  arena.addItem({ types: ["map"], propertyNames: 0, mapProperties: 1 }); // 4
  arena.addItem({ types: ["map"], propertyNames: 2, mapProperties: 3 }); // 5
  arena.addItem({ allOf: [4, 5] }); // 6

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

    [
      { types: ["string"] }, // 0
      { types: ["string"] }, // 1
      { types: ["string"] }, // 2
      { types: ["number"] }, // 3
      { types: ["map"], propertyNames: 0, mapProperties: 1 }, // 4
      { types: ["map"], propertyNames: 2, mapProperties: 3 }, // 5
      { types: ["map"], propertyNames: 7, mapProperties: 8 }, // 6
      { types: ["string"] }, // 7
      { types: ["never"] }, // 8
    ],
  );
});
