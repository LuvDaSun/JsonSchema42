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

    interface RandomStringArguments {
      lengthOffset: number,
      lengthRange: number,
      chars: string,
    }
    // TODO verify that this does exactly what we want it to do
    function randomString({
      lengthOffset,
      lengthRange,
      chars,
    }: RandomStringArguments) {
      const length = lengthOffset + nextSeed() % lengthRange;
      let value = ""
      while(value.length < length) {
        value += chars[nextSeed() % chars.length];
      }
      return value;
    }

    interface RandomNumberArguments {
      isMinimumInclusive: boolean;
      isMaximumInclusive: boolean;
      minimumValue: number;
      maximumValue: number;
      precisionOffset: number,
      precisionRange: number,
    }
    // TODO verify that this does exactly what we want it to do
    function randomNumber({
      isMinimumInclusive,
      isMaximumInclusive,
      minimumValue,
      maximumValue,
      precisionOffset,
      precisionRange,
    }: RandomNumberArguments) {
      const precision = precisionOffset + nextSeed() % precisionRange;
      const inclusiveMinimumValue = isMinimumInclusive ? minimumValue : minimumValue + (1 / precision);
      const inclusiveMaximumValue = isMaximumInclusive ? maximumValue : maximumValue - (1 / precision);
      const valueOffset = inclusiveMinimumValue * precision;
      const valueRange = (inclusiveMaximumValue - inclusiveMinimumValue) * precision;
      const value = (valueOffset + nextSeed() % valueRange) / precision;
      return value;
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

    case "integer": {
      if (typeItem.options != null) {
        yield itt`([${joinIterable(
          typeItem.options.map((option) => JSON.stringify(option)),
          ", ",
        )}] as const)[nextSeed() % ${JSON.stringify(typeItem.options.length)}]`;
        break;
      }

      const isMinimumInclusive = typeItem.minimumInclusive != null;
      const isMaximumInclusive = typeItem.maximumInclusive != null;
      const minimumValue = typeItem.minimumInclusive ?? typeItem.minimumExclusive ?? -100000;
      const maximumValue = typeItem.maximumInclusive ?? typeItem.maximumExclusive ?? 100000;
      const precisionOffset = 1;
      const precisionRange = 1;

      yield `randomNumber(${JSON.stringify({
        isMinimumInclusive,
        isMaximumInclusive,
        minimumValue,
        maximumValue,
        precisionOffset,
        precisionRange,
      })})`;
      break;
    }

    case "number": {
      if (typeItem.options != null) {
        yield itt`([${joinIterable(
          typeItem.options.map((option) => JSON.stringify(option)),
          ", ",
        )}] as const)[nextSeed() % ${JSON.stringify(typeItem.options.length)}]`;
        break;
      }

      const isMinimumInclusive = typeItem.minimumInclusive != null;
      const isMaximumInclusive = typeItem.maximumInclusive != null;
      const minimumValue = typeItem.minimumInclusive ?? typeItem.minimumExclusive ?? -1000;
      const maximumValue = typeItem.maximumInclusive ?? typeItem.maximumExclusive ?? 1000;
      const precisionOffset = 100;
      const precisionRange = 900;

      yield `randomNumber(${JSON.stringify({
        isMinimumInclusive,
        isMaximumInclusive,
        minimumValue,
        maximumValue,
        precisionOffset,
        precisionRange,
      })})`;
      break;
    }

    case "string":
      if (typeItem.options != null) {
        yield itt`([${joinIterable(
          typeItem.options.map((option) => JSON.stringify(option)),
          ", ",
        )}] as const)[nextSeed() % ${JSON.stringify(typeItem.options.length)}]`;
        break;
      }

      const minimumLength = typeItem.minimumLength ?? 3;
      const maximumLength = typeItem.maximumLength ?? 15;
      const lengthOffset = minimumLength;
      const lengthRange = maximumLength - minimumLength;
      const chars = "abcdefghijklmnopqrstuvwxyz";

      yield `randomString(${JSON.stringify({
        lengthOffset,
        lengthRange,
        chars,
      })})`;
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
