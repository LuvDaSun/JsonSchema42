import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import * as types from "../types.js";
import { alias } from "./alias.js";
import { allOf } from "./all-of.js";
import { anyOf } from "./any-of.js";
import { flatten } from "./flatten.js";
import { oneOf } from "./one-of.js";

test("any-of utility", () => {
  const arena = new TypeArena();
  const u = arena.addItem({ type: "unknown" });
  const n = arena.addItem({ type: "never" });
  const a = arena.addItem({ type: "any" });
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "anyOf", elements: [num, u] });
  arena.addItem({ type: "anyOf", elements: [num, n] });
  arena.addItem({ type: "anyOf", elements: [num, a] });

  while (arena.applyTransform(flatten, alias, anyOf, allOf, oneOf) > 0);

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

test("any-of unique", () => {
  const arena = new TypeArena();
  const num = arena.addItem({ type: "number" });
  arena.addItem({ type: "anyOf", elements: [num, num, num] });

  while (arena.applyTransform(flatten, alias, anyOf, allOf, oneOf) > 0);

  assert.deepEqual([...arena], [{ type: "number" }, { type: "alias", target: num }]);
});

test("any-of many", () => {
  const arena = new TypeArena();
  const elements = new Array<number>();
  for (let index = 0; index < 20; index++) {
    const newItem: types.Boolean = { type: "boolean" };
    const newId = arena.addItem(newItem);
    elements.push(newId);
  }

  arena.addItem({
    type: "anyOf",
    elements,
  });

  while (arena.applyTransform(flatten, alias, anyOf, allOf, oneOf) > 0);

  debugger;
});
