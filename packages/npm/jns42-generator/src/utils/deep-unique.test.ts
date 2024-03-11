import assert from "assert";
import test from "node:test";
import { deepUnique } from "./deep-unique.js";

test("deep-unique", () => {
  {
    const expected = [{ a: 0 }];
    const actual = [...deepUnique([{ a: 0 }, { a: 0 }, { a: 0 }])];
    assert.deepEqual(actual, expected);
  }

  {
    const expected = [{ a: 0 }, { a: 0, b: undefined }];
    const actual = [...deepUnique([{ a: 0 }, { a: 0 }, { a: 0, b: undefined }])];
    assert.deepEqual(actual, expected);
  }

  {
    const expected = [{ a: 0 }, { a: 0, b: undefined }];
    const actual = [...deepUnique([{ a: 0 }, { a: 0 }, { a: 0, b: undefined }])];
    assert.deepEqual(actual, expected);
  }

  {
    const expected = [
      { a: 0, b: "" },
      { a: 0, b: undefined },
    ];
    const actual = [
      ...deepUnique([
        { a: 0, b: "" },
        { a: 0, b: "" },
        { a: 0, b: undefined },
        { a: 0, b: undefined },
        { a: 0, b: undefined },
      ]),
    ];
    assert.deepEqual(actual, expected);
  }
});
