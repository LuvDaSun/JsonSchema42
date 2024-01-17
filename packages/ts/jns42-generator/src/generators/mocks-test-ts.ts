import * as models from "../models/index.js";
import { banner, itt, toCamel } from "../utils/index.js";

export function* generateMocksTestTsCode(specification: models.Specification) {
  yield banner;

  const { names, typeModels } = specification;

  yield itt`
    import assert from "node:assert/strict";
    import test from "node:test";
    import * as validators from "./validators.js";
    import * as mocks from "./mocks.js";
  `;

  for (const [typeKey, typeItem] of Object.entries(typeModels)) {
    const { id: nodeId } = typeItem;

    if (nodeId == null) {
      continue;
    }

    const typeName = names[nodeId];
    const validatorFunctionName = toCamel("is", names[nodeId]);
    const mockFunctionName = toCamel("mock", names[nodeId]);

    yield itt`
      test(${JSON.stringify(typeName)}, () => {
        const mock = mocks.${mockFunctionName}();
        const valid = validators.${validatorFunctionName}(mock);
        assert.equal(valid, true);
      });
    `;
  }
}
