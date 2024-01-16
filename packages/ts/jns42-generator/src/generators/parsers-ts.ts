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

  yield itt`
    import * as types from "./types.js";
  `;

  yield itt`
    export interface ParserGeneratorOptions {
      trueStringValues?: string[];
      falseStringValues?: string[];
    }
    const defaultParserGeneratorOptions = {
      trueStringValues: ["", "true", "yes", "on", "1"],
      falseStringValues: ["false", "no", "off", "0"],
    }

  `;

  for (const [typeKey, item] of Object.entries(types)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const functionName = toCamel("parse", names[nodeId]);
    const definition = generateParserDefinition(specification, typeKey, "value");

    yield itt`
      ${generateJsDocComments(item)}
      export function ${functionName}(value: unknown, options: ParserGeneratorOptions = {}): unknown {
        const configuration = {
          ...defaultParserGeneratorOptions,
          ...options,
        };

        return (${definition});
      }
    `;
  }
}

function* generateParserReference(
  specification: models.Specification,
  typeKey: string,
  valueExpression: string,
): Iterable<NestedText> {
  const { names, types } = specification;
  const typeItem = types[typeKey];
  if (typeItem.id == null) {
    yield itt`(${generateParserDefinition(specification, typeKey, valueExpression)})`;
  } else {
    const functionName = toCamel("parse", names[typeItem.id]);
    yield itt`${functionName}(${valueExpression}, configuration)`;
  }
}

function* generateParserDefinition(
  specification: models.Specification,
  typeKey: string,
  valueExpression: string,
) {
  const { names, types } = specification;
  const typeItem = types[typeKey];

  switch (typeItem.type) {
    case "unknown":
      yield valueExpression;
      break;

    case "never":
      yield "undefined";
      break;

    case "any":
      yield valueExpression;
      break;

    case "null":
      yield `
        ((value: unknown) => {
          if(value == null) {
            return null;
          }
          
          if(Array.isArray(value)) {
            switch(value.length) {
              case 0:
                return null;
              case 1:
                [value] = value              
                break;
              default:
                return undefined;
            }
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
        })(${valueExpression})
      `;
      break;

    case "boolean":
      yield `
        ((value: unknown) => {
          if(value == null) {
            return false;
          }

          if(Array.isArray(value)) {
            switch(value.length) {
              case 0:
                return false;
              case 1:
                [value] = value              
                break;
              default:
                return undefined;
            }
          }

          switch(typeof value) {
            case "string":
              value = value.trim();
              for(const trueStringValue of configuration.trueStringValues) {
                if(value === trueStringValue) {
                  return true;
                }
              }
              for(const falseStringValue of configuration.falseStringValues) {
                if(value === falseStringValue) {
                  return false;
                }
              }
              return undefined;
            case "number":
              return Boolean(value);
            case "boolean":
              return value;
          }
          return undefined;
          })(${valueExpression})
      `;
      break;

    case "integer":
      yield `
        ((value: unknown) => {
          if(Array.isArray(value)) {
            switch(value.length) {
              case 1:
                [value] = value              
                break;
              default:
                return undefined;
            }
          }

          switch(typeof value) {
            case "string":
              return Number(value);
            case "number":
              return value;
            case "boolean":
              return value ? 1 : 0;
          }
          return undefined;
        })(${valueExpression})
      `;
      break;

    case "number":
      yield `
        ((value: unknown) => {
          if(Array.isArray(value)) {
            switch(value.length) {
              case 1:
                [value] = value              
                break;
              default:
                return undefined;
            }
          }
    
          switch(typeof value) {
            case "string":
              return Number(value);
            case "number":
              return value;
            case "boolean":
              return value ? 1 : 0;
          }
          return undefined;
        })(${valueExpression})
      `;
      break;

    case "string":
      yield `
        ((value: unknown) => {
          if(Array.isArray(value)) {
            switch(value.length) {
              case 1:
                [value] = value              
                break;
              default:
                return undefined;
            }
          }

          switch(typeof value) {
            case "string":
              return value;
            case "number":
            case "boolean":
              return String(value);
            default:
              return undefined;
          }
        })(${valueExpression})
      `;
      break;

    case "tuple": {
      yield itt`
        Array.isArray(${valueExpression}) ?
          [
            ${typeItem.elements.map(
              (element, index) => itt`
                ${generateParserReference(
                  specification,
                  element,
                  `${valueExpression}[${JSON.stringify(index)}]`,
                )},
              `,
            )}
          ] :
          undefined
      `;
      break;
    }

    case "array": {
      const { element } = typeItem;
      yield itt`
        Array.isArray(${valueExpression}) ?
          ${valueExpression}.map(value => ${generateParserReference(
            specification,
            element,
            "value",
          )}) :
            ${valueExpression} == null ?
            undefined :
            [${generateParserReference(specification, element, valueExpression)}]
      `;
      break;
    }

    case "object": {
      yield itt`
        (typeof ${valueExpression} === "object" && ${valueExpression} !== null && !Array.isArray(${valueExpression})) ?
          {
            ${Object.entries(typeItem.properties).map(
              ([name, { required, element }]) => itt`
                ${JSON.stringify(name)}: ${generateParserReference(
                  specification,
                  element,
                  `${valueExpression}[${JSON.stringify(name)} as keyof typeof ${valueExpression}]`,
                )},
              `,
            )}
          } :
          undefined
      `;
      break;
    }

    case "map": {
      const { name, element } = typeItem;
      yield itt`
        (typeof ${valueExpression} === "object" && ${valueExpression} !== null && !Array.isArray(${valueExpression})) ?
          Object.fromEntries(
            Object.entries(${valueExpression}).map(([name, value]) => [
              ${generateParserReference(specification, name, "name")},
              ${generateParserReference(specification, element, "value")},
            ])
          ) :
          undefined
      `;
      break;
    }

    case "union": {
      yield joinIterable(
        typeItem.elements.map(
          (element) => itt`${generateParserReference(specification, element, "value")}`,
        ),
        " ?? ",
      );
      break;
    }

    case "alias": {
      yield generateParserReference(specification, typeItem.target, "value");
      break;
    }
  }
}
