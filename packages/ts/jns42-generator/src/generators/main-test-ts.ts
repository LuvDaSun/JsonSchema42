import * as models from "../models/index.js";
import { itt, toCamel } from "../utils/index.js";

export function* generateMainSpecTsCode(specification: models.Specification) {
  const { names, nodes } = specification;

  yield itt`
    import assert from "node:assert/strict";
    import test from "node:test";
    import * as main from "./main.js";
  `;

  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    if ((node.metadata.examples ?? []).length === 0) {
      continue;
    }
    const typeName = names[nodeId];
    const testBody = generateTestBody(specification, nodeId);
    yield itt`
      test(${JSON.stringify(typeName)}, () => {
        ${testBody}
      })
    `;
  }
}

function* generateTestBody(specification: models.Specification, nodeId: string) {
  const { nodes, names } = specification;
  const validatorFunctionName = toCamel("is", names[nodeId]);

  const node = nodes[nodeId];
  for (const example of node.metadata.examples ?? []) {
    yield itt`
      assert.equal(
        main.${validatorFunctionName}(${JSON.stringify(example)}),
        true,
      )
    `;
  }
}
