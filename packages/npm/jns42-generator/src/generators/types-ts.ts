import { banner } from "@jns42/core";
import * as models from "../models/index.js";
import {
  NestedText,
  generateJsDocComments,
  itt,
  joinIterable,
  packageInfo,
} from "../utils/index.js";

export function* generateTypesTsCode(specification: models.Specification) {
  yield banner("//", `v${packageInfo.version}`);

  const { names, typesArena } = specification;

  for (const [itemKey, item] of [...typesArena].map((item, key) => [key, item] as const)) {
    const { location: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    using typeName = names.getName(itemKey);
    const definition = generateTypeDefinition(itemKey);

    yield itt`
      ${generateJsDocComments(item)}
      export type ${typeName.toPascalCase()} = (${definition});
    `;
  }

  function* generateTypeReference(itemKey: number): Iterable<NestedText> {
    using item = typesArena.getItem(itemKey);
    if (item.location == null) {
      yield itt`(${generateTypeDefinition(itemKey)})`;
    } else {
      using typeName = names.getName(itemKey);
      yield typeName.toPascalCase();
    }
  }

  function* generateTypeDefinition(itemKey: number) {
    const item = typesArena.getItem(itemKey);
    const itemValue = item.toValue();

    if (itemValue.reference != null) {
      yield generateTypeReference(itemValue.reference);
      return;
    }

    if (itemValue.oneOf != null && itemValue.oneOf.length > 0) {
      yield itt`
      ${joinIterable(
        itemValue.oneOf.map(
          (element) => itt`
            ${generateTypeReference(element)}
          `,
        ),
        " |\n",
      )}
    `;
      return;
    }

    if (itemValue.allOf != null && itemValue.allOf.length > 0) {
      yield itt`
      ${joinIterable(
        itemValue.allOf.map(
          (element) => itt`
            ${generateTypeReference(element)}
          `,
        ),
        " &\n",
      )}
    `;
      return;
    }

    if (itemValue.options !== null) {
      if (itemValue.options != null && itemValue.options.length > 0) {
        yield joinIterable(
          itemValue.options.map((option) => JSON.stringify(option)),
          " |\n",
        );
        return;
      }
    }

    if (itemValue.types != null && itemValue.types.length === 1) {
      switch (itemValue.types[0]) {
        case "never":
          yield "never";
          return;

        case "any":
          yield "any";
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
            ${generateInterfaceContent()}
          ]
        `;

          return;

          function* generateInterfaceContent() {
            if (itemValue.tupleItems != null) {
              for (const elementKey of itemValue.tupleItems) {
                yield itt`
                ${generateTypeReference(elementKey)},
              `;
              }
            }

            if (itemValue.arrayItems != null) {
              yield itt`
              ...(${generateTypeReference(itemValue.arrayItems)})[]
            `;
            }

            if (itemValue.tupleItems == null && itemValue.arrayItems == null) {
              yield itt`
              ...any
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
            let undefinedProperty = false;

            if (itemValue.objectProperties != null || itemValue.required != null) {
              const required = new Set(itemValue.required);
              const objectProperties = itemValue.objectProperties ?? {};
              const propertyNames = new Set([...Object.keys(objectProperties), ...required]);

              for (const name of propertyNames) {
                undefinedProperty ||= !required.has(name);

                if (objectProperties[name] == null) {
                  yield itt`
                    ${JSON.stringify(name)}${required.has(name) ? "" : "?"}: any,
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
              if (itemValue.mapProperties != null) {
                elementKeys.push(itemValue.mapProperties);
              }
              if (itemValue.patternProperties != null) {
                for (const elementKey of Object.values(itemValue.patternProperties)) {
                  elementKeys.push(elementKey);
                }
              }

              if (elementKeys.length > 0) {
                const typeNames = [
                  ...elementKeys,
                  ...Object.values(itemValue.objectProperties ?? {}),
                ].map((elementKey) => generateTypeReference(elementKey));

                if (undefinedProperty) {
                  typeNames.push("undefined");
                }

                yield itt`
                [
                  name: ${itemValue.propertyNames == null ? "string" : generateTypeReference(itemValue.propertyNames)}
                ]: ${joinIterable(typeNames, " |\n")}
              `;
                return;
              }

              yield itt`
              [
                name: ${itemValue.propertyNames == null ? "string" : generateTypeReference(itemValue.propertyNames)}
              ]: any
            `;
            }
          }
        }
      }
    }

    yield "unknown";
  }
}
