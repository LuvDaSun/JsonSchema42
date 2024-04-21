import * as models from "../models/index.js";
import { banner, generateJsDocComments, isMockable, itt } from "../utils/index.js";

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
    const { location: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    if (!isMockable(typesArena, key)) {
      continue;
    }

    using typeName = names.getName(key);

    yield itt`
      ${generateJsDocComments(item)}
      test(${JSON.stringify(typeName.toPascalCase())}, () => {
        const mock = mocks.mock${typeName.toPascalCase()}();
        const valid = validators.is${typeName.toPascalCase()}(mock);
        assert.equal(valid, true);
      });
    `;
  }
}
