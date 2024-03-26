import { toCamelCase, toPascalCase } from "@jns42/core";
import * as models from "../models/index.js";
import { NestedText, banner, generateJsDocComments, itt, joinIterable } from "../utils/index.js";

export function* generateMocksTsCode(specification: models.Specification) {
  yield banner;

  const { names, typesArena } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  yield itt`
    const depthCounters: Record<string, number> = {};

    export const unknownValue: any = Symbol();
    export const anyValue: any = Symbol();
    export const neverValue: any = Symbol();

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

  for (const [itemKey, item] of [...typesArena].map((item, key) => [key, item] as const)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    if (!typesArena.isMockable(itemKey)) {
      continue;
    }

    const typeIdentifier = names.toSnakeCase(itemKey);
    const typeName = toPascalCase(typeIdentifier);
    const functionName = toCamelCase(`mock ${typeIdentifier}`);
    const definition = generateMockDefinition(itemKey);

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

  function* generateMockReference(itemKey: number): Iterable<NestedText> {
    if (!typesArena.isMockable(itemKey)) {
      throw new TypeError("cannot mock non-mockable type");
    }

    const item = typesArena.getItem(itemKey);
    const typeIdentifier = names.toSnakeCase(itemKey);
    if (item.id == null) {
      yield itt`(${generateMockDefinition(itemKey)})`;
    } else {
      const functionName = toCamelCase(`mock ${typeIdentifier}`);
      yield itt`${functionName}()`;
    }
  }

  function* generateMockDefinition(itemKey: number): Iterable<NestedText> {
    const item = typesArena.getItem(itemKey);

    if (item.reference != null) {
      yield generateMockReference(item.reference);
      return;
    }

    if (item.oneOf != null && item.oneOf.length > 0) {
      const oneOfMockableEntries = item.oneOf
        .filter((key) => typesArena.isMockable(key))
        .map((key) => [key, typesArena.getItem(key)] as const);

      yield itt`
        (() => {
          switch (
            (
              nextSeed() % ${JSON.stringify(oneOfMockableEntries.length)}
            ) as ${joinIterable(
              oneOfMockableEntries.map((entry, index) => JSON.stringify(index)),
              " | ",
            )}
          ) {
            ${oneOfMockableEntries.map(
              (entry, index) => itt`
                case ${JSON.stringify(index)}:
                  return (${generateMockReference(entry[0])});
              `,
            )}              
          }
        })()
      `;
      return;
    }

    if (item.options != null && item.options.length > 0) {
      yield itt`
          (
            [
              ${joinIterable(
                item.options.map((option) => JSON.stringify(option)),
                ", ",
              )}
            ] as const
          )[
            nextSeed() % ${JSON.stringify(item.options.length)}
          ]
        `;
      return;
    }

    if (item.types != null && item.types.length == 1) {
      switch (item.types[0]) {
        case "never":
          yield "neverValue";
          return;

        case "any":
          yield "anyValue";
          return;

        case "null":
          yield JSON.stringify(null);
          return;

        case "boolean":
          yield `Boolean(nextSeed() % 2)`;
          return;

        case "integer": {
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
          return;
        }

        case "number": {
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
            (
              ${minimumValueInclusiveExpression} + 
              nextSeed() % (
                ${maximumValueInclusiveExpression} - ${minimumValueInclusiveExpression} + 1
              ) / configuration.numberPrecision
            )
          `;
          return;
        }

        case "string": {
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
              ${minimumStringLengthExpression} +
              nextSeed() % (
                ${maximumStringLengthExpression} - ${minimumStringLengthExpression} + 1
              )
            ).
              fill(undefined).
              map(() => configuration.stringCharacters[nextSeed() % configuration.stringCharacters.length]).
              join("")
          `;
          return;
        }

        case "array": {
          yield itt`
            [
              ${generateInterfaceContent()}
            ]
          `;

          return;

          function* generateInterfaceContent() {
            const minimumItemsExpression =
              item.minimumItems == null
                ? "configuration.defaultMinimumItems"
                : JSON.stringify(item.minimumItems);
            const maximumItemsExpression =
              item.maximumItems == null
                ? "configuration.defaultMaximumItems"
                : JSON.stringify(item.maximumItems);
            const tupleItemsLength = item.tupleItems?.length ?? 0;

            if (item.tupleItems != null) {
              for (const elementKey of item.tupleItems) {
                yield itt`
                  ${generateMockReference(elementKey)},
                `;
              }
            }

            if (item.arrayItems != null && typesArena.isMockable(item.arrayItems)) {
              yield itt`
              ...new Array(
                Math.max(0, ${minimumItemsExpression} - ${JSON.stringify(tupleItemsLength)}) +
                nextSeed() % (
                  Math.max(0, ${maximumItemsExpression} - ${JSON.stringify(tupleItemsLength)}) -
                  Math.max(0, ${minimumItemsExpression} - ${JSON.stringify(tupleItemsLength)}) +
                  1
                )
              )
                .fill(undefined)
                .map(() => ${generateMockReference(item.arrayItems)})
            `;
            }
          }
        }

        case "map": {
          yield itt`
            {
              ${generateInterfaceContent()}
            }
          `;

          return;

          function* generateInterfaceContent() {
            let propertiesCount = 0;

            if (item.objectProperties != null || item.required != null) {
              const required = new Set(item.required);
              const objectProperties = item.objectProperties ?? {};
              const propertyNames = new Set([...Object.keys(objectProperties), ...required]);
              propertiesCount = propertyNames.size;

              for (const name of propertyNames) {
                if (objectProperties[name] == null) {
                  yield itt`
                    [${JSON.stringify(name)}]: anyValue,
                  `;
                } else {
                  if (required.has(name)) {
                    yield itt`
                      [${JSON.stringify(name)}]: ${generateMockReference(objectProperties[name])},
                    `;
                  } else {
                    if (!typesArena.isMockable(objectProperties[name])) {
                      continue;
                    }

                    yield itt`
                      [${JSON.stringify(name)}]:
                        (depthCounters[${JSON.stringify(objectProperties[name])}] ?? 0) < configuration.maximumDepth ?
                        ${generateMockReference(objectProperties[name])} :
                        undefined,
                    `;
                  }
                }
              }
            }

            {
              const minimumPropertiesExpression =
                item.minimumProperties == null
                  ? "configuration.defaultMinimumProperties"
                  : JSON.stringify(item.minimumProperties);
              const maximumPropertiesExpression =
                item.maximumProperties == null
                  ? "configuration.defaultMaximumProperties"
                  : JSON.stringify(item.maximumProperties);

              if (item.mapProperties != null && typesArena.isMockable(item.mapProperties)) {
                yield itt`
                  ...Object.fromEntries(
                    new Array(
                      Math.max(0, ${minimumPropertiesExpression} - ${JSON.stringify(propertiesCount)}) + 
                      nextSeed() % (
                        Math.max(0, ${maximumPropertiesExpression} - ${JSON.stringify(propertiesCount)}) -
                        Math.max(0, ${minimumPropertiesExpression} - ${JSON.stringify(propertiesCount)}) +
                        1
                      )
                    )
                    .fill(undefined)
                    .map(() => [
                      ${
                        item.propertyNames == null
                          ? itt`
                            new Array(
                              configuration.defaultMinimumStringLength +
                              nextSeed() % (
                                configuration.defaultMaximumStringLength - configuration.defaultMinimumStringLength + 1
                              )
                            ).
                              fill(undefined).
                              map(() => configuration.stringCharacters[nextSeed() % configuration.stringCharacters.length]).
                              join("")
                          `
                          : generateMockReference(item.propertyNames)
                      },
                      ${generateMockReference(item.mapProperties)},
                      ]
                    )
                  )
                `;
                return;
              }
            }
          }
        }
      }
    }

    yield itt`unknownValue`;
  }
}
