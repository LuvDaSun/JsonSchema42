import assert from "node:assert";
import test from "node:test";
import { Namer } from "./namer.js";

test("namer 1", () => {
  const namer = new Namer("o");

  namer.registerPath("/A", "/A");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "A",
  });

  namer.registerPath("/B", "/B");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "A",
    "/B": "B",
  });

  namer.registerPath("/B/C", "/B/C");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "A",
    "/B": "B",
    "/B/C": "C",
  });

  namer.registerPath("/A/C", "/A/C");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "A",
    "/B": "B",
    "/B/C": "BC",
    "/A/C": "AC",
  });

  namer.registerPath("/C/A", "/C/A");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "OA",
    "/B": "B",
    "/B/C": "BC",
    "/A/C": "AC",
    "/C/A": "CA",
  });

  namer.registerPath("/A/B/C", "/A/B/C");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "OA",
    "/B": "B",
    "/B/C": "OBC",
    "/A/C": "AC",
    "/C/A": "CA",
    "/A/B/C": "ABC",
  });

  namer.registerPath("/A/B/C/D/E/F", "/A/B/C/D/E/F");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "OA",
    "/B": "B",
    "/B/C": "OBC",
    "/A/C": "AC",
    "/C/A": "CA",
    "/A/B/C": "ABC",
    "/A/B/C/D/E/F": "F",
  });

  namer.registerPath("/X/Y/Z/D/E/F", "/X/Y/Z/D/E/F");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "OA",
    "/B": "B",
    "/B/C": "OBC",
    "/A/C": "AC",
    "/C/A": "CA",
    "/A/B/C": "ABC",
    "/A/B/C/D/E/F": "CF",
    "/X/Y/Z/D/E/F": "ZF",
  });

  namer.registerPath("/X/Y/Z/D/E/1", "/X/Y/Z/D/E/1");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "OA",
    "/B": "B",
    "/B/C": "OBC",
    "/A/C": "AC",
    "/C/A": "CA",
    "/A/B/C": "ABC",
    "/A/B/C/D/E/F": "CF",
    "/X/Y/Z/D/E/F": "ZF",
    "/X/Y/Z/D/E/1": "E1",
  });
});

test("namer 2", () => {
  const namer = new Namer("o");

  namer.registerPath("/", "/");
  assert.deepStrictEqual(namer.getNames(), {
    "/": "O",
  });

  namer.registerPath("/A", "/A");
  assert.deepStrictEqual(namer.getNames(), {
    "/": "O",
    "/A": "A",
  });
});

test("namer 3", () => {
  const namer = new Namer("o");

  namer.registerPath("/", "/");
  assert.deepStrictEqual(namer.getNames(), {
    "/": "O",
  });

  namer.registerPath("/1", "/1");
  assert.deepStrictEqual(namer.getNames(), {
    "/": "O",
    "/1": "O1",
  });
});
