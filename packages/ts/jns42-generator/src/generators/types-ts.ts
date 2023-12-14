import * as models from "../models/index.js";
import { NestedText, banner, itt, joinIterable, toPascal } from "../utils/index.js";

export function* generateTypesTsCode(specification: models.Specification) {
  yield banner;

  const { names, types } = specification;

  for (const [typeKey, item] of Object.entries(types)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const definition = generateTypeDefinition(specification, typeKey);

    const node = specification.nodes[nodeId];
    const comments = [
      node.title ?? "",
      node.description ?? "",
      node.deprecated ? "@deprecated" : "",
    ]
      .map((line) => line.replaceAll("*/", "*\\/"))
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    yield itt`
      // ${nodeId}
    `;

    if (comments.length > 0) {
      yield itt`
        /**
        ${comments}
        */
      `;
    }
    yield itt`
      export type ${typeName} = (${definition});
    `;
  }
}

function* generateTypeReference(
  specification: models.Specification,
  typeKey: string,
): Iterable<NestedText> {
  const { names, types } = specification;
  const typeItem = types[typeKey];
  if (typeItem.id == null) {
    yield itt`(${generateTypeDefinition(specification, typeKey)})`;
  } else {
    const typeName = toPascal(names[typeItem.id]);
    yield typeName;
  }
}

function* generateTypeDefinition(specification: models.Specification, typeKey: string) {
  const { names, types } = specification;
  const typeItem = types[typeKey];

  switch (typeItem.type) {
    case "unknown":
      yield "unknown";
      break;

    case "never":
      yield "never";
      break;

    case "any":
      yield "any";
      break;

    case "null":
      yield "null";
      break;

    case "boolean":
      yield "boolean";
      break;

    case "integer":
    case "number":
      yield "number";
      break;

    case "string":
      yield "string";
      break;

    case "tuple": {
      yield itt`
        [
          ${typeItem.elements.map(
            (element) => itt`
              ${generateTypeReference(specification, element)},
            `,
          )}
        ]
      `;
      break;
    }

    case "array": {
      const { element } = typeItem;
      yield itt`
        ${generateTypeReference(specification, element)}[]
      `;
      break;
    }

    case "object": {
      yield itt`
        {
          ${Object.entries(typeItem.properties).map(([name, { required, element }]) =>
            required
              ? itt`
                ${JSON.stringify(name)}: ${generateTypeReference(specification, element)},
              `
              : itt`
                ${JSON.stringify(name)}?: ${generateTypeReference(specification, element)},
              `,
          )}
        }
      `;
      break;
    }

    case "map": {
      const { name, element } = typeItem;
      yield itt`
        {
          [name: ${generateTypeReference(specification, name)}]: ${generateTypeReference(
            specification,
            element,
          )}
        }
      `;
      break;
    }

    case "oneOf": {
      yield itt`
        ${joinIterable(
          typeItem.elements.map(
            (element) => itt`
              ${generateTypeReference(specification, element)}
            `,
          ),
          " | ",
        )}
      `;
      break;
    }
  }
}
