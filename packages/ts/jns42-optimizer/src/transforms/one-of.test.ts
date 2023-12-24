import assert from "node:assert/strict";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { deleteUndefined } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.flatten, transforms.alias, transforms.unknown, transforms.oneOf];

test("one-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ type: "unknown" });
  const n = arena.addItem({ type: "never" });
  const a = arena.addItem({ type: "any" });
  const num = arena.addItem({ type: "number" });
  arena.addItem({ oneOf: [num, u] });
  arena.addItem({ oneOf: [num, n] });
  arena.addItem({ oneOf: [num, a] });

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

test("one-of alias", () => {
  const arena = new TypeArena();
  const str1 = arena.addItem({ type: "string" });
  const str2 = arena.addItem({ type: "string" });
  const oneOf1 = arena.addItem({ oneOf: [str2] });
  arena.addItem({ oneOf: [str1, oneOf1] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [{ type: "string" }, { type: "string" }, { alias: str2 }, { oneOf: [str1, oneOf1] }],
  );
});

test("one-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  arena.addItem({ oneOf: [num, num, num] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [{ type: "number" }, { alias: num }],
  );
});
