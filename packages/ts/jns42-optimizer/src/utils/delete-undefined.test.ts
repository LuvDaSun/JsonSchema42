import assert from "node:assert";
import test from "node:test";
import { deleteUndefined } from "./delete-undefined.js";

test("delete-undefined", () => {
  assert.deepEqual(deleteUndefined({ a: undefined }), {});
});
