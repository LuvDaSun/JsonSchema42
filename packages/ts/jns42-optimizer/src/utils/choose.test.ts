import assert from "node:assert/strict";
import test from "node:test";
import { choose } from "./choose.js";

test("combinations", (t) => {
  {
    const expected = [["a"], ["b"], ["c"], ["d"]];
    const actual = choose(["a", "b", "c", "d"], 1);

    assert.deepStrictEqual(actual, expected);
  }

  {
    const expected = [
      ["a", "b"],
      ["a", "c"],
      ["a", "d"],
      ["b", "c"],
      ["b", "d"],
      ["c", "d"],
    ];
    const actual = choose(["a", "b", "c", "d"], 2);

    assert.deepStrictEqual(actual, expected);
  }

  {
    const expected = [
      ["a", "b", "c"],
      ["a", "b", "d"],
      ["a", "c", "d"],
      ["b", "c", "d"],
    ];
    const actual = choose(["a", "b", "c", "d"], 3);

    assert.deepStrictEqual(actual, expected);
  }

  {
    const expected = [["a", "b", "c", "d"]];
    const actual = choose(["a", "b", "c", "d"], 4);

    assert.deepStrictEqual(actual, expected);
  }
});
