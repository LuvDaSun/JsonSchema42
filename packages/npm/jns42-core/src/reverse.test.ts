import assert from "assert";
import test from "node:test";
import { reverse } from "./reverse.js";

test("reverse", () => {
  const actual = reverse("abc");
  const expected = "cba";
  assert.equal(actual, expected);
});
