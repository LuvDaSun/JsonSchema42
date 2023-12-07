import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { oneOf } from "./one-of.js";

test("one-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ type: "unknown" });
  const n = arena.addItem({ type: "never" });
  const a = arena.addItem({ type: "any" });
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "oneOf", elements: [num, u] });
  arena.addItem({ type: "oneOf", elements: [num, n] });
  arena.addItem({ type: "oneOf", elements: [num, a] });

  while (arena.applyTransform(oneOf) > 0);

  assert.deepEqual(
    [...arena],
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
});

test("one-of alias", () => {
  const arena = new TypeArena();
  const str1 = arena.addItem({ type: "string" });
  const str2 = arena.addItem({ type: "string" });
  const oneOf1 = arena.addItem({ type: "oneOf", elements: [str2] });
  arena.addItem({ type: "oneOf", elements: [str1, oneOf1] });

  while (arena.applyTransform(oneOf) > 0);

  assert.deepEqual(
    [...arena],
    [
      { type: "string" },
      { type: "string" },
      { type: "alias", target: str2 },
      { type: "oneOf", elements: [str1, oneOf1] },
    ],
  );
});

test("one-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "oneOf", elements: [num, num, num] });

  while (arena.applyTransform(oneOf) > 0);

  assert.deepEqual([...arena], [{ type: "number" }, { type: "alias", target: num }]);
});
