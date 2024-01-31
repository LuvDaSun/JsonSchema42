import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../schema/index.js";
import { normalizeObject } from "../utils/index.js";
import { flipAllOfOneOf } from "./flip-all-of-one-of.js";

const useTransforms = [flipAllOfOneOf];

test.skip("flip-all-of-one-of", () => {
  const arena = new SchemaArena();
  arena.addItem({ types: ["string"] }); // 0
  arena.addItem({ types: ["string"] }); // 1
  arena.addItem({ types: ["string"] }); // 2
  arena.addItem({ types: ["string"] }); // 3
  arena.addItem({ types: ["string"] }); // 4
  arena.addItem({ types: ["string"] }); // 5
  arena.addItem({ oneOf: [2, 3] }); // 6
  arena.addItem({ oneOf: [4, 5] }); // 7
  arena.addItem({ allOf: [0, 1, 6, 7] }); // 8

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),
    [
      { types: ["string"] }, // 0
      { types: ["string"] }, // 1
      { types: ["string"] }, // 2
      { types: ["string"] }, // 3
      { types: ["string"] }, // 4
      { types: ["string"] }, // 5
      { oneOf: [2, 3] }, // 6
      { oneOf: [4, 5] }, // 7
      { oneOf: [9, 10, 11, 12] }, // 8
      { allOf: [0, 1, 2] }, // 9
      { allOf: [0, 1, 3] }, // 10
      { allOf: [0, 1, 4] }, // 11
      { allOf: [0, 1, 5] }, // 12
    ],
  );
});

/*
so

```yaml
- allOf:
    - 1
    - 2
    - 3
- type: object
- oneOf:
    - 100
    - 200
- oneOf:
    - 300
    - 400
```

equals

```yaml
- oneOf:
    - 2
    - 3
    - 4
    - 5
- type: object
- allOf:
    - 1
    - 100
    - 300
- allOf:
    - 1
    - 100
    - 400
- allOf:
    - 1
    - 200
    - 300
- allOf:
    - 1
    - 200
    - 400
```
*/

test("flip-all-of-one-of 2", () => {
  const arena = new SchemaArena();
  arena.addItem({}); // 0
  arena.addItem({}); // 1
  arena.addItem({}); // 2
  arena.addItem({}); // 3
  arena.addItem({}); // 4
  arena.addItem({ oneOf: [1, 2] }); // 5
  arena.addItem({ oneOf: [3, 4] }); // 6
  arena.addItem({ allOf: [0, 7, 8] }); // 7

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual(
    [...arena].map(([k, v]) => normalizeObject(v)),
    [
      {}, // 0
      {}, // 1
      {}, // 2
      {}, // 3
      {}, // 4
      { oneOf: [1, 2] }, // 5
      { oneOf: [3, 4] }, // 6
      { oneOf: [8, 9, 10, 11] }, // 7
      { allOf: [0, 1, 3] }, // 8
      { allOf: [0, 1, 4] }, // 9
      { allOf: [0, 2, 3] }, // 10
      { allOf: [0, 1, 4] }, // 11
    ],
  );
});
