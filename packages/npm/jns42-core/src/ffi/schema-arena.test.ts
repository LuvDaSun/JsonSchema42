import assert from "node:assert";
import test from "node:test";
import { SchemaArenaProxy } from "./schema-arena.js";

test("schema-arena", () => {
  using schemaArena = SchemaArenaProxy.new();

  for (let count = 0; count < 1000; count++) {
    const key = schemaArena.addItem({});
    assert.equal(key, count);
  }

  for (let count = 0; count < 1000; count++) {
    const itemPrevious = schemaArena.replaceItem(count, { name: String(count) });
    assert.deepEqual(itemPrevious, {});
  }

  for (let count = 0; count < 1000; count++) {
    const item = schemaArena.getItem(count);
    assert.deepEqual(item, { name: String(count) });
  }

  assert.equal(1000, schemaArena.count());
});
