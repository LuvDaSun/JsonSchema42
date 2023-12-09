import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { hasDoubleReference } from "../utils/index.js";
import * as transforms from "./index.js";

const useTransforms = [transforms.flatten, transforms.alias, transforms.unknown, transforms.oneOf];

test("one-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ type: "unknown" });
  const n = arena.addItem({ type: "never" });
  const a = arena.addItem({ type: "any" });
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "oneOf", elements: [num, u] });
  arena.addItem({ type: "oneOf", elements: [num, n] });
  arena.addItem({ type: "oneOf", elements: [num, a] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { type: "unknown" },
      { type: "never" },
      { type: "any" },
      { type: "number" },
      { type: "alias", target: 4 },
      { type: "alias", target: 4 },
      { type: "any" },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("one-of alias", () => {
  const arena = new TypeArena();
  const str1 = arena.addItem({ type: "string" });
  const str2 = arena.addItem({ type: "string" });
  const oneOf1 = arena.addItem({ type: "oneOf", elements: [str2] });
  arena.addItem({ type: "oneOf", elements: [str1, oneOf1] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { type: "string" },
      { type: "string" },
      { type: "alias", target: str2 },
      { type: "oneOf", elements: [str1, oneOf1] },
    ],
  );
  assert(!hasDoubleReference([...arena]));
});

test("one-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "oneOf", elements: [num, num, num] });

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [{ type: "number" }, { type: "alias", target: num }],
  );
  assert(!hasDoubleReference([...arena]));
});
