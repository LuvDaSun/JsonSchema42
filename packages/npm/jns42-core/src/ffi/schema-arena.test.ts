import assert from "node:assert";
import test from "node:test";
import { SchemaArenaProxy } from "./schema-arena.js";

test("schema-arena", () => {
  using schemaArena = SchemaArenaProxy.new();

  for (let count = 0; count < 1000; count++) {
    schemaArena.addItem({});
  }

  assert.equal(1000, schemaArena.count());
});
