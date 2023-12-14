import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { hasDoubleReference } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.flatten, transforms.alias, transforms.unknown, transforms.oneOf];

test("one-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ id: null, type: "unknown" });
  const n = arena.addItem({ id: null, type: "never" });
  const a = arena.addItem({ id: null, type: "any" });
  const num = arena.addItem({ id: null, type: "number" });
  arena.addItem({ id: null, type: "oneOf", oneOf: [num, u] });
  arena.addItem({ id: null, type: "oneOf", oneOf: [num, n] });
  arena.addItem({ id: null, type: "oneOf", oneOf: [num, a] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "unknown" },
      { id: null, type: "never" },
      { id: null, type: "any" },
      { id: null, type: "number" },
      { id: null, type: "alias", target: num },
      { id: null, type: "alias", target: num },
      { id: null, type: "any" },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("one-of alias", () => {
  const arena = new TypeArena();
  const str1 = arena.addItem({ id: null, type: "string" });
  const str2 = arena.addItem({ id: null, type: "string" });
  const oneOf1 = arena.addItem({ id: null, type: "oneOf", oneOf: [str2] });
  arena.addItem({ id: null, type: "oneOf", oneOf: [str1, oneOf1] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "string" },
      { id: null, type: "string" },
      { id: null, type: "alias", target: str2 },
      { id: null, type: "oneOf", elements: [str1, oneOf1] },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("one-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ id: null, type: "number" });
  arena.addItem({ id: null, type: "oneOf", oneOf: [num, num, num] });

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
