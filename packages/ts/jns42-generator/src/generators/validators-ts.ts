import * as models from "../models/index.js";
import { banner, itt, joinIterable, mapIterable, toCamel, toPascal } from "../utils/index.js";

export function* generateValidatorsTsCode(specification: models.Specification) {
  yield banner;

  const { names, nodes } = specification;

  yield itt`
    import * as types from "./types.js";
  `;

  for (const nodeId in nodes) {
    const node = nodes[nodeId];

    {
      const typeName = toPascal(names[nodeId]);
      const functionName = toCamel("is", names[nodeId]);
      const functionBody = generateValidationBody(specification, nodeId);

      yield itt`
        export function ${functionName}(value: unknown): value is types.${typeName} {
          ${functionBody}
        }
      `;
    }

    for (const type of node.types) {
      const functionName = "_" + toCamel("is", type, names[nodeId]);
      const functionBody = generateTypeValidationBody(specification, nodeId, type);

      yield itt`
        function ${functionName}(value: unknown): value is unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.reference != null) {
      const functionName = "_" + toCamel("is", "reference", names[nodeId]);
      const functionBody = generateReferenceCompoundValidationStatements(
        specification,
        node.applicators.reference,
      );
      yield itt`
        function ${functionName}(value: unknown): value is unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.oneOf != null) {
      const functionName = "_" + toCamel("is", "oneOf", names[nodeId]);
      const functionBody = generateOneOfCompoundValidationStatements(
        specification,
        node.applicators.oneOf,
      );
      yield itt`
        function ${functionName}(value: unknown): value is unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.anyOf != null) {
      const functionName = "_" + toCamel("is", "anyOf", names[nodeId]);
      const functionBody = generateAnyOfCompoundValidationStatements(
        specification,
        node.applicators.anyOf,
      );
      yield itt`
        function ${functionName}(value: unknown): value is unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.allOf != null) {
      const functionName = "_" + toCamel("is", "allOf", names[nodeId]);
      const functionBody = generateAllOfCompoundValidationStatements(
        specification,
        node.applicators.allOf,
      );
      yield itt`
        function ${functionName}(value: unknown): value is unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.if != null) {
      const functionName = "_" + toCamel("is", "if", names[nodeId]);
      const functionBody = generateIfCompoundValidationStatements(
        specification,
        node.applicators.if,
        node.applicators.then,
        node.applicators.else,
      );
      yield itt`
        function ${functionName}(value: unknown): value is unknown {
          ${functionBody}
        }
      `;
    }

    if (node.applicators.not != null) {
      const functionName = "_" + toCamel("is", "not", names[nodeId]);
      const functionBody = generateNotCompoundValidationStatements(
        specification,
        node.applicators.not,
      );
      yield itt`
        function ${functionName}(value: unknown): value is unknown {
          ${functionBody}
        }
      `;
    }
  }
}

function* generateValidationBody(specification: models.Specification, nodeId: string) {
  const { names, nodes } = specification;
  const node = nodes[nodeId];

  const validatorFunctionNames = new Array<string>();

  if (node.types.length > 0) {
    for (const type of node.types) {
      const functionName = "_" + toCamel("is", type, names[nodeId]);
      validatorFunctionNames.push(functionName);
    }
  }

  if (node.applicators.reference != null) {
    const functionName = "_" + toCamel("is", "reference", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.oneOf != null) {
    const functionName = "_" + toCamel("is", "oneOf", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.anyOf != null) {
    const functionName = "_" + toCamel("is", "anyOf", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.allOf != null) {
    const functionName = "_" + toCamel("is", "allOf", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.if != null) {
    const functionName = "_" + toCamel("is", "if", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.not != null) {
    const functionName = "_" + toCamel("is", "not", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (validatorFunctionNames.length > 0) {
    yield itt`
      if(${joinIterable(
        mapIterable(validatorFunctionNames, (functionName) => {
          return itt`!${functionName}(value)`;
        }),
        " && ",
      )}) {
        return false;
      }
    `;
  }

  yield itt`
    return true;
  `;
}

function* generateTypeValidationBody(
  specification: models.Specification,
  nodeId: string,
  type: string,
) {
  switch (type) {
    case "never":
      yield* generateNeverTypeValidationStatements(specification, nodeId);
      break;

    case "any":
      yield* generateAnyTypeValidationStatements(specification, nodeId);
      break;

    case "null":
      yield* generateNullTypeValidationStatements(specification, nodeId);
      break;

    case "boolean":
      yield* generateBooleanTypeValidationStatements(specification, nodeId);
      break;

    case "integer":
      yield* generateIntegerTypeValidationStatements(specification, nodeId);
      break;

    case "number":
      yield* generateNumberTypeValidationStatements(specification, nodeId);
      break;

    case "string":
      yield* generateStringTypeValidationStatements(specification, nodeId);
      break;

    case "array":
      yield* generateArrayTypeValidationStatements(specification, nodeId);
      break;

    case "map":
      yield* generateMapTypeValidationStatements(specification, nodeId);
      break;

    default:
      throw new Error("type not supported");
  }
}

function* generateNeverTypeValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  yield itt`
    return false;
  `;
}
function* generateAnyTypeValidationStatements(specification: models.Specification, nodeId: string) {
  yield itt`
    return true;
  `;
}
function* generateNullTypeValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  yield itt`
    if(value !== null) {
      return false;
    }
  `;

  yield itt`
    return true;
  `;
}
function* generateBooleanTypeValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.boolean ?? {};

  yield itt`
    if(typeof value !== "boolean") {
      return false;
    }
  `;

  if (assertions.options != null && assertions.options.length > 0) {
    yield itt`
      if(${joinIterable(
        assertions.options.map((option) => {
          return itt`value !== ${JSON.stringify(option)}`;
        }),
        " && ",
      )}) {
        return false;
      }
    `;
  }

  yield itt`
    return true;
  `;
}
function* generateIntegerTypeValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.integer ?? {};

  yield itt`
    if(typeof value !== "number" || isNaN(value)) {
      return false;
    }
  `;

  if (assertions.minimumInclusive != null) {
    yield itt`
      if(value < ${JSON.stringify(assertions.minimumInclusive)}) {
        return false;
      }
    `;
  }

  if (assertions.minimumExclusive != null) {
    yield itt`
      if(value <= ${JSON.stringify(assertions.minimumExclusive)}) {
        return false;
      }
    `;
  }

  if (assertions.maximumInclusive != null) {
    yield itt`
      if(value > ${JSON.stringify(assertions.minimumInclusive)}) {
        return false;
      }
    `;
  }

  if (assertions.maximumExclusive != null) {
    yield itt`
      if(value >= ${JSON.stringify(assertions.minimumExclusive)}) {
        return false;
      }
    `;
  }

  if (assertions.multipleOf != null) {
    yield itt`
      if(value % ${JSON.stringify(assertions.multipleOf)} !== 0) {
        return false;
      }
    `;
  }

  if (assertions.options != null && assertions.options.length > 0) {
    yield itt`
      if(${joinIterable(
        assertions.options.map((option) => {
          return itt`value !== ${JSON.stringify(option)}`;
        }),
        " && ",
      )}) {
        return false;
      }
    `;
  }

  yield itt`
    return true;
  `;
}
function* generateNumberTypeValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.integer ?? {};

  yield itt`
    if(typeof value !== "number" || isNaN(value) || value % 1 !== 0) {
      return false;
    }
  `;

  if (assertions.minimumInclusive != null) {
    yield itt`
      if(value < ${JSON.stringify(assertions.minimumInclusive)}) {
        return false;
      }
    `;
  }

  if (assertions.minimumExclusive != null) {
    yield itt`
      if(value <= ${JSON.stringify(assertions.minimumExclusive)}) {
        return false;
      }
    `;
  }

  if (assertions.maximumInclusive != null) {
    yield itt`
      if(value > ${JSON.stringify(assertions.minimumInclusive)}) {
        return false;
      }
    `;
  }

  if (assertions.maximumExclusive != null) {
    yield itt`
      if(value >= ${JSON.stringify(assertions.minimumExclusive)}) {
        return false;
      }
    `;
  }

  if (assertions.multipleOf != null) {
    yield itt`
      if(value % ${JSON.stringify(assertions.multipleOf)} !== 0) {
        return false;
      }
    `;
  }

  if (assertions.options != null && assertions.options.length > 0) {
    yield itt`
      if(${joinIterable(
        assertions.options.map((option) => {
          return itt`value !== ${JSON.stringify(option)}`;
        }),
        " && ",
      )}) {
        return false;
      }
    `;
  }

  yield itt`
    return true;
  `;
}
function* generateStringTypeValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.string ?? {};

  yield itt`
    if(typeof value !== "string") {
      return false;
    }
  `;

  if (assertions.minimumLength != null) {
    yield itt`
      if(value.length < ${JSON.stringify(assertions.minimumLength)}) {
        return false;
      }
    `;
  }

  if (assertions.maximumLength != null) {
    yield itt`
      if(value.length > ${JSON.stringify(assertions.maximumLength)}) {
        return false;
      }
    `;
  }

  if (assertions.valuePattern != null) {
    yield itt`
      if(new RegExp(${JSON.stringify(assertions.valuePattern)}).test(value)) {
        return false;
      }
    `;
  }

  if (assertions.options != null && assertions.options.length > 0) {
    if (assertions.options != null && assertions.options.length > 0) {
      yield itt`
        if(${joinIterable(
          assertions.options.map((option) => {
            return itt`value !== ${JSON.stringify(option)}`;
          }),
          " && ",
        )}) {
          return false;
        }
      `;
    }
  }

  yield itt`
    return true;
  `;
}
function* generateArrayTypeValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.array ?? {};

  const hasSeenSet = assertions.uniqueItems ?? false;

  yield itt`
    if(!Array.isArray(value)) {
      return false;
    }
  `;

  if (assertions.minimumItems != null) {
    yield itt`
      if(value.length < ${JSON.stringify(assertions.minimumItems)}) {
        return false;
      }
    `;
  }

  if (assertions.maximumItems != null) {
    yield itt`
      if(value.length > ${JSON.stringify(assertions.maximumItems)}) {
        return false;
      }
    `;
  }

  /**
   * if we want unique values, create a set to keep track of em
   */
  if (hasSeenSet) {
    yield itt`
      const elementValueSeen = new Set<unknown>();
    `;
  }

  /**
   * if we have tuple items the length should be the length of the tuple
   * or at least the length of the tuple if there are array items
   */
  if (node.applicators.tupleItems != null) {
    if (node.applicators.arrayItems == null) {
      yield itt`
        if(value.length !== ${JSON.stringify(node.applicators.tupleItems.length)}) {
          return false;
        }
      `;
    } else {
      yield itt`
        if(value.length < ${JSON.stringify(node.applicators.tupleItems.length)}) {
          return false;
        }
      `;
    }
  }

  /**
   * Loop through the elements to validate them!
   */
  yield itt`
    for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
      ${generateArrayTypeItemValidationStatements(specification, nodeId)}
    }
  `;

  yield itt`
    return true;
  `;
}
function* generateArrayTypeItemValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes, names } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.array ?? {};

  const hasSeenSet = assertions.uniqueItems ?? false;

  yield itt`
    const elementValue = value[elementIndex];
  `;

  if (hasSeenSet) {
    /**
     * if we want uniqueness, check iof the value is already present.
     */
    yield itt`
      if(elementValueSeen.has(elementValue)) {
        return false;
      }
      elementValueSeen.add(elementValue);
    `;
  }

  if (node.applicators.tupleItems != null && node.applicators.arrayItems != null) {
    const itemValidatorFunctionName = toCamel("is", names[node.applicators.arrayItems]);

    yield itt`
      if(elementIndex < ${JSON.stringify(node.applicators.tupleItems.length)}) {
        switch(elementIndex) {
          ${generateArrayTypeItemCaseClausesValidationStatements(specification, nodeId)}
        }
      }
      else {
        if(!${itemValidatorFunctionName}(elementValue)) {
          return false;
        }
      }
    `;
  }

  if (node.applicators.tupleItems != null && node.applicators.arrayItems == null) {
    yield itt`
      if(elementIndex < ${JSON.stringify(node.applicators.tupleItems.length)}) {
        switch(elementIndex) {
          ${generateArrayTypeItemCaseClausesValidationStatements(specification, nodeId)}
        }
      }
    `;
  }

  if (node.applicators.tupleItems == null && node.applicators.arrayItems != null) {
    const itemValidatorFunctionName = toCamel("is", names[node.applicators.arrayItems]);
    yield itt`
      if(!${itemValidatorFunctionName}(elementValue)) {
        return false;
      }
    `;
  }
}
function* generateArrayTypeItemCaseClausesValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes, names } = specification;
  const node = nodes[nodeId];

  if (node.applicators.tupleItems == null) {
    return;
  }

  for (const elementIndex in node.applicators.tupleItems) {
    const itemTypeNodeId = node.applicators.tupleItems[elementIndex];
    const itemValidatorFunctionName = toCamel("is", names[itemTypeNodeId]);

    yield itt`
      case ${JSON.stringify(Number(elementIndex))}:
        if(!${itemValidatorFunctionName}(elementValue)) {
          return false;
        }
        break;
    `;
  }

  yield itt`
    default:
      return false;
  `;
}
function* generateMapTypeValidationStatements(specification: models.Specification, nodeId: string) {
  const { nodes } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.map ?? {};

  const hasPropertyCounter =
    assertions.minimumProperties != null || assertions.maximumProperties != null;

  yield itt`
    if(typeof value !== "object" || value === null || Array.isArray(value)) {
      return false;
    }
  `;

  /**
   * we want to count the properties
   */
  if (hasPropertyCounter) {
    yield itt`
      let propertyCount = 0;
    `;
  }

  /**
   * check if all the required properties are present
   */
  for (const propertyName of assertions.required ?? []) {
    yield itt`
      if(!(${JSON.stringify(propertyName)} in value)) {
        return false;
      }
    `;
  }

  /**
   * loop through all the properties to validate em
   */
  yield itt`
    for(const propertyName in value) {
      ${generateMapTypeItemValidationStatements(specification, nodeId)}
    }
  `;

  /**
   * property count validation
   */
  if (hasPropertyCounter) {
    if (assertions.minimumProperties != null) {
      yield itt`
        if(propertyCount < ${JSON.stringify(assertions.minimumProperties)}) {
          return false;
        }
      `;
    }

    if (assertions.maximumProperties != null) {
      yield itt`
        if(propertyCount > ${JSON.stringify(assertions.maximumProperties)}) {
          return false;
        }
      `;
    }
  }

  yield itt`
    return true;
  `;
}
function* generateMapTypeItemValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes, names } = specification;
  const node = nodes[nodeId];
  const assertions = node.assertions.map ?? {};

  const hasPropertyCounter =
    assertions.minimumProperties != null || assertions.maximumProperties != null;

  if (hasPropertyCounter) {
    yield itt`
      propertyCount++;
    `;
  }

  yield itt`
    const propertyValue = value[propertyName as keyof typeof value];
  `;

  if (node.applicators.objectProperties != null) {
    yield itt`
      switch(propertyName) {
        ${generateMapTypeItemCaseClausesValidationStatements(specification, nodeId)}
      }
    `;
  }

  if (node.applicators.patternProperties != null) {
    for (const [pattern, typeNodeId] of Object.entries(node.applicators.patternProperties)) {
      const validatorFunctionName = toCamel("is", names[typeNodeId]);

      yield itt`
        if(new RegExp(${JSON.stringify(pattern)}).test(propertyName)) {
          if(!${validatorFunctionName}(propertyValue)) {
            return false;
          }
        }
      `;
    }
  }

  if (node.applicators.propertyNames != null) {
    const validatorFunctionName = toCamel("is", names[node.applicators.propertyNames]);

    yield itt`
      if(!${validatorFunctionName}(propertyValue)) {
        return false;
    }
  `;
  }

  if (node.applicators.mapProperties != null) {
    const validatorFunctionName = toCamel("is", names[node.applicators.mapProperties]);

    yield itt`
      if(!${validatorFunctionName}(propertyValue)) {
        return false;
      }
    `;
  }
}
function* generateMapTypeItemCaseClausesValidationStatements(
  specification: models.Specification,
  nodeId: string,
) {
  const { nodes, names } = specification;
  const node = nodes[nodeId];

  if (node.applicators.objectProperties == null) {
    return;
  }

  for (const propertyName in node.applicators.objectProperties) {
    const propertyTypeNodeId = node.applicators.objectProperties[propertyName];
    const validatorFunctionName = toCamel("is", names[propertyTypeNodeId]);

    yield itt`
      case ${JSON.stringify(propertyName)}:
        if(!${validatorFunctionName}(propertyValue)) {
          return false;
        }
        break;
    `;
  }
}

function* generateReferenceCompoundValidationStatements(
  specification: models.Specification,
  reference: string,
) {
  const { nodes, names } = specification;
  const validatorFunctionName = toCamel("is", names[reference]);

  yield itt`
    if(!${validatorFunctionName}(value)) {
      return false;
    }
  `;

  yield itt`
    return true;
  `;
}
function* generateOneOfCompoundValidationStatements(
  specification: models.Specification,
  oneOf: string[],
) {
  const { nodes, names } = specification;

  yield itt`
    let validCounter = 0;
  `;

  for (const typeNodeId of oneOf) {
    const validatorFunctionName = toCamel("is", names[typeNodeId]);

    yield itt`
      if(${validatorFunctionName}(value)) {
        validCounter++;
      }

      if(validCounter > 1) {
        return false
      }
    `;
  }

  yield itt`
    if(validCounter < 1) {
      return false
    }
  `;

  yield itt`
    return true;
  `;
}
function* generateAnyOfCompoundValidationStatements(
  specification: models.Specification,
  anyOf: string[],
) {
  const { nodes, names } = specification;

  for (const typeNodeId of anyOf) {
    const validatorFunctionName = toCamel("is", names[typeNodeId]);

    yield itt`
      if(${validatorFunctionName}(value)) {
        return true;
      }
    `;
  }

  yield itt`
    return false;
  `;
}
function* generateAllOfCompoundValidationStatements(
  specification: models.Specification,
  allOf: string[],
) {
  const { nodes, names } = specification;

  for (const typeNodeId of allOf) {
    const validatorFunctionName = toCamel("is", names[typeNodeId]);

    yield itt`
      if(!${validatorFunctionName}(value)) {
        return false;
      }
    `;
  }

  yield itt`
    return true;
  `;
}
function* generateIfCompoundValidationStatements(
  specification: models.Specification,
  $if: string,
  then?: string,
  $else?: string,
) {
  const { nodes, names } = specification;
  const ifValidatorFunctionName = toCamel("is", names[$if]);

  if (then != null && $else != null) {
    const thenValidatorFunctionName = toCamel("is", names[then]);
    const elseValidatorFunctionName = toCamel("is", names[$else]);

    itt`
      if(${ifValidatorFunctionName}(value)) {
        if(!${thenValidatorFunctionName}(value)) {
          return false;
        }
      }
      else {
        if(!${elseValidatorFunctionName}(value)) {
          return false;
        }
      }
    `;
  }

  if (then != null && $else == null) {
    const thenValidatorFunctionName = toCamel("is", names[then]);

    itt`
      if(${ifValidatorFunctionName}(value)) {
        if(!${thenValidatorFunctionName}(value)) {
          return false;
        }
      }
    `;
  }

  if (then == null && $else != null) {
    const elseValidatorFunctionName = toCamel("is", names[$else]);

    itt`
      if(!${ifValidatorFunctionName}(value)) {
        if(!${elseValidatorFunctionName}(value)) {
          return false;
        }
      }
    `;
  }

  yield itt`
    return true;
  `;
}
function* generateNotCompoundValidationStatements(
  specification: models.Specification,
  not: string,
) {
  const { nodes, names } = specification;
  const validatorFunctionName = toCamel("is", names[not]);

  yield itt`
    if(${validatorFunctionName}(value)) {
      return false;
    }
  `;

  yield itt`
    return true;
  `;
}
