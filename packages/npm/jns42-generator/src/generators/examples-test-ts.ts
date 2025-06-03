import * as core from "@jns42/core";
import * as models from "../models.js";
import { itt, mapIterable, packageInfo } from "../utilities.js";

export function* generateExamplesTestTsCode(specification: models.Specification) {
  yield core.banner("//", `v${packageInfo.version}`);

  const { names, typesArena } = specification;

  yield itt`
    import assert from "assert";
    import test from "node:test";
    import * as validators from "./validators.js";
  `;

  for (let itemKey = 0; itemKey < typesArena.count(); itemKey++) {
    const item = typesArena.getItem(itemKey);

    const name = names.getName(itemKey);
    if (name == null) {
      continue;
    }

    yield mapIterable(
      item.examples ?? [],
      (example) => itt`
        await test(${JSON.stringify(name.toPascalCase())}, () => {
          const example = ${JSON.stringify(example)};
          const valid = validators.is${name.toPascalCase()}(example);
          assert.equal(valid, true);
        });
      `,
    );
  }
}
