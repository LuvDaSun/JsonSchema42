import { banner } from "@jns42/core";
import * as models from "../models/index.js";
import { itt, mapIterable, packageInfo } from "../utils/index.js";

export function* generateExamplesTestTsCode(specification: models.Specification) {
  yield banner("//", `v${packageInfo.version}`);

  const { names, typesArena } = specification;

  yield itt`
    import assert from "assert";
    import test from "node:test";
    import * as validators from "./validators.js";
  `;

  for (const [key, item] of [...typesArena].map((item, key) => [key, item] as const)) {
    const { location: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const itemValue = item.toValue();

    using typeName = names.getName(key);

    yield mapIterable(
      itemValue.examples ?? [],
      (example) => itt`
        test(${JSON.stringify(typeName.toPascalCase())}, () => {
          const example = ${JSON.stringify(example)};
          const valid = validators.is${typeName.toPascalCase()}(example);
          assert.equal(valid, true);
        });
      `,
    );
  }
}
