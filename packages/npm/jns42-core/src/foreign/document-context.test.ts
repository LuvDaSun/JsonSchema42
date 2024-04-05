import test from "node:test";
import { DocumentContext } from "./document-context.js";

test("load", async () => {
  using documentContext = DocumentContext.new();

  documentContext.load("http://google.com");

  await new Promise<void>((resolve) => setTimeout(resolve, 1000));

  debugger;
});
