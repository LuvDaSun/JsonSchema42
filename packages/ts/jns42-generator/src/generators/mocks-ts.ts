import * as models from "../models/index.js";
import { NestedText, banner, itt, toCamel, toPascal } from "../utils/index.js";

export function* generateMocksTsCode(specification: models.Specification) {
  yield banner;

  const { names, typeArena } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  for (const [typeKey, item] of typeArena) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const functionName = toCamel("mock", names[nodeId]);
    const mock = generateMockLiteral(specification, typeKey);

    yield itt`
      // ${nodeId}
      export function ${functionName}(seed: number): types.${typeName} {
        return (${mock}) as types.${typeName};
      }
    `;
  }
}

function* generateMockStatement(
  specification: models.Specification,
  typeKey: number,
): Iterable<NestedText> {
  const { names, typeArena } = specification;
  const mock = generateMockLiteral(specification, typeKey);

  const typeItem = specification.typeArena.getItemUnalias(typeKey);
  if (typeItem.id == null) {
    yield generateMockLiteral(specification, typeKey);
  } else {
    const functionName = toCamel("mock", names[typeItem.id]);
    yield itt`${functionName}(seed)`;
  }
}

function* generateMockLiteral(
  specification: models.Specification,
  typeKey: number,
): Iterable<NestedText> {
  const typeItem = specification.typeArena.getItemUnalias(typeKey);

  switch (typeItem.type) {
    case "anyOf":
      yield itt`
        // anyOf
        (${JSON.stringify({})} as any)
      `;
      break;

    case "allOf":
      yield itt`
        // allOf
        (${JSON.stringify({})} as any)
      `;
      break;

    case "never":
      yield itt`(${JSON.stringify({})} as never)`;
      break;

    case "unknown":
      yield itt`(${JSON.stringify({})} as unknown)`;
      break;

    case "any":
      yield itt`(${JSON.stringify({})} as any)`;
      break;

    case "null":
      yield JSON.stringify(null);
      break;

    case "boolean":
      yield JSON.stringify(true);
      break;

    case "integer":
      yield JSON.stringify(10);
      break;

    case "number":
      yield JSON.stringify(10.1);
      break;

    case "string":
      yield JSON.stringify("string");
      break;

    case "tuple":
      yield JSON.stringify([]);
      break;

    case "array":
      yield JSON.stringify([]);
      break;

    case "object":
      yield JSON.stringify({});
      break;

    case "map":
    case "object":
      yield JSON.stringify({});
      break;

    case "oneOf":
      yield itt`
        (
          () => {
            switch(seed % ${JSON.stringify(typeItem.elements.length)}) {
              ${typeItem.elements.map(
                (element, index) => itt`
                  case ${JSON.stringify(index)}:
                    return (${generateMockStatement(specification, element)});
                `,
              )}              
            }
          }
        )()
      `;
  }
}
