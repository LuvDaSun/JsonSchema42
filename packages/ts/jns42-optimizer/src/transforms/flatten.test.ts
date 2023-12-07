import assert from "node:assert";
import test from "node:test";
import { Arena } from "../arena.js";
import * as types from "../types.js";
import { flatten } from "./flatten.js";

test("flatten", () => {
  const arena = new Arena<types.Union>();
  const i1 = arena.addItem({ type: "string" });
  const i2 = arena.addItem({ type: "string" });
  const i3 = arena.addItem({ type: "string" });
  const i4 = arena.addItem({ type: "oneOf", elements: [i1, i2] });
  const i5 = arena.addItem({ type: "oneOf", elements: [i4, i3] });

  while (arena.applyTransform(flatten) > 0);

  assert.deepEqual(
    [...arena],
    [
      { type: "string" },
      { type: "string" },
      { type: "string" },
      { type: "oneOf", elements: [i1, i2] },
      { type: "oneOf", elements: [i1, i2, i3] },
    ],
  );
});
