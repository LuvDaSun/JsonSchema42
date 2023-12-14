import assert from "node:assert/strict";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { deleteUndefined } from "../utils/index.js";
import { flatten } from "./flatten.js";

test("flatten", () => {
  const arena = new TypeArena();
  const i1 = arena.addItem({ type: "string" });
  const i2 = arena.addItem({ type: "string" });
  const i3 = arena.addItem({ type: "string" });
  const i4 = arena.addItem({ oneOf: [i1, i2] });
  const i5 = arena.addItem({ alias: i4 });
  const i6 = arena.addItem({ oneOf: [i5, i3] });

  while (arena.applyTransform(flatten) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => deleteUndefined(v)),

    [
      { type: "string" },
      { type: "string" },
      { type: "string" },
      { oneOf: [i1, i2] },
      { alias: i4 },
      { oneOf: [i1, i2, i3] },
    ],
  );
});
