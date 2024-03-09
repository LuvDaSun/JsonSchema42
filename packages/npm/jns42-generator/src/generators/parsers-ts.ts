import * as models from "../models/index.js";
import {
  isAliasSchemaModel,
  isOneOfSchemaModel,
  isSingleTypeSchemaModel,
} from "../models/index.js";
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

  const { names, typesArena } = specification;

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

  for (const [itemKey, item] of [...typesArena].map((item, key) => [key, item] as const)) {
    const { id: nodeId } = item;

    if (nodeId == null) {
      continue;
    }

    const functionName = toCamel("parse", names[nodeId]);
    const definition = generateParserDefinition(itemKey, "value");

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

  function* generateParserReference(
    itemKey: number,
    valueExpression: string,
  ): Iterable<NestedText> {
    const item = typesArena.getItem(itemKey);
    if (item.id == null) {
      yield itt`(${generateParserDefinition(itemKey, valueExpression)})`;
    } else {
      const functionName = toCamel("parse", names[item.id]);
      yield itt`${functionName}(${valueExpression}, configuration)`;
    }
  }

  function* generateParserDefinition(itemKey: number, valueExpression: string) {
    const item = typesArena.getItem(itemKey);

    if (isAliasSchemaModel(item)) {
      yield generateParserReference(item.reference, valueExpression);
      return;
    }

    if (isOneOfSchemaModel(item) && item.oneOf.length > 0) {
      yield itt`
        ${joinIterable(
          item.oneOf.map(
            (element) => itt`
              ${generateParserReference(element, valueExpression)}
            `,
          ),
          " ??\n",
        )}
      `;
      return;
    }

    if (isSingleTypeSchemaModel(item) && item.types != null) {
      switch (item.types[0]) {
        case "any":
          yield valueExpression;
          return;

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
          return;

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
          return;

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
          return;

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
          return;

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
          return;

        case "array": {
          yield itt`
            Array.isArray(${valueExpression}) ?
              ${valueExpression}.map((value, index) => {
                switch(index) {
                  ${generateCaseClauses()}
                }
              }) :
              undefined
          `;
          return;

          function* generateCaseClauses() {
            if (item.tupleItems != null) {
              for (let elementIndex = 0; elementIndex < item.tupleItems.length; elementIndex++) {
                const elementKey = item.tupleItems[elementIndex];

                yield itt`
                  case ${JSON.stringify(elementIndex)}:
                    return ${generateParserReference(elementKey, `value`)}
                `;
              }
            }

            yield itt`
              default:
                ${generateDefaultClauseContent()}
            `;
          }

          function* generateDefaultClauseContent() {
            if (item.arrayItems != null) {
              yield itt`
                return ${generateParserReference(item.arrayItems, `value`)}
              `;
              return;
            }

            yield itt`
              return value;
            `;
          }
        }

        case "map": {
          yield itt`
            (typeof ${valueExpression} === "object" && ${valueExpression} !== null && !Array.isArray(${valueExpression})) ?
              Object.fromEntries(
                Object.entries(${valueExpression}).map(([name, value]) => {
                  switch(name) {
                    ${generateCaseClauses()}
                  }
                })
              ) :
              undefined
          `;
          return;

          function* generateCaseClauses() {
            if (item.objectProperties != null) {
              for (const name in item.objectProperties) {
                const elementKey = item.objectProperties[name];

                yield itt`
                  case ${JSON.stringify(name)}:
                    return [
                      name,
                      ${generateParserReference(elementKey, `value`)},
                    ]
                `;
              }
            }

            yield itt`
              default:
                ${generateDefaultClauseContent()}
            `;
          }

          function* generateDefaultClauseContent() {
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
                return [
                  name,
                  (${joinIterable(
                    elementKeys.map((elementKey) => generateParserReference(elementKey, `value`)),
                    " ??\n",
                  )}),
                  ]
              `;
              return;
            }

            yield itt`
              return value;
            `;
          }
        }
      }
    }

    yield valueExpression;
  }
}
