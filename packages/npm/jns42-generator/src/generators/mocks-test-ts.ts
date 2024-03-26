import { toCamelCase } from "@jns42/core";
import * as models from "../models/index.js";
import { banner, generateJsDocComments, itt } from "../utils/index.js";

export function* generateMocksTestTsCode(specification: models.Specification) {
  yield banner;

  const { names, typesArena } = specification;

  yield itt`
    import assert from "assert";
    import test from "node:test";
    import * as validators from "./validators.js";
    import * as mocks from "./mocks.js";
  `;

  for (const [key, item] of [...typesArena].map((item, key) => [key, item] as const)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    if (!typesArena.isMockable(key)) {
      continue;
    }

    const typeName = names.toPascalCase(key);
    const validatorFunctionName = toCamelCase(`is ${typeName}`);
    const mockFunctionName = toCamelCase(`mock ${typeName}`);

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
