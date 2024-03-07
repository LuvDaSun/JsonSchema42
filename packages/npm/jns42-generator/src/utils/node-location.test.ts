import assert from "node:assert";
import test from "node:test";
import { NodeLocation } from "./node-location.js";

test("node-location parse base", () => {
  {
    const actual = NodeLocation.parse("a").base;
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = NodeLocation.parse("a#").base;
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = NodeLocation.parse("a#/").base;
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = NodeLocation.parse("a#/1/2/3").base;
    const expected = "a";

    assert.equal(actual, expected);
  }

  {
    const actual = NodeLocation.parse("a#/1/2/3#").base;
    const expected = "a";

    assert.equal(actual, expected);
  }
});

test("node-location parse pointer", () => {
  {
    const actual = NodeLocation.parse("").pointer;
    const expected: string[] = [];

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("#").pointer;
    const expected: string[] = [];

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("#/").pointer;
    const expected = [""];

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("#/1/2/3").pointer;
    const expected = ["1", "2", "3"];

    assert.deepEqual(actual, expected);
  }
});

test("node-location join", () => {
  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      NodeLocation.parse("http://x.y.z/"),
    );
    const expected = NodeLocation.parse("http://x.y.z/");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      NodeLocation.parse("c:\\x"),
    );
    const expected = NodeLocation.parse("c:/x");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      NodeLocation.parse("/x/y/z"),
    );
    const expected = NodeLocation.parse("http://a.b.c/x/y/z#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      NodeLocation.parse("/x/y/z/"),
    );
    const expected = NodeLocation.parse("http://a.b.c/x/y/z/#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("c:\\a\\d\\e\\f").join(NodeLocation.parse("/x/y/z/"));
    const expected = NodeLocation.parse("c:/x/y/z/#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      NodeLocation.parse("x/y/z/"),
    );
    const expected = NodeLocation.parse("http://a.b.c/d/e/x/y/z/#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("c:\\a\\d\\e\\f").join(NodeLocation.parse("x/y/z/"));
    const expected = NodeLocation.parse("c:/a/d/e/x/y/z/#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f/#/g/h/i").join(
      NodeLocation.parse("x/y/z/"),
    );
    const expected = NodeLocation.parse("http://a.b.c/d/e/f/x/y/z/#");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f/#/g/h/i").join(
      NodeLocation.parse("#/x/y/z/"),
    );
    const expected = NodeLocation.parse("http://a.b.c/d/e/f/#/x/y/z/");

    assert.deepEqual(actual, expected);
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f/#/g/h/i").join(
      NodeLocation.parse("?x=y"),
    );
    const expected = NodeLocation.parse("http://a.b.c/d/e/f/?x=y");

    assert.deepEqual(actual, expected);
  }
  {
    const actual = NodeLocation.parse("http://a.b.c/d/e?f#/g/h/i").join(NodeLocation.parse("?x=y"));
    const expected = NodeLocation.parse("http://a.b.c/d/e?x=y");

    assert.deepEqual(actual, expected);
  }
});

test("node-location escape", () => {
  const actual = NodeLocation.escape("~~//:-)");
  const expected = "~0~0~1~1:-)";

  assert.equal(actual, expected);
});

test("node-location unescape", () => {
  const actual = NodeLocation.unescape("~~~0~~~1~01:-)");
  const expected = "~~~~~/~1:-)";

  assert.equal(actual, expected);
});
