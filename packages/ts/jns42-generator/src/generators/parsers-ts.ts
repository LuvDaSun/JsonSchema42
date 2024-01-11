import * as models from "../models/index.js";
import {
  NestedText,
  banner,
  generateJsDocComments,
  itt,
  joinIterable,
  toCamel,
} from "../utils/index.js";

export function* generateParsersTsCode(specification: models.Specification) {
  yield banner;

  const { names, types } = specification;

  for (const [typeKey, item] of Object.entries(types)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const functionName = toCamel("parse", names[nodeId]);
    const definition = generateParserDefinition(specification, typeKey);

    yield itt`
      ${generateJsDocComments(item)}
      export function ${functionName}(value: unknown): unknown {
        ${definition}
      }
    `;
  }
}

function* generateParserReference(
  specification: models.Specification,
  typeKey: string,
): Iterable<NestedText> {
  const { names, types } = specification;
  const typeItem = types[typeKey];
  if (typeItem.id == null) {
    yield itt`((value: unknown) => {
      ${generateParserDefinition(specification, typeKey)}
    })`;
  } else {
    const functionName = toCamel("parse", names[typeItem.id]);
    yield functionName;
  }
}

function* generateParserDefinition(specification: models.Specification, typeKey: string) {
  const { names, types: typeA } = specification;
  const typeItem = typeA[typeKey];

  switch (typeItem.type) {
    case "unknown":
      yield "return value;";
      break;

    case "never":
      yield "return undefined;";
      break;

    case "any":
      yield "return value;";
      break;

    case "null":
      yield `
        if(value == null) {
          return null;
        }
        switch(typeof value) {
          case "string":
            if(value.trim() === "") {
              return null;
            }
            break;
          case "number":
            return Boolean(value);
          case "boolean":
            return value;
        }
        return undefined;
      `;
      break;

    case "boolean":
      yield `
        if(value == null) {
          return false;
        }
        switch(typeof value) {
          case "string":
            switch(value.trim()) {
              case "":
              case "no":
              case "off":
              case "false":
              case "0":
                 return false;
              default:
                  return true;            
            }
          case "number":
            return Boolean(value);
          case "boolean":
            return value;
        }
        return undefined;
      `;
      break;

    case "integer":
      yield `
        switch(typeof value) {
          case "string":
            return Number(value);
          case "number":
            return value;
          case "boolean":
            return value ? 1 : 0;
        }
        return undefined;
      `;
      break;

    case "number":
      yield `
        switch(typeof value) {
          case "string":
            return Number(value);
          case "number":
            return value;
          case "boolean":
            return value ? 1 : 0;
        }
        return undefined;
      `;
      break;

    case "string":
      yield `
        switch(typeof value) {
          case "string":
            return value;
          case "number":
          case "boolean":
            return String(value);
          default:
            return undefined;
        }
      `;
      break;

    case "tuple": {
      yield itt`
        return Array.isArray(value) ?
          [
            ${typeItem.elements.map(
              (element, index) => itt`
                ${generateParserReference(specification, element)}(value[${JSON.stringify(index)}]),
              `,
            )}
          ] :
          undefined;
      `;
      break;
    }

    case "array": {
      const { element } = typeItem;
      yield itt`
        return Array.isArray(value) ?
          value.map(value => ${generateParserReference(specification, element)}(value)) :
          undefined;
        `;
      break;
    }

    case "object": {
      yield itt`
        return (typeof value === "object" && value !== null && !Array.isArray(value)) ?
          {
            ${Object.entries(typeItem.properties).map(
              ([name, { required, element }]) => itt`
                ${JSON.stringify(name)}: ${generateParserReference(
                  specification,
                  element,
                )}(value[${JSON.stringify(name)} as keyof typeof value]),
              `,
            )}
          } :
          undefined;
      `;
      break;
    }

    case "map": {
      const { name, element } = typeItem;
      yield itt`
        return (typeof value === "object" && value !== null && !Array.isArray(value)) ?
          Object.fromEntries(
            Object.entries(value).map(([name, value]) => [
              ${generateParserReference(specification, name)}(name),
              ${generateParserReference(specification, element)}(value),
            ])
          ) :
          undefined;
      `;
      break;
    }

    case "union": {
      yield itt`return ${joinIterable(
        typeItem.elements.map(
          (element) => itt`${generateParserReference(specification, element)}(value)`,
        ),
        " ?? ",
      )};`;
      break;
    }

    case "alias": {
      yield itt`return ${generateParserReference(specification, typeItem.target)}(value);`;
      break;
    }
  }
}
