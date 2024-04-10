import assert from "node:assert";
import test from "node:test";
import { normalizeObject } from "../utils/index.js";
import { SchemaArena } from "./schema-arena.js";

test("schema-arena", () => {
  using schemaArena = SchemaArena.new();

  for (let count = 0; count < 1000; count++) {
    const key = schemaArena.addItem({});
    assert.equal(key, count);
  }

  for (let count = 0; count < 1000; count++) {
    const itemPrevious = schemaArena.replaceItem(count, { id: `#/${count}` });
    assert.deepEqual(normalizeObject(itemPrevious), {});
  }

  for (let count = 0; count < 1000; count++) {
    const item = schemaArena.getItem(count);
    assert.deepEqual(normalizeObject(item), { id: `#/${count}` });
  }

  assert.equal(1000, schemaArena.count());
});
