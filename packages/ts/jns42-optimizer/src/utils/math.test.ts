import assert from "assert";
import test from "node:test";
import { findGreatestCommonDivisor, findMultipleOf } from "./math.js";

test("find-greatest-common-divisor", (t) => {
  assert.equal(findGreatestCommonDivisor(10, 6), 2);
  assert.equal(findGreatestCommonDivisor(15, 30), 15);
  assert.equal(findGreatestCommonDivisor(8, 12), 4);
  assert.equal(findGreatestCommonDivisor(48, 18), 6);
});

test("find-multiple-of", (t) => {
  assert.equal(findMultipleOf(5, 3), 15);
  assert.equal(findMultipleOf(10, 6), 30);
  assert.equal(findMultipleOf(8, 8), 8);
  // assert.equal(findMultipleOf(0.1, 10), 10);
});
