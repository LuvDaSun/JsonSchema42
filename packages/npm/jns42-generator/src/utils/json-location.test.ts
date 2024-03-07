import assert from "node:assert";
import test from "node:test";
import { JsonLocation } from "./json-location.js";

test("json-location parse base", () => {
  {
    const actual = JsonLocation.parse("a").getBase();
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = JsonLocation.parse("a#").getBase();
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = JsonLocation.parse("a#/").getBase();
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = JsonLocation.parse("a#/1/2/3").getBase();
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = JsonLocation.parse("a#/1/2/3#").getBase();
    const expected = "a";

    assert.equal(actual, expected);
  }
});

test("json-location parse pointer", () => {
  {
    const actual = JsonLocation.parse("").getPointer();
    const expected: string[] = [];

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("#").getPointer();
    const expected: string[] = [];

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("#/").getPointer();
    const expected = [""];

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("#/1/2/3").getPointer();
    const expected = ["1", "2", "3"];

    assert.deepEqual(actual, expected);
  }
});

test("json-location join", () => {
  {
    const actual = JsonLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      JsonLocation.parse("http://x.y.z/"),
    );
    const expected = JsonLocation.parse("http://x.y.z/");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      JsonLocation.parse("c:\\x"),
    );
    const expected = JsonLocation.parse("c:/x");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      JsonLocation.parse("/x/y/z"),
    );
    const expected = JsonLocation.parse("http://a.b.c/x/y/z#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      JsonLocation.parse("/x/y/z/"),
    );
    const expected = JsonLocation.parse("http://a.b.c/x/y/z/#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("c:\\a\\d\\e\\f").join(JsonLocation.parse("/x/y/z/"));
    const expected = JsonLocation.parse("c:/x/y/z/#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      JsonLocation.parse("x/y/z/"),
    );
    const expected = JsonLocation.parse("http://a.b.c/d/e/x/y/z/#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("c:\\a\\d\\e\\f").join(JsonLocation.parse("x/y/z/"));
    const expected = JsonLocation.parse("c:/a/d/e/x/y/z/#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("http://a.b.c/d/e/f/#/g/h/i").join(
      JsonLocation.parse("x/y/z/"),
    );
    const expected = JsonLocation.parse("http://a.b.c/d/e/f/x/y/z/#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = JsonLocation.parse("http://a.b.c/d/e/f/#/g/h/i").join(
      JsonLocation.parse("#/x/y/z/"),
    );
    const expected = JsonLocation.parse("http://a.b.c/d/e/f/#/x/y/z/");

    assert.deepEqual(actual, expected);
  }
});

test("json-location escape", () => {
  const actual = JsonLocation.escape("~~//:-)");
  const expected = "~0~0~1~1:-)";

  assert.equal(actual, expected);
});

test("json-location unescape", () => {
  const actual = JsonLocation.unescape("~~~0~~~1~01:-)");
  const expected = "~~~~~/~1:-)";

  assert.equal(actual, expected);
});
