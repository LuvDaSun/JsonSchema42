import { product } from "@jns42/jns42-core";
import assert from "assert";
import test from "node:test";

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
