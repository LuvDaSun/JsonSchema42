import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  generateJsDocComments,
  itt,
  joinIterable,
  mapIterable,
  repeat,
  toCamel,
  toPascal,
} from "../utils/index.js";

export function* generateMocksTsCode(specification: models.Specification) {
  yield banner;

  const { names, types } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  yield itt`
    const depthCounters: Record<string, number> = {};
    const maximumDepth = 2;
  `;

  for (const [typeKey, item] of Object.entries(types)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const functionName = toCamel("mock", names[nodeId]);
    const definition = generateMockDefinition(specification, typeKey);

    yield itt`
      ${generateJsDocComments(item)}
      export function ${functionName}(): types.${typeName} {
        depthCounters[${JSON.stringify(typeKey)}] ??= 0;

        try {
          depthCounters[${JSON.stringify(typeKey)}]++;
          
          return (${definition});
        }
        finally {
          depthCounters[${JSON.stringify(typeKey)}]--;
        }
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

    const chars = "abcdefghijklmnopqrstuvwxyz";
    function randomString(length: number) {
      let str = ""
      while(str.length < length) {
        str += chars[nextSeed() % chars.length];
      }
      return str;
    }
  `;
}

function* generateMockReference(
  specification: models.Specification,
  typeKey: string,
): Iterable<NestedText> {
  const { names, types } = specification;
  const typeItem = types[typeKey];
  if (typeItem.id == null) {
    yield itt`(${generateMockDefinition(specification, typeKey)})`;
  } else {
    const functionName = toCamel("mock", names[typeItem.id]);
    yield itt`${functionName}()`;
  }
}

function* generateMockDefinition(
  specification: models.Specification,
  typeKey: string,
): Iterable<NestedText> {
  const { names, types } = specification;
  const typeItem = types[typeKey];

  switch (typeItem.type) {
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

    case "boolean": {
      if (typeItem.options != null) {
        yield itt`([${joinIterable(
          typeItem.options.map((option) => JSON.stringify(option)),
          ", ",
        )}] as const)[nextSeed() % ${JSON.stringify(typeItem.options.length)}]`;
        break;
      }
      yield `Boolean(nextSeed() % 2)`;
      break;
    }

    case "integer":
      if (typeItem.options != null) {
        yield itt`([${joinIterable(
          typeItem.options.map((option) => JSON.stringify(option)),
          ", ",
        )}] as const)[nextSeed() % ${JSON.stringify(typeItem.options.length)}]`;
        break;
      }
      yield `Number(nextSeed() % ${JSON.stringify(1000)})`;
      break;

    case "number":
      if (typeItem.options != null) {
        yield itt`([${joinIterable(
          typeItem.options.map((option) => JSON.stringify(option)),
          ", ",
        )}] as const)[nextSeed() % ${JSON.stringify(typeItem.options.length)}]`;
        break;
      }
      yield `Number(nextSeed() % ${JSON.stringify(1000)} * 10) / 10`;
      break;

    case "string":
      if (typeItem.options != null) {
        yield itt`([${joinIterable(
          typeItem.options.map((option) => JSON.stringify(option)),
          ", ",
        )}] as const)[nextSeed() % ${JSON.stringify(typeItem.options.length)}]`;
        break;
      }
      yield `randomString(10)`;
      break;

    case "tuple": {
      yield itt`
        [
          ${joinIterable(
            typeItem.elements.map(
              (element) => itt`
                ${generateMockReference(specification, element)},
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

      const [resolvedElement] = unalias(types, element);

      yield itt`
        (depthCounters[${JSON.stringify(resolvedElement)}] ?? 0) < maximumDepth ? [
          ${mapIterable(
            repeat(5),
            () => itt`
              ${generateMockReference(specification, element)},
            `,
          )}
        ] : []
      `;
      break;
    }

    case "object": {
      yield itt`
        {
          ${joinIterable(
            Object.entries(typeItem.properties).map(([name, { required, element }]) => {
              const [resolvedElement] = unalias(types, element);

              return required
                ? itt`
                  ${JSON.stringify(name)}: ${generateMockReference(specification, element)},
                `
                : itt`
                  ${JSON.stringify(name)}: (depthCounters[${JSON.stringify(
                    resolvedElement,
                  )}] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? ${generateMockReference(
                    specification,
                    element,
                  )} : undefined,
            `;
            }),
            "",
          )}
        }
      `;
      break;
    }

    case "map": {
      const { name, element } = typeItem;
      const [resolvedElement] = unalias(types, element);

      yield itt`
        (depthCounters[${JSON.stringify(resolvedElement)}] ?? 0) < maximumDepth ? {
          ${mapIterable(
            repeat(5),
            () => itt`
              [${generateMockReference(specification, name)}]: ${generateMockReference(
                specification,
                element,
              )},
            `,
          )}
        } : {}
      `;
      break;
    }

    case "union": {
      yield itt`
        (() => {
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
                  return (${generateMockReference(specification, element)});
              `,
            )}              
          }
        })()
      `;
      break;
    }

    case "alias": {
      yield generateMockReference(specification, typeItem.target);
      break;
    }

    default:
      throw new TypeError(`${typeItem.type} not supported`);
  }
}

function unalias(
  types: Record<string, models.Item | models.Alias>,
  key: string,
): [string, models.Item] {
  let item = types[key];
  while (item.type === "alias") {
    key = item.target;
    item = types[key];
  }
  return [key, item];
}
