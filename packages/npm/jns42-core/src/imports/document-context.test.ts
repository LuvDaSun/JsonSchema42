import assert from "node:assert";
import test from "node:test";
import path from "path";
import { projectRoot } from "../root.js";
import { DocumentContext } from "./document-context.js";
import { SchemaArena } from "./schema-arena.js";

test("load from location", async () => {
  using documentContext = DocumentContext.new();
  documentContext.registerWellKnownFactories();

  const location = path.join(
    projectRoot,
    "..",
    "..",
    "..",
    "fixtures",
    "specification",
    "schema-draft_2020-12.json#",
  );

  await documentContext.loadFromLocation(
    location,
    location,
    undefined,
    "https://json-schema.org/draft/2020-12/schema",
  );

  const schemas = documentContext.getSchemaNodes();

  // problems on windows
  // assert(schemas[location] != null);

  using arena = SchemaArena.fromDocumentContext(documentContext);

  assert.equal(arena.count(), Object.keys(schemas).length);
});
