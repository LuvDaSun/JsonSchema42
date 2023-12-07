import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { alias } from "./alias.js";

test("alias", () => {
  const arena = new TypeArena();
  const i1 = arena.addItem({ type: "string" });
  const i2 = arena.addItem({ type: "anyOf", elements: [i1] });
  const i3 = arena.addItem({ type: "allOf", elements: [i1] });
  const i4 = arena.addItem({ type: "oneOf", elements: [i1] });

  while (arena.applyTransform(alias) > 0);

  assert.deepEqual(
    [...arena],
    [
      { type: "string" },
      { type: "alias", target: i1 },
      { type: "alias", target: i1 },
      { type: "alias", target: i1 },
    ],
  );
});
