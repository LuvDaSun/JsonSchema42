import assert from "node:assert";
import test from "node:test";
import * as validation from "./validation.js";

await test("get validation error", () => {
  const error = validation.getValidationError();
  assert.equal(error.failures.length, 0);
});
