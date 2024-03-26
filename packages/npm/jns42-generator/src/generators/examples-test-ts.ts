import { toCamelCase } from "@jns42/core";
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

  for (const [itemKey, item] of Object.entries(typesArena)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = names[nodeId];
    const validatorFunctionName = toCamelCase(["is", names[nodeId]].join(" "));

    yield mapIterable(
      item.examples ?? [],
      (example) => itt`
        test(${JSON.stringify(typeName)}, () => {
          const example = ${JSON.stringify(example)};
          const valid = validators.${validatorFunctionName}(example);
          assert.equal(valid, true);
        });
      `,
    );
  }
}
