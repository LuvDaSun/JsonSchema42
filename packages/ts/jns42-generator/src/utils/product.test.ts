import assert from "node:assert/strict";
import test from "node:test";
import { product } from "./product.js";

test("product", () => {
  {
    const expected = [
      [1, 4],
      [1, 5],
      [2, 4],
      [2, 5],
      [3, 4],
      [3, 5],
    ];
    const actual = [
      ...product([
        [1, 2, 3],
        [4, 5],
      ]),
    ];
    assert.deepStrictEqual(actual, expected);
  }
});
