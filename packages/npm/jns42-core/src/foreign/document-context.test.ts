import test from "node:test";
import { DocumentContext } from "./document-context.js";

test("load", async () => {
  using documentContext = DocumentContext.new();

  await documentContext.load("http://google.com");

  debugger;
});
