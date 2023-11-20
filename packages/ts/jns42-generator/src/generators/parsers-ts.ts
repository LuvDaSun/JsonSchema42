import * as models from "../models/index.js";
import { banner, itt, toCamel, toPascal } from "../utils/index.js";

export function* generateParsersTsCode(specification: models.Specification) {
  yield banner;

  const { names, nodes } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    const typeName = toPascal(names[nodeId]);

    {
      const functionName = toCamel("parse", names[nodeId]);
      const functionBody = generateParserBody(specification, nodeId);

      yield itt`
        export function ${functionName}(value: unknown): types.${typeName} {
          ${functionBody}
        }
      `;
    }

    for (const type of node.types) {
      const functionName = "_" + toCamel("parse", type, names[nodeId]);
      const functionBody = generateTypeParserBody(specification, nodeId, type);

      yield itt`
        function ${functionName}(value: unknown): types.${typeName} {
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
        function ${functionName}(value: unknown): types.${typeName} {
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
        function ${functionName}(value: unknown): types.${typeName}{
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
        function ${functionName}(value: unknown): types.${typeName}{
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
        function ${functionName}(value: unknown): types.${typeName} {
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
        function ${functionName}(value: unknown): types.${typeName} {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.not != null) {
      const functionName = "_" + toCamel("parse", "not", names[nodeId]);
      const functionBody = generateNotCompoundParserStatements(specification, node.applicators.not);
      yield itt`
        function ${functionName}(value: unknown): types.${typeName}{
          ${functionBody}
        }
      `;
    }
  }
}

function* generateParserBody(specification: models.Specification, nodeId: string) {
  const { names, nodes } = specification;
  const node = nodes[nodeId];

  const validatorFunctionNames = new Array<string>();

  if (node.types.length > 0) {
    for (const type of node.types) {
      const functionName = "_" + toCamel("parse", type, names[nodeId]);
      validatorFunctionNames.push(functionName);
    }
  }

  if (node.applicators.reference != null) {
    const functionName = "_" + toCamel("parse", "reference", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.oneOf != null) {
    const functionName = "_" + toCamel("parse", "oneOf", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.anyOf != null) {
    const functionName = "_" + toCamel("parse", "anyOf", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.allOf != null) {
    const functionName = "_" + toCamel("parse", "allOf", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.if != null) {
    const functionName = "_" + toCamel("parse", "if", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.not != null) {
    const functionName = "_" + toCamel("parse", "not", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  yield itt`
    throw "TODO";
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
    return value;
  `;
}
function* generateAnyTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
    throw "TODO";
  `;
}
function* generateNullTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
    throw "TODO";
  `;
}
function* generateBooleanTypeParserStatements(specification: models.Specification, nodeId: string) {
  const { nodes } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.boolean ?? {};

  yield itt`
    throw "TODO";
  `;
}
function* generateIntegerTypeParserStatements(specification: models.Specification, nodeId: string) {
  const { nodes } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.integer ?? {};

  yield itt`
    throw "TODO";
  `;
}
function* generateNumberTypeParserStatements(specification: models.Specification, nodeId: string) {
  const { nodes } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.integer ?? {};

  yield itt`
    throw "TODO";
  `;
}
function* generateStringTypeParserStatements(specification: models.Specification, nodeId: string) {
  yield itt`
    throw "TODO";
  `;
}
function* generateArrayTypeParserStatements(specification: models.Specification, nodeId: string) {
  const { nodes } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.array ?? {};

  const hasSeenSet = assertions.uniqueItems ?? false;

  yield itt`
    throw "TODO";
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
    throw "TODO";
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
  yield itt`
    throw "TODO";
  `;
}
function* generateOneOfCompoundParserStatements(
  specification: models.Specification,
  oneOf: string[],
) {
  yield itt`
    throw "TODO";
  `;
}
function* generateAnyOfCompoundParserStatements(
  specification: models.Specification,
  anyOf: string[],
) {
  yield itt`
    throw "TODO";
  `;
}
function* generateAllOfCompoundParserStatements(
  specification: models.Specification,
  allOf: string[],
) {
  yield itt`
    throw "TODO";
  `;
}
function* generateIfCompoundParserStatements(
  specification: models.Specification,
  $if: string,
  then?: string,
  $else?: string,
) {
  yield itt`
    throw "TODO";
  `;
}
function* generateNotCompoundParserStatements(specification: models.Specification, not: string) {
  yield itt`
    throw "TODO";
  `;
}
