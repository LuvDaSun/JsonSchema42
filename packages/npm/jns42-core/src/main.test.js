import assert from "node:assert";
import test from "node:test";
import core from "./main.js";

test("ok", () => {
  const actual = core.utilities.banner("#", "0.0.0");

  assert(actual.startsWith("#"));
});
