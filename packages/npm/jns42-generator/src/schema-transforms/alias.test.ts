import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../models/arena.js";
import { normalizeObject } from "../utils/index.js";
import { alias } from "./alias.js";

test("alias", () => {
  const arena = new SchemaArena();
  arena.addItem({ anyOf: [100] });
  arena.addItem({ allOf: [100] });
  arena.addItem({ oneOf: [100] });

  while (arena.applyTransform(alias) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [{ alias: 100 }, { alias: 100 }, { alias: 100 }],
  );
});
