import assert from "node:assert/strict";
import test from "node:test";
import { calculateHash } from "./calculate-hash.js";

test("calculate-hash", () => {
  {
    const expected = calculateHash(null);
    const actual = calculateHash(0);

    assert.notDeepStrictEqual(actual, expected);
  }

  {
    const expected = calculateHash(null);
    const actual = calculateHash(false);

    assert.notDeepStrictEqual(actual, expected);
  }

  {
    const expected = calculateHash(null);
    const actual = calculateHash("");

    assert.deepStrictEqual(actual, expected);
  }

  {
    const expected = calculateHash("xx");
    const actual = calculateHash("xy");

    assert.notDeepStrictEqual(actual, expected);
  }

  {
    const expected = calculateHash({
      a: 1,
      b: 2,
    });
    const actual = calculateHash({
      a: 1,
      b: 3,
    });

    assert.notDeepStrictEqual(actual, expected);
  }
});
