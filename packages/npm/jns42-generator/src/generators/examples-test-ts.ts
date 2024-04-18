import * as models from "../models/index.js";
import { banner, itt, mapIterable } from "../utils/index.js";

export function* generateExamplesTestTsCode(specification: models.Specification) {
  yield banner;

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

    using typeName = names.getName(key);

    yield mapIterable(
      item.examples ?? [],
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
