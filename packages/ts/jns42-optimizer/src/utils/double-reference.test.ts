import assert from "node:assert/strict";
import test from "node:test";
import { hasDoubleReference } from "../utils/double-reference.js";

test("double-reference", () => {
  const a = {};
  const b = {};

  assert(!hasDoubleReference({ a, b }));
  assert(hasDoubleReference({ a, b: a }));

  assert(!hasDoubleReference([a, b]));
  assert(hasDoubleReference([a, a]));
});
