import assert from "node:assert";
import test from "node:test";
import { normalizeObject } from "../utils/index.js";
import { DocumentContext } from "./document-context.js";
import { SchemaArena } from "./schema-arena.js";

test("schema-arena", () => {
  using schemaArena = SchemaArena.new();

  for (let count = 0; count < 1000; count++) {
    const key = schemaArena.addItem({});
    assert.equal(key, count);
  }

  for (let count = 0; count < 1000; count++) {
    const itemPrevious = schemaArena.replaceItem(count, { location: `#/${count}` });
    assert.deepEqual(normalizeObject(itemPrevious), {});
  }

  for (let count = 0; count < 1000; count++) {
    const item = schemaArena.getItem(count);
    assert.deepEqual(normalizeObject(item), { location: `#/${count}` });
  }

  assert.equal(1000, schemaArena.count());
});

test("schema-arena from document-context", async () => {
  using documentContext = DocumentContext.new();
  documentContext.registerWellKnownFactories();

  await documentContext.loadFromNode(
    "/string-or-boolean.json#",
    "/string-or-boolean.json#",
    undefined,
    {
      type: ["string", "boolean"],
    },
    "https://json-schema.org/draft/2020-12/schema",
  );

  using arena = SchemaArena.fromDocumentContext(documentContext);

  assert.equal(arena.count(), 1);
});
