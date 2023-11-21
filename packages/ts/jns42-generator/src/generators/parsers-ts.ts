import * as models from "../models/index.js";
import { banner, itt, joinIterable, mapIterable, toCamel, toPascal } from "../utils/index.js";

export function* generateParsersTsCode(specification: models.Specification) {
  yield banner;

  const { names, nodes } = specification;

  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const typeName = toPascal(names[nodeId]);

    {
      const functionName = toCamel("parse", names[nodeId]);
      const functionBody = generateParserBody(specification, nodeId);

      yield itt`
        export function ${functionName}(value: unknown): unknown {
          ${functionBody}
        }
      `;
    }

    for (const type of node.types) {
      const functionName = "_" + toCamel("parse", type, names[nodeId]);
      const functionBody = generateTypeParserBody(specification, nodeId, type);

      yield itt`
        function ${functionName}(value: unknown): unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.reference != null) {
      const functionName = "_" + toCamel("parse", "reference", names[nodeId]);
      const functionBody = generateReferenceCompoundParserStatements(
        specification,
        node.applicators.reference,
      );
      yield itt`
        function ${functionName}(value: unknown): unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.oneOf != null) {
      const functionName = "_" + toCamel("parse", "oneOf", names[nodeId]);
      const functionBody = generateOneOfCompoundParserStatements(
        specification,
        node.applicators.oneOf,
      );
      yield itt`
        function ${functionName}(value: unknown): unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.anyOf != null) {
      const functionName = "_" + toCamel("parse", "anyOf", names[nodeId]);
      const functionBody = generateAnyOfCompoundParserStatements(
        specification,
        node.applicators.anyOf,
      );
      yield itt`
        function ${functionName}(value: unknown): unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.allOf != null) {
      const functionName = "_" + toCamel("parse", "allOf", names[nodeId]);
      const functionBody = generateAllOfCompoundParserStatements(
        specification,
        node.applicators.allOf,
      );
      yield itt`
        function ${functionName}(value: unknown): unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.if != null) {
      const functionName = "_" + toCamel("parse", "if", names[nodeId]);
      const functionBody = generateIfCompoundParserStatements(
        specification,
        node.applicators.if,
        node.applicators.then,
        node.applicators.else,
      );
      yield itt`
        function ${functionName}(value: unknown): unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.not != null) {
      const functionName = "_" + toCamel("parse", "not", names[nodeId]);
      const functionBody = generateNotCompoundParserStatements(specification, node.applicators.not);
      yield itt`
        function ${functionName}(value: unknown): unknown {
          ${functionBody}
        }
      `;
    }
  }
}

function* generateParserBody(specification: models.Specification, nodeId: string) {
  const { names, nodes } = specification;
  const node = nodes[nodeId];

  const parserFunctionNames = new Array<string>();

  if (node.types.length > 0) {
    for (const type of node.types) {
      const functionName = "_" + toCamel("parse", type, names[nodeId]);
      parserFunctionNames.push(functionName);
    }
  }

  if (node.applicators.reference != null) {
    const functionName = "_" + toCamel("parse", "reference", names[nodeId]);
    parserFunctionNames.push(functionName);
  }

  if (node.applicators.oneOf != null) {
    const functionName = "_" + toCamel("parse", "oneOf", names[nodeId]);
    parserFunctionNames.push(functionName);
  }

  if (node.applicators.anyOf != null) {
    const functionName = "_" + toCamel("parse", "anyOf", names[nodeId]);
    parserFunctionNames.push(functionName);
  }

  if (node.applicators.allOf != null) {
    const functionName = "_" + toCamel("parse", "allOf", names[nodeId]);
    parserFunctionNames.push(functionName);
  }

  if (node.applicators.if != null) {
    const functionName = "_" + toCamel("parse", "if", names[nodeId]);
    parserFunctionNames.push(functionName);
  }

  if (node.applicators.not != null) {
    const functionName = "_" + toCamel("parse", "not", names[nodeId]);
    parserFunctionNames.push(functionName);
  }

  yield itt`
    return ${joinIterable(
      mapIterable(parserFunctionNames, (functionName) => `${functionName}(value)`),
      " ?? ",
    )};
  `;
}

function* generateTypeParserBody(
  specification: models.Specification,
  nodeId: string,
  type: string,
) {
  switch (type) {
    case "never":
      yield* generateNeverTypeParserStatements(specification, nodeId);
      break;

    case "any":
      yield* generateAnyTypeParserStatements(specification, nodeId);
      break;

    case "null":
      yield* generateNullTypeParserStatements(specification, nodeId);
      break;

    case "boolean":
      yield* generateBooleanTypeParserStatements(specification, nodeId);
      break;

    case "integer":
      yield* generateIntegerTypeParserStatements(specification, nodeId);
      break;

    case "number":
      yield* generateNumberTypeParserStatements(specification, nodeId);
      break;

    case "string":
      yield* generateStringTypeParserStatements(specification, nodeId);
      break;

    case "array":
      yield* generateArrayTypeParserStatements(specification, nodeId);
      break;

    case "map":
      yield* generateMapTypeParserStatements(specification, nodeId);
      break;

    default:
      throw new Error("type not supported");
  }
}

function* generateNeverTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
    return undefined;
  `;
}
function* generateAnyTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
    return value;
  `;
}
function* generateNullTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
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
}
function* generateBooleanTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
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
}
function* generateIntegerTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
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
}
function* generateNumberTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
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
}
function* generateStringTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
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
}
function* generateArrayTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
    if(Array.isArray(value)) {
      const result = new Array<unknown>(value.length);
      for(let elementIndex = 0; elementIndex < value.length; elementIndex++) {
        const elementValue = undefined;
        result[elementIndex] = elementValue;
      }
      return result;
    }
    return false
  `;
}
function* generateArrayTypeItemParserStatements(
  specification: models.Specification,
  nodeId: string,
) {
  yield itt`
    throw "TODO";
  `;
}
function* generateArrayTypeItemCaseClausesParserStatements(
  specification: models.Specification,
  nodeId: string,
) {
  yield itt`
    throw "TODO";
  `;
}
function* generateMapTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
    if(typeof value === "object" && value !== null && !Array.isArray(value)) {
      const result = {} as Record<string, unknown>;
      for(const propertyName in value) {
        const propertyValue = undefined;
        result[propertyName] = propertyValue;
      }
      return result;
    }
    return false
  `;
}
function* generateMapTypeItemParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
    throw "TODO";
  `;
}
function* generateMapTypeItemCaseClausesParserStatements(
  specification: models.Specification,
  nodeId: string,
) {
  yield itt`
    throw "TODO";
  `;
}

function* generateReferenceCompoundParserStatements(
  specification: models.Specification,
  reference: string,
) {
  const { names, nodes } = specification;

  const functionName = toCamel("parse", names[reference]);

  yield itt`
    return ${functionName}(value);
  `;
}
function* generateOneOfCompoundParserStatements(
  specification: models.Specification,
  oneOf: string[],
) {
  const { names, nodes } = specification;

  const parserFunctionNames = oneOf.map((nodeId) => toCamel("parse", names[nodeId]));

  yield itt`
    return ${joinIterable(
      mapIterable(parserFunctionNames, (functionName) => `${functionName}(value)`),
      " ?? ",
    )};
  `;
}
function* generateAnyOfCompoundParserStatements(
  specification: models.Specification,
  anyOf: string[],
) {
  const { names, nodes } = specification;

  const parserFunctionNames = anyOf.map((nodeId) => toCamel("parse", names[nodeId]));

  yield itt`
    return ${joinIterable(
      mapIterable(parserFunctionNames, (functionName) => `${functionName}(value)`),
      " ?? ",
    )};
  `;
}
function* generateAllOfCompoundParserStatements(
  specification: models.Specification,
  allOf: string[],
) {
  const { names, nodes } = specification;

  const parserFunctionNames = allOf.map((nodeId) => toCamel("parse", names[nodeId]));

  yield itt`
    return ${joinIterable(
      mapIterable(parserFunctionNames, (functionName) => `${functionName}(value)`),
      " ?? ",
    )};
  `;
}
function* generateIfCompoundParserStatements(
  specification: models.Specification,
  $if: string,
  then?: string,
  $else?: string,
) {
  const { names, nodes } = specification;

  const parserFunctionNames = new Array<string>();
  parserFunctionNames.push(toCamel("parse", names[$if]));
  if (then != null) {
    parserFunctionNames.push(toCamel("parse", names[then]));
  }
  if ($else != null) {
    parserFunctionNames.push(toCamel("parse", names[$else]));
  }

  yield itt`
    return ${joinIterable(
      mapIterable(parserFunctionNames, (functionName) => `${functionName}(value)`),
      " ?? ",
    )};
  `;
}
function* generateNotCompoundParserStatements(specification: models.Specification, not: string) {
  const { names, nodes } = specification;

  const functionName = toCamel("parse", names[not]);

  yield itt`
    return ${functionName}(value);
  `;
}
