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

export function* generateTypesTsCode(specification: models.Specification) {
  const packageInfo = readPackageInfo();

  yield core.banner("//", `v${packageInfo.version}`);

  const { names, typeModels } = specification;

  yield itt`
    declare const _tags: unique symbol;

    type _Wrap<T, N extends PropertyKey> = T extends
      | boolean
      | number
      | bigint
      | string
      | symbol
      | object
      ? T & {
          readonly [_tags]: { [K in N]: void };
        }
      : T;
  `;

  for (const [itemKey, item] of typeModels) {
    const name = names.getName(itemKey);
    if (name == null) {
      continue;
    }

    const definition = generateTypeDefinition(itemKey);

    yield itt`
      ${generateJsDocComments(item)}
      export type ${name.toPascalCase()} = _Wrap<(${definition}), ${JSON.stringify(name.toPascalCase())}>;
    `;
  }

  function* generateTypeReference(itemKey: number, forceInline = false): Iterable<NestedText> {
    const name = names.getName(itemKey);
    if (name == null || forceInline) {
      yield itt`(${generateTypeDefinition(itemKey)})`;
    } else {
      yield name.toPascalCase();
    }
  }

  function* generateTypeDefinition(itemKey: number) {
    const item = typeModels.get(itemKey);
    assert(item != null);

    if ("options" in item && item.options != null) {
      yield joinIterable(
        (item.options as any[]).map((option) => JSON.stringify(option)),
        " |\n",
      );
      return;
    }

    switch (item.type) {
      case "unknown":
        yield "unknown";
        return;

      case "never":
        yield "never";
        return;

      case "any":
        yield "unknown";
        return;

      case "null":
        yield "null";
        return;

      case "boolean":
        yield "boolean";
        return;

      case "integer":
      case "number":
        yield "number";
        return;

      case "string":
        yield "string";
        return;

      case "array": {
        yield itt`
          [
            ${generateArrayContent()}
          ]
        `;

        return;

        function* generateArrayContent() {
          assert(item != null);
          assert(item.type === "array");

          if (item.tupleItems != null) {
            for (const elementKey of item.tupleItems) {
              yield itt`
                ${generateTypeReference(elementKey)},
              `;
            }
          }

          if (item.arrayItems != null) {
            yield itt`
              ...(${generateTypeReference(item.arrayItems)})[]
            `;
          }

          if (item.tupleItems == null && item.arrayItems == null) {
            // TODO should be unknown, but that does not really fly
            yield itt`
                ...unknown[]
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
          assert(item.type === "object");

          let hasUndefinedProperty = false;
          let hasUnknownProperty = false;

          if (item.objectProperties != null || item.required != null) {
            const required = new Set(item.required);
            const objectProperties = item.objectProperties ?? {};
            const propertyNames = new Set([
              ...Object.keys(objectProperties),
              ...required,
            ] as string[]);

            for (const name of propertyNames) {
              if (!required.has(name)) {
                hasUndefinedProperty = true;
              }

              if (objectProperties[name] == null) {
                hasUnknownProperty = true;

                yield itt`
                    ${JSON.stringify(name)}${required.has(name) ? "" : "?"}: unknown,
                  `;
              } else {
                yield itt`
                    ${JSON.stringify(name)}${required.has(name) ? "" : "?"}: ${generateTypeReference(objectProperties[name])},
                  `;
              }
            }
          }

          {
            const elementKeys = new Array<number>();
            if (item.mapProperties != null) {
              elementKeys.push(item.mapProperties);
            }
            if (item.patternProperties != null) {
              for (const elementKey of Object.values(
                item.patternProperties as Record<string, number>,
              )) {
                elementKeys.push(elementKey);
              }
            }

            if (elementKeys.length > 0) {
              const typeReferences = [
                ...elementKeys,
                ...Object.values((item.objectProperties as Record<string, number>) ?? {}),
              ].map((elementKey) => generateTypeReference(elementKey));

              if (hasUnknownProperty) {
                typeReferences.push("unknown");
              }

              if (hasUndefinedProperty) {
                typeReferences.push("undefined");
              }

              yield itt`
                [
                  name: ${item.propertyNames == null ? "string" : generateTypeReference(item.propertyNames, true)}
                ]: ${joinIterable(typeReferences, " |\n")}
              `;
              return;
            }

            yield itt`
              [
                name: ${item.propertyNames == null ? "string" : generateTypeReference(item.propertyNames)}
              ]: unknown
            `;
          }
        }
      }

      case "reference":
        yield generateTypeReference(item.reference);
        return;

      case "union": {
        yield itt`
            ${joinIterable(
              [...item.members].map(
                (element) => itt`
                  ${generateTypeReference(element)}
                `,
              ),
              " |\n",
            )}
          `;
        return;
      }
    }
  }
}
