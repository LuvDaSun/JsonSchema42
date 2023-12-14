import assert from "node:assert/strict";
import test from "node:test";
import { hasProperties } from "./properties.js";

test("has-properties", (t) => {
  {
    assert.equal(hasProperties({ a: 1 }, ["a"]), true);
    assert.equal(hasProperties({ a: 1, b: 2 }, ["a"]), false);
  }

  {
    assert.equal(hasProperties({ a: 1 } as any, ["a"], ["b"]), true);
    assert.equal(hasProperties({ a: 1, b: 2 }, ["a"], ["b"]), true);
  }
});
