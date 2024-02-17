import assert from "node:assert";
import test from "node:test";
import { Namer, PartInfo, comparePartInfos } from "./namer.js";

test("compare part info", () => {
  const partInfoA: PartInfo = {
    cardinality: 100,
    index: 1,
    isHead: false,
    value: "A",
  };
  const partInfoB: PartInfo = {
    cardinality: 1,
    index: 2,
    isHead: false,
    value: "B",
  };
  const partInfoC: PartInfo = {
    cardinality: 100,
    index: 3,
    isHead: false,
    value: "C",
  };
  const partInfoD: PartInfo = {
    cardinality: 10,
    index: 4,
    isHead: false,
    value: "D",
  };
  const partInfoE: PartInfo = {
    cardinality: 1000,
    index: 5,
    isHead: true,
    value: "E",
  };

  const actual = [partInfoA, partInfoB, partInfoC, partInfoD, partInfoE];
  actual.sort(comparePartInfos);

  const expected = [partInfoE, partInfoB, partInfoD, partInfoA, partInfoC];
  assert.deepEqual(actual, expected);
});

test("namer 1", () => {
  const namer = new Namer("o", 5);

  namer.registerPath("/A", "/A");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "O",
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
    "/A": "A",
    "/B": "B",
    "/B/C": "BC",
    "/A/C": "AC",
    "/C/A": "CA",
  });

  namer.registerPath("/A/B/C", "/A/B/C");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "A",
    "/B": "B",
    "/B/C": "BC",
    "/A/C": "AC",
    "/C/A": "CA",
    "/A/B/C": "ABC",
  });

  namer.registerPath("/A/B/C/D/E/F", "/A/B/C/D/E/F");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "A",
    "/B": "B",
    "/B/C": "BC",
    "/A/C": "AC",
    "/C/A": "CA",
    "/A/B/C": "ABC",
    "/A/B/C/D/E/F": "F",
  });

  namer.registerPath("/X/Y/Z/D/E/F", "/X/Y/Z/D/E/F");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "A",
    "/B": "B",
    "/B/C": "BC",
    "/A/C": "AC",
    "/C/A": "CA",
    "/A/B/C": "ABC",
    "/A/B/C/D/E/F": "DF",
    "/X/Y/Z/D/E/F": "XF",
  });

  namer.registerPath("/X/Y/Z/D/E/1", "/X/Y/Z/D/E/1");
  assert.deepStrictEqual(namer.getNames(), {
    "/A": "A",
    "/B": "B",
    "/B/C": "BC",
    "/A/C": "AC",
    "/C/A": "CA",
    "/A/B/C": "ABC",
    "/A/B/C/D/E/F": "DF",
    "/X/Y/Z/D/E/F": "XF",
    "/X/Y/Z/D/E/1": "X1",
  });
});

test("namer 2", () => {
  const namer = new Namer("o", 5);

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
  const namer = new Namer("o", 5);

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
