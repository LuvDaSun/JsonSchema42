import assert from "assert";
import test from "node:test";
import { readJson } from "./read-json.js";

test("read json", (t) => {
  const actual = [
    ...readJson("#", {
      a: "b",
      c: ["d", "e"],
    }),
  ];

  const expected = [
    [
      "#",
      {
        a: "b",
        c: ["d", "e"],
      },
    ],
    ["#/a", "b"],
    ["#/c", ["d", "e"]],
    ["#/c/0", "d"],
    ["#/c/1", "e"],
  ];

  assert.deepStrictEqual(actual, expected);
});
