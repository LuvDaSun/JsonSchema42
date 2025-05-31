import * as core from "@jns42/core";
import * as models from "../models.js";
import { NestedText, generateJsDocComments, itt, joinIterable, packageInfo } from "../utilities.js";

export function* generateParsersTsCode(specification: models.Specification) {
  yield core.instance.utilities.banner("//", `v${packageInfo.version}`);

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

  for (let itemKey = 0; itemKey < typesArena.count(); itemKey++) {
    const item = typesArena.getItem(itemKey);

    const name = names.getName(itemKey);
    if (name == null) {
      continue;
    }

    const definition = generateParserDefinition(itemKey, "value");

    yield itt`
      ${generateJsDocComments(item)}
      export function parse${name.toPascalCase()}(value: unknown, options: ParserGeneratorOptions = {}): unknown {
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
    const name = names.getName(itemKey);
    if (name == null) {
      yield itt`(${generateParserDefinition(itemKey, valueExpression)})`;
    } else {
      yield itt`parse${name.toPascalCase()}(${valueExpression}, configuration)`;
    }
  }

  function* generateParserDefinition(itemKey: number, valueExpression: string) {
    const item = typesArena.getItem(itemKey);

    if (item.reference != null) {
      yield generateParserReference(item.reference, valueExpression);
      return;
    }

    if (item.oneOf != null && item.oneOf.length > 0) {
      yield itt`
        ${joinIterable(
          [...item.oneOf].map(
            (element) => itt`
              ${generateParserReference(element, valueExpression)}
            `,
          ),
          " ??\n",
        )}
      `;
      return;
    }

    if (item.types != null && item.types.length === 1) {
      switch (item.types[0] as core.SchemaType) {
        case core.SchemaType.Any:
          yield valueExpression;
          return;

        case core.SchemaType.Null:
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

        case core.SchemaType.Boolean:
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

        case core.SchemaType.Integer:
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

        case core.SchemaType.Number:
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

        case core.SchemaType.String:
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

        case core.SchemaType.Array: {
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

        case core.SchemaType.Object: {
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
              for (const elementKey of Object.values(
                item.patternProperties as Record<string, number>,
              )) {
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
              return [name, value];
            `;
          }
        }
      }
    }

    yield valueExpression;
  }
}
