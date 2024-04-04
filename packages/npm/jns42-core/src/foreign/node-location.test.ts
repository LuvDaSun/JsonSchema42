import assert from "node:assert";
import test from "node:test";
import { NodeLocation } from "./node-location.js";

test("node-location join", () => {
  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      NodeLocation.parse("http://x.y.z/"),
    );
    const expected = NodeLocation.parse("http://x.y.z/");

    assert.equal(actual.toString(), expected.toString());
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      NodeLocation.parse("c:\\x"),
    );
    const expected = NodeLocation.parse("c:/x");

    assert.equal(actual.toString(), expected.toString());
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      NodeLocation.parse("/x/y/z"),
    );
    const expected = NodeLocation.parse("http://a.b.c/x/y/z#");

    assert.equal(actual.toString(), expected.toString());
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      NodeLocation.parse("/x/y/z/"),
    );
    const expected = NodeLocation.parse("http://a.b.c/x/y/z/#");

    assert.equal(actual.toString(), expected.toString());
  }

  {
    const actual = NodeLocation.parse("c:\\a\\d\\e\\f").join(NodeLocation.parse("/x/y/z/"));
    const expected = NodeLocation.parse("c:/x/y/z/#");

    assert.equal(actual.toString(), expected.toString());
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f#/g/h/i").join(
      NodeLocation.parse("x/y/z/"),
    );
    const expected = NodeLocation.parse("http://a.b.c/d/e/x/y/z/#");

    assert.equal(actual.toString(), expected.toString());
  }

  {
    const actual = NodeLocation.parse("c:\\a\\d\\e\\f").join(NodeLocation.parse("x/y/z/"));
    const expected = NodeLocation.parse("c:/a/d/e/x/y/z/#");

    assert.equal(actual.toString(), expected.toString());
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f/#/g/h/i").join(
      NodeLocation.parse("x/y/z/"),
    );
    const expected = NodeLocation.parse("http://a.b.c/d/e/f/x/y/z/#");

    assert.equal(actual.toString(), expected.toString());
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f/#/g/h/i").join(
      NodeLocation.parse("#/x/y/z/"),
    );
    const expected = NodeLocation.parse("http://a.b.c/d/e/f/#/x/y/z/");

    assert.equal(actual.toString(), expected.toString());
  }

  {
    const actual = NodeLocation.parse("http://a.b.c/d/e/f/#/g/h/i").join(
      NodeLocation.parse("?x=y"),
    );
    const expected = NodeLocation.parse("http://a.b.c/d/e/f/?x=y");

    assert.equal(actual.toString(), expected.toString());
  }
  {
    const actual = NodeLocation.parse("http://a.b.c/d/e?f#/g/h/i").join(NodeLocation.parse("?x=y"));
    const expected = NodeLocation.parse("http://a.b.c/d/e?x=y");

    assert.equal(actual.toString(), expected.toString());
  }
});
