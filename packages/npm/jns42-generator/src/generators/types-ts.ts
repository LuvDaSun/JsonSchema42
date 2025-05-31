import core from "@jns42/core";
import * as models from "../models.js";
import { NestedText, generateJsDocComments, itt, joinIterable, packageInfo } from "../utilities.js";

export function* generateTypesTsCode(specification: models.Specification) {
  yield core.utilities.banner("//", `v${packageInfo.version}`);

  const { names, typesArena } = specification;

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

  for (let itemKey = 0; itemKey < typesArena.count(); itemKey++) {
    const item = typesArena.getItem(itemKey);

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
    const item = typesArena.getItem(itemKey);

    if (item.reference != null) {
      yield generateTypeReference(item.reference);
      return;
    }

    if (item.oneOf != null && item.oneOf.length > 0) {
      yield itt`
      ${joinIterable(
        [...item.oneOf].map(
          (element) => itt`
            ${generateTypeReference(element)}
          `,
        ),
        " |\n",
      )}
    `;
      return;
    }

    if (item.allOf != null && item.allOf.length > 0) {
      yield itt`
      ${joinIterable(
        [...item.allOf].map(
          (element) => itt`
            ${generateTypeReference(element)}
          `,
        ),
        " &\n",
      )}
    `;
      return;
    }

    if (item.options !== null) {
      if (item.options != null && item.options.length > 0) {
        yield joinIterable(
          (item.options as any[]).map((option) => JSON.stringify(option)),
          " |\n",
        );
        return;
      }
    }

    if (item.types != null && item.types.length === 1) {
      switch (item.types[0] as core.SchemaType) {
        case core.SchemaType.Never:
          yield "never";
          return;

        case core.SchemaType.Any:
          yield "unknown";
          return;

        case core.SchemaType.Null:
          yield "null";
          return;

        case core.SchemaType.Boolean:
          yield "boolean";
          return;

        case core.SchemaType.Integer:
        case core.SchemaType.Number:
          yield "number";
          return;

        case core.SchemaType.String:
          yield "string";
          return;

        case core.SchemaType.Array: {
          yield itt`
          [
            ${generateArrayContent()}
          ]
        `;

          return;

          function* generateArrayContent() {
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

        case core.SchemaType.Object: {
          yield itt`
          {
            ${generateInterfaceContent()}
          }
        `;

          return;

          function* generateInterfaceContent() {
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
      }
    }

    yield "unknown";
  }
}
