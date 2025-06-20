import * as core from "@jns42/core";
import assert from "node:assert";
import * as models from "../models.js";
import {
  NestedText,
  generateJsDocComments,
  itt,
  joinIterable,
  readPackageInfo,
} from "../utilities.js";

export function* generateMocksTsCode(specification: models.Specification) {
  const packageInfo = readPackageInfo();

  yield core.banner("//", `v${packageInfo.version}`);

  const { names, typeModels, isMockable } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  yield itt`
    let depthCounter = 0;

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
      maximumDepth: 3,
      numberPrecision: 1000,
      stringCharacters: "abcdefghijklmnopqrstuvwxyz",
      defaultMinimumValue: -1000,
      defaultMaximumValue: 1000,
      defaultMinimumItems: 1,
      defaultMaximumItems: 3,
      defaultMinimumProperties: 1,
      defaultMaximumProperties: 3,
      defaultMinimumStringLength: 5,
      defaultMaximumStringLength: 20,
    }
  `;

  for (const [itemKey, item] of typeModels) {
    if (!isMockable(itemKey)) {
      continue;
    }

    const name = names.getName(itemKey);
    if (name == null) {
      continue;
    }

    const definition = generateMockDefinition(itemKey);

    yield itt`
      ${generateJsDocComments(item)}
      export function mock${name.toPascalCase()}(
        options: MockGeneratorOptions = {},
      ): types.${name.toPascalCase()} {
        const configuration = {
          ...defaultMockGeneratorOptions,
          ...options,
        };
        try {
          depthCounter ++;
          
          return (${definition}) as types.${name.toPascalCase()};
        }
        finally {
          depthCounter --;
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
      const a = 25214903917;
      const b = 11;
  
      seed = (a * seed + b) % p;

      return seed;
    }
  `;

  function* generateMockReference(itemKey: number): Iterable<NestedText> {
    const item = typeModels.get(itemKey);
    assert(item != null);
    assert(isMockable(itemKey));

    const name = names.getName(itemKey);
    if (name == null) {
      yield itt`(${generateMockDefinition(itemKey)})`;
    } else {
      yield itt`mock${name.toPascalCase()}()`;
    }
  }

  function* generateMockDefinition(itemKey: number): Iterable<NestedText> {
    const item = typeModels.get(itemKey);
    assert(item != null);
    assert(isMockable(itemKey));

    if ("options" in item && item.options != null) {
      yield itt`
          (
            [
              ${joinIterable(
                (item.options as any[]).map((option) => JSON.stringify(option)),
                ", ",
              )}
            ] as const
          )[
            nextSeed() % ${JSON.stringify(item.options.length)}
          ]
        `;
      return;
    }

    switch (item.type) {
      case "unknown":
        yield "unknownValue";
        return;

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
          assert(item != null);
          assert(item.type == "array");

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

          if (item.arrayItems != null && isMockable(item.arrayItems)) {
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

      case "object": {
        yield itt`
            {
              ${generateInterfaceContent()}
            }
          `;

        return;

        function* generateInterfaceContent() {
          assert(item != null);
          assert(item.type == "object");

          let propertiesCount = 0;

          if (item.objectProperties != null || item.required != null) {
            const required = new Set(item.required);
            const objectProperties = item.objectProperties ?? {};
            const propertyNames = new Set([
              ...Object.keys(objectProperties),
              ...required,
            ] as string[]);
            propertiesCount = propertyNames.size;

            for (const name of propertyNames) {
              if ((objectProperties as Record<string, number>)[name] == null) {
                yield itt`
                    [${JSON.stringify(name)}]: anyValue,
                  `;
              } else {
                if (required.has(name)) {
                  yield itt`
                      [${JSON.stringify(name)}]: ${generateMockReference(objectProperties[name])},
                    `;
                } else {
                  if (!isMockable(objectProperties[name])) {
                    continue;
                  }

                  yield itt`
                      [${JSON.stringify(name)}]:
                        depthCounter < configuration.maximumDepth ?
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

            if (item.mapProperties != null && isMockable(item.mapProperties)) {
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

      case "union": {
        const unionMockableEntries = [...item.members]
          .map((itemKey) => {
            const item = typeModels.get(itemKey);
            assert(item != null);
            return [itemKey, item] as const;
          })
          .filter(([itemKey, item]) => isMockable(itemKey));

        yield itt`
          (() => {
            switch (
              (
                nextSeed() % ${JSON.stringify(unionMockableEntries.length)}
              ) as ${joinIterable(
                unionMockableEntries.map((entry, index) => JSON.stringify(index)),
                " | ",
              )}
            ) {
              ${unionMockableEntries.map(
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

      case "reference":
        yield generateMockReference(item.reference);
        return;
    }
  }
}
