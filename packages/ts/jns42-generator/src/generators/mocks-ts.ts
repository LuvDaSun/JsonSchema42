import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  itt,
  joinIterable,
  mapIterable,
  repeat,
  toCamel,
  toPascal,
} from "../utils/index.js";

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
      export function ${functionName}(): types.${typeName} {
        return (${mock});
      }
    `;
  }

  yield itt`
    let seed = 1;
    function nextSeed() {
      // https://en.wikipedia.org/wiki/Linear_congruential_generator
      // https://statmath.wu.ac.at/software/src/prng-3.0.2/doc/prng.html/Table_LCG.html
      const p = Math.pow(2, 31) - 1;
      const a = 950706376;
      const b = 0;
  
      seed = (a * seed + b) % p;

      return seed;
    }
    `;
}

function* generateMockStatement(
  specification: models.Specification,
  typeKey: number,
): Iterable<NestedText> {
  const { names, typeArena } = specification;
  const typeItem = specification.typeArena.getItem(typeKey);
  if (typeItem.id == null) {
    yield generateMockLiteral(specification, typeKey);
  } else {
    const functionName = toCamel("mock", names[typeItem.id]);
    yield itt`${functionName}()`;
  }
}

function* generateMockLiteral(
  specification: models.Specification,
  typeKey: number,
): Iterable<NestedText> {
  const typeItem = specification.typeArena.getItemUnalias(typeKey);

  switch (typeItem.type) {
    case "anyOf":
      throw new TypeError("anyOf not supported");

    case "allOf":
      throw new TypeError("allOf not supported");

    case "never":
      throw new TypeError("never not supported");

    case "unknown":
      yield itt`
        // unknown
        ${JSON.stringify({})}
      `;
      break;

    case "any":
      yield itt`
        // any
        ${JSON.stringify({})}
      `;
      break;

    case "null":
      yield JSON.stringify(null);
      break;

    case "boolean":
      yield `Boolean(nextSeed() % 2)`;
      break;

    case "integer":
      yield `Number(nextSeed() % ${JSON.stringify(1000)})`;
      break;

    case "number":
      yield `Number(nextSeed() % ${JSON.stringify(1000)} * 10) / 10`;
      break;

    case "string":
      yield `${JSON.stringify("string")} + nextSeed()`;
      break;

    case "tuple": {
      yield itt`
        [
          ${joinIterable(
            typeItem.elements.map(
              (element) => itt`
                ${generateMockStatement(specification, element)},
              `,
            ),
            "",
          )}
        ]
      `;
      break;
    }

    case "array": {
      const { element } = typeItem;
      yield itt`
        [
          ${mapIterable(
            repeat(5),
            () => itt`
              ${generateMockStatement(specification, element)},
            `,
          )}
        ]
      `;
      break;
    }

    case "object": {
      yield itt`
        {
          ${joinIterable(
            Object.entries(typeItem.properties).map(([name, { required, element }]) =>
              required
                ? itt`
                  ${JSON.stringify(name)}: ${generateMockStatement(specification, element)},
                `
                : itt`
                  ${JSON.stringify(name)}: Boolean(nextSeed() % 2) ? ${generateMockStatement(
                    specification,
                    element,
                  )} : undefined,
            `,
            ),
            "",
          )}
        }
      `;
      break;
    }

    case "map": {
      const { name, element } = typeItem;
      yield itt`
        {
          ${mapIterable(
            repeat(5),
            () => itt`
              [${generateMockStatement(specification, name)}]: ${generateMockStatement(
                specification,
                element,
              )},
            `,
          )}
        }
      `;
      break;
    }

    case "oneOf": {
      yield itt`
        (
          () => {
            switch (
              (
                nextSeed() % ${JSON.stringify(typeItem.elements.length)}
              ) as ${joinIterable(
                typeItem.elements.map((element, index) => JSON.stringify(index)),
                " | ",
              )}
            ) {
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
      break;
    }
  }
}
