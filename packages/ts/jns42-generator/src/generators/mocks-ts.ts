import { isPrimitiveTypeSchemaModel } from "jns42-optimizer";
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

  const { names, validatorsArena } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  yield itt`
    const depthCounters: Record<string, number> = {};

    export const unknownValue = {};
    export const anyValue = {};
    export const neverValue = {};

    export interface MockGeneratorOptions {
      maximumDepth?: number;
      numberPrecision?: number;
      stringCharacters?: string;
      defaultMinimumValue?: number;
      defaultMaximumValue?: number;
      defaultMinimumItems?: number;
      defaultMaximumItems?: number;
      defaultMinimumProperties?: number;
      defaultMaximumProperties?: number;
      defaultMinimumStringLength?: number;
      defaultMaximumStringLength?: number;
    }
    const defaultMockGeneratorOptions = {
      maximumDepth: 1,
      numberPrecision: 1000,
      stringCharacters: "abcdefghijklmnopqrstuvwxyz",
      defaultMinimumValue: -1000,
      defaultMaximumValue: 1000,
      defaultMinimumItems: 1,
      defaultMaximumItems: 5,
      defaultMinimumProperties: 1,
      defaultMaximumProperties: 5,
      defaultMinimumStringLength: 5,
      defaultMaximumStringLength: 20,
    }
  `;

  for (const [itemKey, item] of validatorsArena) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    if (!isPrimitiveTypeSchemaModel(item)) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const functionName = toCamel("mock", names[nodeId]);
    const definition = generateMockDefinition(specification, itemKey);

    yield itt`
      ${generateJsDocComments(item)}
      export function ${functionName}(options: MockGeneratorOptions = {}): types.${typeName} {
        const configuration = {
          ...defaultMockGeneratorOptions,
          ...options,
        };
        depthCounters[${JSON.stringify(itemKey)}] ??= 0;

        try {
          depthCounters[${JSON.stringify(itemKey)}]++;
          
          return (${definition});
        }
        finally {
          depthCounters[${JSON.stringify(itemKey)}]--;
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
  `;
}

function* generateMockReference(
  specification: models.Specification,
  itemKey: number,
): Iterable<NestedText> {
  const { names, typeModels } = specification;
  const typeItem = typeModels[itemKey];
  if (typeItem.id == null) {
    yield itt`(${generateMockDefinition(specification, itemKey)})`;
  } else {
    const functionName = toCamel("mock", names[typeItem.id]);
    yield itt`${functionName}()`;
  }
}

function* generateMockDefinition(
  specification: models.Specification,
  itemKey: number,
): Iterable<NestedText> {
  const { validatorsArena } = specification;
  const item = validatorsArena.getItem(itemKey);

  if (isPrimitiveTypeSchemaModel(item)) {
    switch (item.types[0]) {
      case "null":
        yield JSON.stringify(null);
        break;

      case "boolean": {
        if (item.options != null) {
          yield itt`([${joinIterable(
            item.options.map((option) => JSON.stringify(option)),
            ", ",
          )}] as const)[nextSeed() % ${JSON.stringify(item.options.length)}]`;
          break;
        }
        yield `Boolean(nextSeed() % 2)`;
        break;
      }

      case "integer": {
        if (item.options != null) {
          yield itt`([${joinIterable(
            item.options.map((option) => JSON.stringify(option)),
            ", ",
          )}] as const)[nextSeed() % ${JSON.stringify(item.options.length)}]`;
          break;
        }

        let multipleOf = item.multipleOf ?? 1;

        let minimumValue = Number.NEGATIVE_INFINITY;
        let isMinimumExclusive: boolean | undefined;
        if (item.minimumInclusive != null && item.minimumInclusive >= minimumValue) {
          minimumValue = item.minimumInclusive;
          isMinimumExclusive = false;
        }
        if (item.minimumExclusive != null && item.minimumExclusive >= minimumValue) {
          minimumValue = item.minimumExclusive;
          isMinimumExclusive = true;
        }
        const minimumValueInclusiveExpression =
          isMinimumExclusive == null
            ? `Math.ceil(configuration.defaultMinimumValue / ${JSON.stringify(multipleOf)})`
            : isMinimumExclusive
              ? `(Math.ceil(${JSON.stringify(minimumValue)} / ${JSON.stringify(multipleOf)}) + 1)`
              : `Math.ceil(${JSON.stringify(minimumValue)} / ${JSON.stringify(multipleOf)})`;

        let maximumValue = Number.POSITIVE_INFINITY;
        let isMaximumExclusive: boolean | undefined;
        if (item.maximumInclusive != null && item.maximumInclusive <= maximumValue) {
          maximumValue = item.maximumInclusive;
          isMaximumExclusive = false;
        }
        if (item.maximumExclusive != null && item.maximumExclusive <= maximumValue) {
          maximumValue = item.maximumExclusive;
          isMaximumExclusive = true;
        }
        const maximumValueInclusiveExpression =
          isMaximumExclusive == null
            ? `Math.floor(configuration.defaultMaximumValue / ${JSON.stringify(multipleOf)})`
            : isMaximumExclusive
              ? `(Math.floor(${JSON.stringify(maximumValue)} / ${JSON.stringify(multipleOf)}) - 1)`
              : `Math.floor(${JSON.stringify(maximumValue)} / ${JSON.stringify(multipleOf)})`;

        yield `
            (${minimumValueInclusiveExpression} + nextSeed() % (${maximumValueInclusiveExpression} - ${minimumValueInclusiveExpression} + 1)) * ${multipleOf}
          `;
        break;
      }

      case "number": {
        if (item.options != null) {
          yield itt`([${joinIterable(
            item.options.map((option) => JSON.stringify(option)),
            ", ",
          )}] as const)[nextSeed() % ${JSON.stringify(item.options.length)}]`;
          break;
        }

        let minimumValue = Number.NEGATIVE_INFINITY;
        let isMinimumExclusive: boolean | undefined;
        if (item.minimumInclusive != null && item.minimumInclusive >= minimumValue) {
          minimumValue = item.minimumInclusive;
          isMinimumExclusive = false;
        }
        if (item.minimumExclusive != null && item.minimumExclusive >= minimumValue) {
          minimumValue = item.minimumExclusive;
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
        if (item.maximumInclusive != null && item.maximumInclusive <= maximumValue) {
          maximumValue = item.maximumInclusive;
          isMaximumExclusive = false;
        }
        if (item.maximumExclusive != null && item.maximumExclusive <= maximumValue) {
          maximumValue = item.maximumExclusive;
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
        if (item.options != null) {
          yield itt`([${joinIterable(
            item.options.map((option) => JSON.stringify(option)),
            ", ",
          )}] as const)[nextSeed() % ${JSON.stringify(item.options.length)}]`;
          break;
        }

        const minimumStringLengthExpression =
          item.minimumLength == null
            ? "configuration.defaultMinimumStringLength"
            : JSON.stringify(item.minimumLength);
        const maximumStringLengthExpression =
          item.maximumLength == null
            ? "configuration.defaultMaximumStringLength"
            : JSON.stringify(item.maximumLength);

        yield `
            new Array(
              ${minimumStringLengthExpression} + nextSeed() % (${maximumStringLengthExpression} - ${minimumStringLengthExpression} + 1)
            ).
              fill(undefined).
              map(() => configuration.stringCharacters[nextSeed() % configuration.stringCharacters.length]).
              join("")
          `;
        break;

      default:
        throw new TypeError(`type not supported`);
    }
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
