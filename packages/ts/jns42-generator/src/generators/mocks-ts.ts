import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  generateJsDocComments,
  itt,
  joinIterable,
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

    export interface MockGeneratorOptions {
      maximumDepth?: number;
      numberPrecision?: number;
      defaultMinimumValue?: number;
      defaultMaximumValue?: number;
    }
    const defaultMockGeneratorOptions = {
      maximumDepth: 1,
      numberPrecision: 1000,
      defaultMinimumValue: -1000,
      defaultMaximumValue: 1000,
    }
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
      export function ${functionName}(options: MockGeneratorOptions = {}): types.${typeName} {
        const configuration = {
          ...defaultMockGeneratorOptions,
          ...options,
        };
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
    function randomString({
      lengthOffset,
      lengthRange,
      chars,
    }: RandomStringArguments) {
      const length = lengthOffset + nextSeed() % (lengthRange + 1);
      let value = ""
      while(value.length < length) {
        value += chars[nextSeed() % chars.length];
      }
      return value;
    }

    interface RandomArrayArguments<T> {
      elementFactory: () => T;
      lengthOffset: number;
      lengthRange: number;
    }
    function *randomArray<T>({
      elementFactory,
      lengthOffset,
      lengthRange,
    }: RandomArrayArguments<T>): Iterable<T> {
      const length = lengthOffset + nextSeed() % (lengthRange + 1);
      for(let count = 0; count < length; count++) {
        yield elementFactory();
      }
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

      let minimumValue = Number.NEGATIVE_INFINITY;
      let isMinimumExclusive: boolean | undefined;
      if (typeItem.minimumInclusive != null && typeItem.minimumInclusive >= minimumValue) {
        minimumValue = typeItem.minimumInclusive;
        isMinimumExclusive = false;
      }
      if (typeItem.minimumExclusive != null && typeItem.minimumExclusive >= minimumValue) {
        minimumValue = typeItem.minimumExclusive;
        isMinimumExclusive = true;
      }
      const minimumValueInclusiveExpression =
        isMinimumExclusive == null
          ? "configuration.defaultMinimumValue"
          : isMinimumExclusive
            ? `(${JSON.stringify(minimumValue)} + 1)`
            : JSON.stringify(minimumValue);

      let maximumValue = Number.POSITIVE_INFINITY;
      let isMaximumExclusive: boolean | undefined;
      if (typeItem.maximumInclusive != null && typeItem.maximumInclusive <= maximumValue) {
        maximumValue = typeItem.maximumInclusive;
        isMaximumExclusive = false;
      }
      if (typeItem.maximumExclusive != null && typeItem.maximumExclusive <= maximumValue) {
        maximumValue = typeItem.maximumExclusive;
        isMaximumExclusive = true;
      }
      const maximumValueInclusiveExpression =
        isMaximumExclusive == null
          ? "configuration.defaultMaximumValue"
          : isMaximumExclusive
            ? `(${JSON.stringify(maximumValue)} - 1)`
            : JSON.stringify(maximumValue);

      yield `
        ${minimumValueInclusiveExpression} + nextSeed() % (${maximumValueInclusiveExpression} - ${minimumValueInclusiveExpression} + 1)
      `;
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

      let minimumValue = Number.NEGATIVE_INFINITY;
      let isMinimumExclusive: boolean | undefined;
      if (typeItem.minimumInclusive != null && typeItem.minimumInclusive >= minimumValue) {
        minimumValue = typeItem.minimumInclusive;
        isMinimumExclusive = false;
      }
      if (typeItem.minimumExclusive != null && typeItem.minimumExclusive >= minimumValue) {
        minimumValue = typeItem.minimumExclusive;
        isMinimumExclusive = true;
      }
      const minimumValueInclusiveExpression =
        isMinimumExclusive == null
          ? `configuration.defaultMinimumValue * configuration.numberPrecision`
          : isMinimumExclusive
            ? `(${JSON.stringify(minimumValue)} * configuration.numberPrecision + 1)`
            : `(${JSON.stringify(minimumValue)} * configuration.numberPrecision)`;

      let maximumValue = Number.POSITIVE_INFINITY;
      let isMaximumExclusive: boolean | undefined;
      if (typeItem.maximumInclusive != null && typeItem.maximumInclusive <= maximumValue) {
        maximumValue = typeItem.maximumInclusive;
        isMaximumExclusive = false;
      }
      if (typeItem.maximumExclusive != null && typeItem.maximumExclusive <= maximumValue) {
        maximumValue = typeItem.maximumExclusive;
        isMaximumExclusive = true;
      }
      const maximumValueInclusiveExpression =
        isMaximumExclusive == null
          ? `(configuration.defaultMaximumValue * configuration.numberPrecision)`
          : isMaximumExclusive
            ? `(${JSON.stringify(maximumValue)} * configuration.numberPrecision - 1)`
            : `(${JSON.stringify(maximumValue)} * configuration.numberPrecision)`;

      yield `
        (${minimumValueInclusiveExpression} + nextSeed() % (${maximumValueInclusiveExpression} - ${minimumValueInclusiveExpression} + 1) / configuration.numberPrecision)
      `;
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
      const lengthRange = maximumLength - minimumLength + 1;
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
      const minimumItems = typeItem.minimumItems ?? 0;
      const maximumItems = typeItem.maximumItems ?? 5;
      const itemsOffset = minimumItems;
      const itemsRange = maximumItems - minimumItems + 1;

      if (itemsOffset === 0) {
        yield itt`
          (depthCounters[${JSON.stringify(resolvedElement)}] ?? 0) < configuration.maximumDepth ?
            [...randomArray({
              lengthOffset: ${JSON.stringify(itemsOffset)},
              lengthRange: ${JSON.stringify(itemsRange)},
              elementFactory: () => ${generateMockReference(specification, element)},
            })] :
            []
        `;
      } else {
        yield itt`
          [...randomArray({
            lengthOffset: ${JSON.stringify(itemsOffset)},
            lengthRange: ${JSON.stringify(itemsRange)},
            elementFactory: () => ${generateMockReference(specification, element)},
          })]
        `;
      }

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
                  )}] ?? 0) < configuration.maximumDepth && Boolean(nextSeed() % 2) ? ${generateMockReference(
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

      const minimumProperties = typeItem.minimumProperties ?? 0;
      const maximumProperties = typeItem.maximumProperties ?? 5;
      const propertiesOffset = minimumProperties;
      const propertiesRange = maximumProperties - minimumProperties + 1;

      if (propertiesOffset === 0) {
        yield itt`
          (depthCounters[${JSON.stringify(resolvedElement)}] ?? 0) < configuration.maximumDepth ?
            Object.fromEntries(
              randomArray({
                lengthOffset: ${JSON.stringify(propertiesOffset)},
                lengthRange: ${JSON.stringify(propertiesRange)},
                elementFactory: () => [${generateMockReference(
                  specification,
                  name,
                )}, ${generateMockReference(specification, element)}],
              })
            ) :
            {}
        `;
      } else {
        yield itt`
          Object.fromEntries(
            randomArray({
              lengthOffset: ${JSON.stringify(propertiesOffset)},
              lengthRange: ${JSON.stringify(propertiesRange)},
              elementFactory: () => [${generateMockReference(
                specification,
                name,
              )}, ${generateMockReference(specification, element)}],
            })
          )
        `;
      }
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
