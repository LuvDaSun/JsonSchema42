import assert from "node:assert";
import test from "node:test";
import { DocumentContext } from "./document-context.js";

test("load from node", async () => {
  using documentContext = DocumentContext.new();
  documentContext.registerWellKnownFactories();

  await documentContext.loadFromNode(
    "string-or-boolean.json",
    "string-or-boolean.json",
    undefined,
    {
      $schema: "http://json-schema.org/draft-04/schema#",
      type: ["string", "boolean"],
    },
    "https://json-schema.org/draft/2020-12/schema",
  );

  const intermediateDocument = documentContext.getIntermediateDocument();

  assert(intermediateDocument.schemas["schema.json#"] != null);
});
