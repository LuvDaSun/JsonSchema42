import * as models from "../models/index.js";
import { banner, itt, toCamel, toPascal } from "../utils/index.js";

export function* generateMocksTsCode(specification: models.Specification) {
  yield banner;

  const { names, nodes, typeMap } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  for (const [key, item] of typeMap) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const node = nodes[nodeId];
    const typeName = toPascal(names[nodeId]);

    {
      const functionName = toCamel("mock", names[nodeId]);
      const functionBody = generateMockBody(specification, nodeId);

      yield itt`
        // ${nodeId}
        export function ${functionName}(seed: number): types.${typeName} {
          ${functionBody}
        }
      `;
    }
  }
}

function* generateMockBody(specification: models.Specification, nodeId: string) {
  const { names, nodes } = specification;
  const node = nodes[nodeId];

  yield itt`
    throw "TODO";
  `;
}
