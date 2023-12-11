import * as models from "../models/index.js";
import { banner, itt, toCamel } from "../utils/index.js";

export function* generateMocksTestTsCode(specification: models.Specification) {
  yield banner;

  const { names, nodes, typeArena: typeMap } = specification;

  yield itt`
    import assert from "node:assert/strict";
    import test from "node:test";
    import * as validators from "./validators.js";
    import * as mocks from "./mocks.js";
  `;

  let seed = 1;
  for (const [key, item] of typeMap) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    // https://en.wikipedia.org/wiki/Linear_congruential_generator
    // https://statmath.wu.ac.at/software/src/prng-3.0.2/doc/prng.html/Table_LCG.html
    const p = Math.pow(2, 31) - 1;
    const a = 950706376;
    const b = 0;

    seed = (a * seed + b) % p;

    const typeName = names[nodeId];
    const validatorFunctionName = toCamel("is", names[nodeId]);
    const mockFunctionName = toCamel("mock", names[nodeId]);
    yield itt`
      test(${JSON.stringify(typeName)}, () => {
        const mock = mocks.${mockFunctionName}(${JSON.stringify(seed)});
        assert.equal(
          validators.${validatorFunctionName}(mock),
          true,
        )
      })
    `;
  }
}
