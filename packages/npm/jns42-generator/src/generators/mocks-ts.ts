import { banner } from "@jns42/core";
import * as models from "../models/index.js";
import {
  NestedText,
  generateJsDocComments,
  isMockable,
  itt,
  joinIterable,
  packageInfo,
} from "../utils/index.js";

export function* generateMocksTsCode(specification: models.Specification) {
  yield banner("//", `v${packageInfo.version}`);

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
    const itemValue = item.toValue();
    const { location: nodeId } = itemValue;

    if (nodeId == null) {
      continue;
    }

    if (!isMockable(typesArena, itemKey)) {
      continue;
    }

    using typeName = names.getName(itemKey);
    const definition = generateMockDefinition(itemKey);

    yield itt`
      ${generateJsDocComments(item)}
      export function mock${typeName.toPascalCase()}(options: MockGeneratorOptions = {}): types.${typeName.toPascalCase()} {
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
    if (!isMockable(typesArena, itemKey)) {
      throw new TypeError("cannot mock non-mockable type");
    }

    using item = typesArena.getItem(itemKey);
    const itemValue = item.toValue();
    if (itemValue.location == null) {
      yield itt`(${generateMockDefinition(itemKey)})`;
    } else {
      using typeName = names.getName(itemKey);
      yield itt`mock${typeName.toPascalCase()}()`;
    }
  }

  function* generateMockDefinition(itemKey: number): Iterable<NestedText> {
    using item = typesArena.getItem(itemKey);
    const itemValue = item.toValue();

    if (itemValue.reference != null) {
      yield generateMockReference(itemValue.reference);
      return;
    }

    if (itemValue.oneOf != null && itemValue.oneOf.length > 0) {
      const oneOfMockableEntries = itemValue.oneOf
        .filter((key) => isMockable(typesArena, key))
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

    if (itemValue.options != null && itemValue.options.length > 0) {
      yield itt`
          (
            [
              ${joinIterable(
                itemValue.options.map((option) => JSON.stringify(option)),
                ", ",
              )}
            ] as const
          )[
            nextSeed() % ${JSON.stringify(itemValue.options.length)}
          ]
        `;
      return;
    }

    if (itemValue.types != null && itemValue.types.length == 1) {
      switch (itemValue.types[0]) {
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
          let multipleOf = itemValue.multipleOf ?? 1;

          let minimumValue = Number.NEGATIVE_INFINITY;
          let isMinimumExclusive: boolean | undefined;
          if (itemValue.minimumInclusive != null && itemValue.minimumInclusive >= minimumValue) {
            minimumValue = itemValue.minimumInclusive;
            isMinimumExclusive = false;
          }
          if (itemValue.minimumExclusive != null && itemValue.minimumExclusive >= minimumValue) {
            minimumValue = itemValue.minimumExclusive;
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
          if (itemValue.maximumInclusive != null && itemValue.maximumInclusive <= maximumValue) {
            maximumValue = itemValue.maximumInclusive;
            isMaximumExclusive = false;
          }
          if (itemValue.maximumExclusive != null && itemValue.maximumExclusive <= maximumValue) {
            maximumValue = itemValue.maximumExclusive;
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
          if (itemValue.minimumInclusive != null && itemValue.minimumInclusive >= minimumValue) {
            minimumValue = itemValue.minimumInclusive;
            isMinimumExclusive = false;
          }
          if (itemValue.minimumExclusive != null && itemValue.minimumExclusive >= minimumValue) {
            minimumValue = itemValue.minimumExclusive;
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
          if (itemValue.maximumInclusive != null && itemValue.maximumInclusive <= maximumValue) {
            maximumValue = itemValue.maximumInclusive;
            isMaximumExclusive = false;
          }
          if (itemValue.maximumExclusive != null && itemValue.maximumExclusive <= maximumValue) {
            maximumValue = itemValue.maximumExclusive;
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
            itemValue.minimumLength == null
              ? "configuration.defaultMinimumStringLength"
              : JSON.stringify(itemValue.minimumLength);
          const maximumStringLengthExpression =
            itemValue.maximumLength == null
              ? "configuration.defaultMaximumStringLength"
              : JSON.stringify(itemValue.maximumLength);

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
              itemValue.minimumItems == null
                ? "configuration.defaultMinimumItems"
                : JSON.stringify(itemValue.minimumItems);
            const maximumItemsExpression =
              itemValue.maximumItems == null
                ? "configuration.defaultMaximumItems"
                : JSON.stringify(itemValue.maximumItems);
            const tupleItemsLength = itemValue.tupleItems?.length ?? 0;

            if (itemValue.tupleItems != null) {
              for (const elementKey of itemValue.tupleItems) {
                yield itt`
                  ${generateMockReference(elementKey)},
                `;
              }
            }

            if (itemValue.arrayItems != null && isMockable(typesArena, itemValue.arrayItems)) {
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
                .map(() => ${generateMockReference(itemValue.arrayItems)})
            `;
            }
          }
        }

        case "object": {
          yield itt`
            {
              ${generateInterfaceContent()}
            }
          `;

          return;

          function* generateInterfaceContent() {
            let propertiesCount = 0;

            if (itemValue.objectProperties != null || itemValue.required != null) {
              const required = new Set(itemValue.required);
              const objectProperties = itemValue.objectProperties ?? {};
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
                    if (!isMockable(typesArena, objectProperties[name])) {
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
                itemValue.minimumProperties == null
                  ? "configuration.defaultMinimumProperties"
                  : JSON.stringify(itemValue.minimumProperties);
              const maximumPropertiesExpression =
                itemValue.maximumProperties == null
                  ? "configuration.defaultMaximumProperties"
                  : JSON.stringify(itemValue.maximumProperties);

              if (
                itemValue.mapProperties != null &&
                isMockable(typesArena, itemValue.mapProperties)
              ) {
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
                        itemValue.propertyNames == null
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
                          : generateMockReference(itemValue.propertyNames)
                      },
                      ${generateMockReference(itemValue.mapProperties)},
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
