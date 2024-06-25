import * as core from "@jns42/core";
import * as models from "../models/index.js";
import { itt, mapIterable, packageInfo } from "../utils/index.js";

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
    const { location: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const { primary, name } = names[itemKey];
    if (!primary) {
      continue;
    }

    yield mapIterable(
      item.examples ?? [],
      (example) => itt`
        test(${JSON.stringify(name.toPascalCase())}, () => {
          const example = ${JSON.stringify(example)};
          const valid = validators.is${name.toPascalCase()}(example);
          assert.equal(valid, true);
        });
      `,
    );
  }
}
