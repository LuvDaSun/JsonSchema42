import * as core from "@jns42/core";
import * as models from "../models.js";
import { generateJsDocComments, isMockable, itt, readPackageInfo } from "../utilities.js";

export function* generateMocksTestTsCode(specification: models.Specification) {
  const packageInfo = readPackageInfo();

  yield core.banner("//", `v${packageInfo.version}`);

  const { names, typesArena } = specification;

  yield itt`
    import assert from "node:assert";
    import test from "node:test";
    import * as validators from "./validators.js";
    import * as mocks from "./mocks.js";
  `;

  for (let itemKey = 0; itemKey < typesArena.count(); itemKey++) {
    if (!isMockable(typesArena, itemKey)) {
      continue;
    }

    const item = typesArena.getItem(itemKey);
    const name = names.getName(itemKey);
    if (item.location == null || name == null) {
      // only is the location is set can we be sure that the name of the type and validator
      // are the same
      continue;
    }

    yield itt`
      ${generateJsDocComments(item)}
      await test(${JSON.stringify(name.toPascalCase())}, () => {
        const mock = mocks.mock${name.toPascalCase()}();
        const valid = validators.is${name.toPascalCase()}(mock);
        assert.equal(valid, true);
      });
    `;
  }
}
