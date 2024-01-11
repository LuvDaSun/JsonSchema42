import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../schema/arena.js";
import { normalizeObject } from "../utils/index.js";
import { all } from "./all.js";

test("all", () => {
  const arena = new SchemaArena();

  while (arena.applyTransform(all) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

    [],
  );
});
