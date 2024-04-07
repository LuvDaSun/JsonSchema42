import assert from "node:assert";
import test from "node:test";
import { mainFfi } from "../main-ffi.js";
import { NamesBuilder } from "./names-builder.js";

test("names", () => {
  using namesBuilder = NamesBuilder.new()
    .add(1, ["cat", "id"])
    .add(2, ["cat", "name"])
    .add(3, ["dog", "id"]);

  using names = namesBuilder.build();

  {
    const actual = names.toSnakeCase(1);
    const expected = "cat_id";
    assert.equal(actual, expected);
  }

  {
    const actual = names.toSnakeCase(2);
    const expected = "name";
    assert.equal(actual, expected);
  }

  {
    const actual = names.toSnakeCase(3);
    const expected = "dog_id";
    assert.equal(actual, expected);
  }
});

test("names leak test", () => {
  function runTest() {
    using namesBuilder = NamesBuilder.new()
      .add(1, ["cat", "id"])
      .add(2, ["cat", "name"])
      .add(3, ["dog", "id"]);

    using names = namesBuilder.build();

    {
      const actual = names.toSnakeCase(1);
      const expected = "cat_id";
      assert.equal(actual, expected);
    }

    {
      const actual = names.toSnakeCase(2);
      const expected = "name";
      assert.equal(actual, expected);
    }

    {
      const actual = names.toSnakeCase(3);
      const expected = "dog_id";
      assert.equal(actual, expected);
    }
  }
  const byteLength = mainFfi.exports.memory.buffer.byteLength;
  for (let index = 0; index < 100000; index++) {
    runTest();

    assert.equal(mainFfi.exports.memory.buffer.byteLength, byteLength);
  }
});
