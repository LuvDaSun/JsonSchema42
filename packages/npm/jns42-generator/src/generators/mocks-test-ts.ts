import * as core from "@jns42/core";
import * as models from "../models/index.js";
import { generateJsDocComments, isMockable, itt, packageInfo } from "../utils/index.js";

export function* generateMocksTestTsCode(specification: models.Specification) {
  yield core.banner("//", `v${packageInfo.version}`);

  const { names, typesArena } = specification;

  yield itt`
    import assert from "assert";
    import test from "node:test";
    import * as validators from "./validators.js";
    import * as mocks from "./mocks.js";
  `;

  for (let itemKey = 0; itemKey < typesArena.count(); itemKey++) {
    const item = typesArena.getItem(itemKey);

    if (!isMockable(typesArena, itemKey)) {
      continue;
    }

    const name = names.getName(itemKey);
    if (name == null) {
      continue;
    }

    yield itt`
      ${generateJsDocComments(item)}
      test(${JSON.stringify(name.toPascalCase())}, () => {
        const mock = mocks.mock${name.toPascalCase()}();
        const valid = validators.is${name.toPascalCase()}(mock);
        assert.equal(valid, true);
      });
    `;
  }
}
