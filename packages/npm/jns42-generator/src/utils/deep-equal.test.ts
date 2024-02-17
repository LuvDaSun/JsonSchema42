import assert from "node:assert/strict";
import test from "node:test";
import { deepEqual } from "./deep-equal.js";

test("deep-equal", () => {
  assert.equal(deepEqual(null, 0), false);
  assert.equal(deepEqual({ b: undefined }, { a: undefined }), false);
  assert.equal(deepEqual({ a: 1, b: undefined }, { a: 1, b: undefined }), true);
});
