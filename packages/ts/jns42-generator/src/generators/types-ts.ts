import {
  isAliasSchemaModel,
  isOneOfSchemaModel,
  isSingleTypeSchemaModel,
  isTypeSchemaModel,
} from "jns42-optimizer";
import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  generateJsDocComments,
  itt,
  joinIterable,
  toPascal,
} from "../utils/index.js";
import { PackageConfiguration } from "./package.js";

export function* generateTypesTsCode(
  specification: models.Specification,
  configuration: PackageConfiguration,
) {
  yield banner;

  const { names, typesArena } = specification;

  for (const [itemKey, item] of typesArena) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const definition = generateTypeDefinition(itemKey);

    yield itt`
      ${generateJsDocComments(item)}
      export type ${typeName} = (${definition});
    `;
  }

  function* generateTypeReference(itemKey: number): Iterable<NestedText> {
    const item = typesArena.getItem(itemKey);
    if (item.id == null) {
      yield itt`(${generateTypeDefinition(itemKey)})`;
    } else {
      const typeName = toPascal(names[item.id]);
      yield typeName;
    }
  }

  function* generateTypeDefinition(itemKey: number) {
    const item = typesArena.getItem(itemKey);

    if (isAliasSchemaModel(item)) {
      yield generateTypeReference(item.alias);
      return;
    }

    if (isOneOfSchemaModel(item) && item.oneOf.length > 0) {
      yield itt`
      ${joinIterable(
        item.oneOf.map(
          (element) => itt`
            ${generateTypeReference(element)}
          `,
        ),
        " |\n",
      )}
    `;
      return;
    }

    if (isTypeSchemaModel(item)) {
      if (item.options != null && item.options.length > 0) {
        yield joinIterable(
          item.options.map((option) => JSON.stringify(option)),
          " |\n",
        );
        return;
      }
    }

    if (isSingleTypeSchemaModel(item) && item.types != null) {
      switch (item.types[0]) {
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
              yield itt`
              ...any
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
            let undefinedProperty = false;
            const isObject = item.objectProperties != null || item.required != null;

            if (isObject) {
              const required = new Set(item.required);
              const objectProperties = item.objectProperties ?? {};
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

            if (!isObject || configuration.unionObjectAndMap) {
              const elementKeys = new Array<number>();
              if (item.mapProperties != null) {
                elementKeys.push(item.mapProperties);
              }

              if (item.patternProperties != null) {
                for (const elementKey of Object.values(item.patternProperties)) {
                  elementKeys.push(elementKey);
                }
              }

              if (elementKeys.length > 0) {
                const typeNames = elementKeys.map((elementKey) =>
                  generateTypeReference(elementKey),
                );

                if (undefinedProperty) {
                  typeNames.push("undefined");
                }

                yield itt`
                [
                  name: ${item.propertyNames == null ? "string" : generateTypeReference(item.propertyNames)}
                ]: ${joinIterable(typeNames, " |\n")}
              `;
                return;
              }

              yield itt`
              [
                name: ${item.propertyNames == null ? "string" : generateTypeReference(item.propertyNames)}
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
