import * as models from "../models/index.js";
import { banner, generateJsDocComments, itt, toCamel } from "../utils/index.js";

export function* generateMocksTestTsCode(specification: models.Specification) {
  yield banner;

  const { names, typesArena } = specification;

  yield itt`
    import assert from "node:assert/strict";
    import test from "node:test";
    import * as validators from "./validators.js";
    import * as mocks from "./mocks.js";
  `;

  for (const item of typesArena) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    if (item.mockable !== true) {
      continue;
    }

    const typeName = names[nodeId];
    const validatorFunctionName = toCamel("is", names[nodeId]);
    const mockFunctionName = toCamel("mock", names[nodeId]);

    yield itt`
      ${generateJsDocComments(item)}
      test(${JSON.stringify(typeName)}, () => {
        const mock = mocks.${mockFunctionName}();
        const valid = validators.${validatorFunctionName}(mock);
        assert.equal(valid, true);
      });
    `;
  }
}
