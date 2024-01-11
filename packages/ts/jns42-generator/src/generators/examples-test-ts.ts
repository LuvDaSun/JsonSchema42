import * as models from "../models/index.js";
import { banner, itt, mapIterable, toCamel } from "../utils/index.js";

export function* generateExamplesTestTsCode(specification: models.Specification) {
  yield banner;

  const { names, types } = specification;

  yield itt`
    import assert from "node:assert/strict";
    import test from "node:test";
    import * as validators from "./validators.js";
  `;

  for (const [typeKey, typeItem] of Object.entries(types)) {
    const { id: nodeId } = typeItem;

    if (nodeId == null) {
      continue;
    }

    if ((typeItem.examples ?? []).length === 0) {
      continue;
    }

    const typeName = names[nodeId];
    const validatorFunctionName = toCamel("is", names[nodeId]);

    yield itt`
      test(${JSON.stringify(typeName)}, () => {
        ${mapIterable(
          typeItem.examples ?? [],
          (example) => itt`
            assert.equal(
              validators.${validatorFunctionName}(${JSON.stringify(example)}),
              true,
            )
          `,
        )}
      });
    `;
  }
}
