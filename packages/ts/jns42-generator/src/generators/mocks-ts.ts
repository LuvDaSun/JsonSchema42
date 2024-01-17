import { isAliasSchemaModel } from "jns42-optimizer";
import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  generateJsDocComments,
  itt,
  toCamel,
  toPascal,
} from "../utils/index.js";

export function* generateMocksTsCode(specification: models.Specification) {
  yield banner;

  const { names, typesArena } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  yield itt`
    const depthCounters: Record<string, number> = {};

    export const unknownValue: any = {};
    export const anyValue: any = {};
    export const neverValue: any = {};

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

  for (const [itemKey, item] of typesArena) {
    const { id: nodeId } = item;

    if (nodeId == null) {
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
  const { names, typesArena } = specification;
  const item = typesArena.getItem(itemKey);
  if (item.id == null) {
    yield itt`(${generateMockDefinition(specification, itemKey)})`;
  } else {
    const functionName = toCamel("mock", names[item.id]);
    yield itt`${functionName}()`;
  }
}

function* generateMockDefinition(
  specification: models.Specification,
  itemKey: number,
): Iterable<NestedText> {
  const { validatorsArena } = specification;
  const item = validatorsArena.getItem(itemKey);

  if (isAliasSchemaModel(item)) {
    yield generateMockReference(specification, item.alias);
    return;
  }

  yield itt`unknownValue`;
}
