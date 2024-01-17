import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  generateJsDocComments,
  itt,
  joinIterable,
  toPascal,
} from "../utils/index.js";

export function* generateTypesTsCode(specification: models.Specification) {
  yield banner;

  const { names, typeModels } = specification;

  for (const [typeKey, item] of Object.entries(typeModels)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const typeName = toPascal(names[nodeId]);
    const definition = generateTypeDefinition(specification, typeKey);

    yield itt`
      ${generateJsDocComments(item)}
      export type ${typeName} = (${definition});
    `;
  }
}

function* generateTypeReference(
  specification: models.Specification,
  typeKey: string,
): Iterable<NestedText> {
  const { names, typeModels } = specification;
  const typeItem = typeModels[typeKey];
  if (typeItem.id == null) {
    yield itt`(${generateTypeDefinition(specification, typeKey)})`;
  } else {
    const typeName = toPascal(names[typeItem.id]);
    yield typeName;
  }
}

function* generateTypeDefinition(specification: models.Specification, typeKey: string) {
  const { names, typeModels } = specification;
  const typeItem = typeModels[typeKey];

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

    case "boolean": {
      if (typeItem.options != null) {
        yield joinIterable(
          typeItem.options.map((option) => JSON.stringify(option)),
          " |\n",
        );
        break;
      }

      yield "boolean";
      break;
    }

    case "integer":
    case "number": {
      if (typeItem.options != null) {
        yield joinIterable(
          typeItem.options.map((option) => JSON.stringify(option)),
          " |\n",
        );
        break;
      }

      yield "number";
      break;
    }

    case "string": {
      if (typeItem.options != null) {
        yield joinIterable(
          typeItem.options.map((option) => JSON.stringify(option)),
          " |\n",
        );
        break;
      }

      yield "string";
      break;
    }

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

    case "union": {
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

    case "alias": {
      yield generateTypeReference(specification, typeItem.target);
      break;
    }
  }
}
