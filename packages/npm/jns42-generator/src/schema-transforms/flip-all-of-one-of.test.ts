import assert from "node:assert/strict";
import test from "node:test";
import { SchemaArena } from "../models/index.js";
import { normalizeObject } from "../utils/index.js";
import { flipAllOfOneOf } from "./flip-all-of-one-of.js";

const useTransforms = [flipAllOfOneOf];

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
  arena.addItem({ allOf: [0, 5, 6] }); // 7

  while (arena.applyTransform(...useTransforms) > 0);

  assert.deepEqual([...arena].map(normalizeObject), [
    {}, // 0
    {}, // 1
    {}, // 2
    {}, // 3
    {}, // 4
    { oneOf: [1, 2] }, // 5
    { oneOf: [3, 4] }, // 6
    { oneOf: [8, 9, 10, 11] }, // 7
    { parent: 7, allOf: [0, 1, 3] }, // 8
    { parent: 7, allOf: [0, 1, 4] }, // 9
    { parent: 7, allOf: [0, 2, 3] }, // 10
    { parent: 7, allOf: [0, 2, 4] }, // 11
  ]);
});
