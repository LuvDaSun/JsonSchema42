import assert from "node:assert";
import test from "node:test";
import core from "./main.js";

test("banner", () => {
  const banner = core.utilities.banner("#", "0.0.0");

  assert(banner.startsWith("#"));
});

test("sentence", () => {
  const sentence = new core.naming.Sentence("hey hey hey");

  assert.equal(sentence.toCamelCase(), "heyHeyHey");
  assert.equal(sentence.toPascalCase(), "HeyHeyHey");
  assert.equal(sentence.toSnakeCase(), "hey_hey_hey");
  assert.equal(sentence.toScreamingSnakeCase(), "HEY_HEY_HEY");
});
