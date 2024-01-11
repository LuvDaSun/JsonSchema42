import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../schema/arena.js";
import { normalizeObject } from "../utils/index.js";
import { all } from "./all.js";

test("all", () => {
  const arena = new SchemaArena();
  arena.addItem({
    types: ["null", "boolean"],
    allOf: [1, 2],
  });
  arena.addItem({
    types: ["null", "boolean"],
  });
  arena.addItem({
    types: ["null", "boolean"],
  });

  while (arena.applyTransform(all) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

    [],
  );
});
