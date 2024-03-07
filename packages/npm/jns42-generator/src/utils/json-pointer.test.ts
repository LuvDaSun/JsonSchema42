import assert from "node:assert";
import test from "node:test";
import { JsonPointer } from "./json-pointer.js";

test("json-pointer parse base", () => {
  {
    const actual = JsonPointer.parse("a").getBase();
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = JsonPointer.parse("a#").getBase();
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = JsonPointer.parse("a#/").getBase();
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = JsonPointer.parse("a#/1/2/3").getBase();
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = JsonPointer.parse("a#/1/2/3#").getBase();
    const expected = "a";

    assert.equal(actual, expected);
  }
});

test("json-pointer parse pointer", () => {
  {
    const actual = JsonPointer.parse("").getPointer();
    const expected: string[] = [];

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonPointer.parse("#").getPointer();
    const expected: string[] = [];

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonPointer.parse("#/").getPointer();
    const expected = [""];

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonPointer.parse("#/1/2/3").getPointer();
    const expected = ["1", "2", "3"];

    assert.deepEqual(actual, expected);
  }
});

test("json-pointer escape", () => {
  const actual = JsonPointer.escape("~~//:-)");
  const expected = "~0~0~1~1:-)";

  assert.equal(actual, expected);
});

test("json-pointer unescape", () => {
  const actual = JsonPointer.unescape("~~~0~~~1~01:-)");
  const expected = "~~~~~/~1:-)";

  assert.equal(actual, expected);
});
