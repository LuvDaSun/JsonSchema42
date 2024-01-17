import { isAliasSchemaModel, isOneOfSchemaModel, isSingleTypeSchemaModel } from "jns42-optimizer";
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

export function* generateTypesTsCode(specification: models.Specification) {
  yield banner;

  const { names, typesArena } = specification;

  for (const [itemKey, item] of typesArena) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const definition = generateTypeDefinition(specification, itemKey);

    yield itt`
      ${generateJsDocComments(item)}
      export type ${typeName} = (${definition});
    `;
  }
}

function* generateTypeReference(
  specification: models.Specification,
  itemKey: number,
): Iterable<NestedText> {
  const { names, typesArena } = specification;
  const item = typesArena.getItem(itemKey);
  if (item.id == null) {
    yield itt`(${generateTypeDefinition(specification, itemKey)})`;
  } else {
    const typeName = toPascal(names[item.id]);
    yield typeName;
  }
}

function* generateTypeDefinition(specification: models.Specification, itemKey: number) {
  const { names, typesArena } = specification;
  const item = typesArena.getItem(itemKey);

  if (isAliasSchemaModel(item)) {
    yield generateTypeReference(specification, item.alias);
    return;
  }

  if (isOneOfSchemaModel(item) && item.oneOf.length > 0) {
    yield itt`
      ${joinIterable(
        item.oneOf.map(
          (element) => itt`
            ${generateTypeReference(specification, element)}
          `,
        ),
        " |\n",
      )}
    `;
    return;
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
                ${generateTypeReference(specification, elementKey)},
              `;
            }
          }

          if (item.arrayItems != null) {
            yield itt`
              ...(${generateTypeReference(specification, item.arrayItems)})[]
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
          if (item.objectProperties != null || item.required != null) {
            const required = new Set(item.required);
            const objectProperties = item.objectProperties ?? {};
            const propertyNames = new Set([...Object.keys(objectProperties), ...required]);

            for (const name of propertyNames) {
              if (objectProperties[name] == null) {
                yield itt`
                ${toCamel(name)}${required.has(name) ? "" : "?"}: any,
              `;
              } else {
                yield itt`
                ${toCamel(name)}${required.has(name) ? "" : "?"}: ${generateTypeReference(specification, objectProperties[name])},
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
              for (const elementKey of Object.values(item.patternProperties)) {
                elementKeys.push(elementKey);
              }
            }

            if (elementKeys.length > 0) {
              yield itt`
                [
                  name: ${item.propertyNames == null ? "string" : generateTypeReference(specification, item.propertyNames)}
                ]: ${joinIterable(
                  [...elementKeys, ...Object.values(item.objectProperties ?? {})].map(
                    (elementKey) => generateTypeReference(specification, elementKey),
                  ),
                  " |\n",
                )}
              `;
              return;
            }

            yield itt`
              [
                name: ${item.propertyNames == null ? "string" : generateTypeReference(specification, item.propertyNames)}
              ]: any
            `;
          }
        }
      }
    }
  }

  yield "unknown";
}
