import assert from "node:assert";
import test from "node:test";
import { DocumentContext } from "./document-context.js";

test("load empty", async () => {
  using documentContext = DocumentContext.new();
  documentContext.registerWellKnownFactories();

  await documentContext.loadFromNode(
    "schema.json",
    "schema.json",
    undefined,
    {},
    "https://json-schema.org/draft/2020-12/schema",
  );

  const intermediateDocument = documentContext.getIntermediateDocument();

  assert(intermediateDocument.schemas["schema.json#"] != null);
});
