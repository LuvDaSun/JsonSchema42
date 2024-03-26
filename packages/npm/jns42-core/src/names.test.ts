import assert from "node:assert";
import test from "node:test";
import { NamesBuilder } from "./names.js";

test("names", () => {
  using namesBuilder = NamesBuilder.new()
    .add(1, "cat")
    .add(1, "id")
    .add(2, "cat")
    .add(2, "name")
    .add(3, "dog")
    .add(3, "id");

  using names = namesBuilder.build(5);

  {
    const actual = names.toSnakeCase(1);
    const expected = "id_cat";
    assert.equal(actual, expected);
  }

  {
    const actual = names.toSnakeCase(2);
    const expected = "name";
    assert.equal(actual, expected);
  }

  {
    const actual = names.toSnakeCase(3);
    const expected = "id_dog";
    assert.equal(actual, expected);
  }
});
