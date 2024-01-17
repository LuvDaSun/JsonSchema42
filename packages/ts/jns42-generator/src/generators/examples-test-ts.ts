import * as models from "../models/index.js";
import { banner, itt, mapIterable, toCamel } from "../utils/index.js";

export function* generateExamplesTestTsCode(specification: models.Specification) {
  yield banner;

  const { names, typesArena } = specification;

  yield itt`
    import assert from "node:assert/strict";
    import test from "node:test";
    import * as validators from "./validators.js";
  `;

  for (const [itemKey, item] of Object.entries(typesArena)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = names[nodeId];
    const validatorFunctionName = toCamel("is", names[nodeId]);

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
