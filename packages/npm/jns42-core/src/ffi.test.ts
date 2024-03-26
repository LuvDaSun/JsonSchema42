import assert from "assert";
import test from "node:test";
import * as ffi from "./ffi.js";

test("ffi reverse", () => {
  const actual = ffi.reverse("abc");
  const expected = "cba";
  assert.equal(actual, expected);
});
