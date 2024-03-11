import assert from "assert";
import test from "node:test";
import { hasProperties } from "./properties.js";

test("has-properties", () => {
  {
    assert.equal(hasProperties({ a: 1 }, ["a"]), true);
    assert.equal(hasProperties({ a: 1, b: 2 }, ["a"]), false);
  }

  {
    assert.equal(hasProperties({ a: 1 } as Record<string, number>, ["a"], ["b"]), true);
    assert.equal(hasProperties({ a: 1, b: 2 }, ["a"], ["b"]), true);
  }
});
