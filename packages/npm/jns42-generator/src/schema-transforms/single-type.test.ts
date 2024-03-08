import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../models/arena.js";
import { normalizeObject } from "../utils/index.js";
import { singleType } from "./single-type.js";

test("single-type", () => {
  const arena = new SchemaArena();
  arena.addItem({ types: ["string", "number"] });

  while (arena.applyTransform(singleType) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),

    [{ oneOf: [1, 2] }, { parent: 0, types: ["string"] }, { parent: 0, types: ["number"] }],
  );
});
