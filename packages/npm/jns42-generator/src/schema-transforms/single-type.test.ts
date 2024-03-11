import assert from "assert";
import test from "node:test";
import { SchemaArena } from "../models/arena.js";
import { normalizeObject } from "../utils/index.js";
import { singleType } from "./single-type.js";

test("single-type", () => {
  const arena = new SchemaArena([{ types: ["string", "number"] }]);

  while (arena.applyTransform(singleType) > 0);

  assert.deepEqual(
    [...arena].map(normalizeObject),

    [{ oneOf: [1, 2] }, { types: ["string"] }, { types: ["number"] }],
  );
});
