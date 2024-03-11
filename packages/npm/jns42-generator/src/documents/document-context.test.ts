import assert from "node:assert";
import test from "node:test";
import * as schema202012 from "../documents/schema-draft-2020-12/index.js";
import { NodeLocation, normalizeObject } from "../utils/index.js";
import { DocumentContext } from "./document-context.js";

test("document-context load-from-document", async () => {
  const context = new DocumentContext();
  context.registerFactory(
    schema202012.metaSchemaId,
    ({
      retrievalLocation: retrievalUrl,
      givenLocation: givenUrl,
      antecedentLocation: antecedentUrl,
      documentNode: rootNode,
    }) => new schema202012.Document(retrievalUrl, givenUrl, antecedentUrl, rootNode, context),
  );

  await context.loadFromDocument(
    NodeLocation.parse("/retrieval/#/root"),
    NodeLocation.parse("/root/node#/root"),
    null,
    {
      type: "string",
      $defs: {
        inner: {
          $id: "inner",
          type: "number",
        },
      },
    },
    schema202012.metaSchemaId,
  );

  const actual = normalizeObject(context.getIntermediateData().schemas);
  const expected = {
    "/root/node#/root": {
      types: ["string"],
    },
    "/root/inner#": {
      types: ["number"],
    },
  };

  assert.deepEqual(actual, expected);
});
