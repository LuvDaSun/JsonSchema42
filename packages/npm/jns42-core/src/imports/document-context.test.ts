import test from "node:test";
import { DocumentContext } from "./document-context.js";

test("load", async () => {
  using documentContext = DocumentContext.new();

  await documentContext.loadFromLocation(
    "https://api.chucknorris.io/jokes/random",
    "https://api.chucknorris.io/jokes/random",
  );

  // const data = await documentContext.load("https://api.chucknorris.io/jokes/random");
});
