import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { flatten } from "./flatten.js";

test("flatten", () => {
  const arena = new TypeArena();
  const i1 = arena.addItem({ id: null, type: "string" });
  const i2 = arena.addItem({ id: null, type: "string" });
  const i3 = arena.addItem({ id: null, type: "string" });
  const i4 = arena.addItem({ id: null, type: "oneOf", elements: [i1, i2] });
  const i5 = arena.addItem({ id: null, type: "alias", target: i4 });
  const i6 = arena.addItem({ id: null, type: "oneOf", elements: [i5, i3] });

  while (arena.applyTransform(flatten) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "string" },
      { id: null, type: "string" },
      { id: null, type: "string" },
      { id: null, type: "oneOf", elements: [i1, i2] },
      { id: null, type: "alias", target: i4 },
      { id: null, type: "oneOf", elements: [i1, i2, i3] },
    ],
  );
});
