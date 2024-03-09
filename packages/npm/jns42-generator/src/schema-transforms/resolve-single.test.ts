import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../models/arena.js";
import { normalizeObject } from "../utils/index.js";
import { resolveSingleAllOf } from "./resolve-single.js";

test("alias", () => {
  const arena = new SchemaArena();
  arena.addItem({ allOf: [100] });

  while (arena.applyTransform(resolveSingleAllOf) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [{ reference: 100 }],
  );
});