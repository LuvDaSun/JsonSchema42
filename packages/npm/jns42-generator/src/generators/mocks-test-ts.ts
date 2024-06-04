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
    const { location: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    if (!isMockable(typesArena, itemKey)) {
      continue;
    }

    const typeName = names.getName(itemKey);

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
