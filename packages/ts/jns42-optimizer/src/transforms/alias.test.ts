import assert from "node:assert";
import test from "node:test";
import { TypeArena } from "../type-arena.js";
import { alias } from "./alias.js";

test("alias", () => {
  const arena = new TypeArena();
  const i1 = arena.addItem({ id: null, type: "string" });
  const i2 = arena.addItem({ id: null, type: "anyOf", anyOf: [i1] });
  const i3 = arena.addItem({ id: null, type: "allOf", allOf: [i1] });
  const i4 = arena.addItem({ id: null, type: "oneOf", oneOf: [i1] });

  while (arena.applyTransform(alias) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => v),
    [
      { id: null, type: "string" },
      { id: null, type: "alias", target: i1 },
      { id: null, type: "alias", target: i1 },
      { id: null, type: "alias", target: i1 },
    ],
  );
});
