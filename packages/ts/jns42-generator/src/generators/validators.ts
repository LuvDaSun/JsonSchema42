import ts from "typescript";
import * as models from "../models/index.js";
import { itt, joinIterable, mapIterable, toCamel, toPascal } from "../utils/index.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export function* generateValidators(specifitation: models.Specification) {
  const { names, nodes } = specifitation;
  const { factory } = ts;

  for (const nodeId in nodes) {
    const node = nodes[nodeId];
    yield* generateValidationFunction(specifitation, nodeId);
    for (const type of node.types) {
      yield* generateTypeValidationFunction(specifitation, nodeId, type);
    }
  }
}

function* generateValidationFunction(specification: models.Specification, nodeId: string) {
  const { names, nodes } = specification;
  const node = nodes[nodeId];

  const typeName = toPascal(names[nodeId]);
  const functionName = toCamel("is", names[nodeId]);
  const functionBody = generateValidationBody(specification, nodeId);

  yield itt`
    export function ${functionName}(value: unknown): value is ${typeName} {
      ${functionBody}
    }
  `;
}

function* generateTypeValidationFunction(
  specification: models.Specification,
  nodeId: string,
  type: string,
) {
  const { names } = specification;

  const functionName = "_" + toCamel("is", type, names[nodeId]);
  const functionBody = generateTypeValidationBody(specification, nodeId, type);

  yield itt`
    export function ${functionName}(value: unknown): value is unknown {
      ${functionBody}
    }
  `;
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

  if (node.applicators.anyOf != null) {
    const functionName = "_" + toCamel("is", "if", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (node.applicators.anyOf != null) {
    const functionName = "_" + toCamel("is", "not", names[nodeId]);
    validatorFunctionNames.push(functionName);
  }

  if (validatorFunctionNames.length > 0) {
    yield itt`
      if(${joinIterable(
        mapIterable(validatorFunctionNames, (functionName) => {
          return itt`!${functionName}(value)`;
        }),
        " || ",
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
      return generateNeverTypeValidationStatements(specification, nodeId);

    case "any":
      return generateAnyTypeValidationStatements(specification, nodeId);

    case "null":
      return generateNullTypeValidationStatements(specification, nodeId);

    case "boolean":
      return generateBooleanTypeValidationStatements(specification, nodeId);

    case "integer":
      return generateIntegerTypeValidationStatements(specification, nodeId);

    case "number":
      return generateNumberTypeValidationStatements(specification, nodeId);

    case "string":
      return generateStringTypeValidationStatements(specification, nodeId);

    case "array":
      return generateArrayTypeValidationStatements(specification, nodeId);

    case "map":
      return generateMapTypeValidationStatements(specification, nodeId);

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
    retuirn true;
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
          return itt`value === ${JSON.stringify(option)}`;
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
          return itt`value === ${JSON.stringify(option)}`;
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
          return itt`value === ${JSON.stringify(option)}`;
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
      if(new RexExp(${JSON.stringify(assertions.valuePattern)}).test(value)) {
        return false;
      }
    `;
  }

  if (assertions.options != null && assertions.options.length > 0) {
    if (assertions.options != null && assertions.options.length > 0) {
      yield itt`
        if(${joinIterable(
          assertions.options.map((option) => {
            return itt`value === ${JSON.stringify(option)}`;
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
    for(let elementIndex = 0; elementIndes < value.length; elementIndex ++) {
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
    const itemValidatorFunctionName = toPascal(names[node.applicators.arrayItems]);

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
    const itemValidatorFunctionName = toPascal(names[node.applicators.arrayItems]);
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
    const itemValidatorFunctionName = toPascal(names[itemTypeNodeId]);

    yield itt`
      case ${JSON.stringify(elementIndex)}:
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
      if(!(${JSON.stringify(propertyName)}) in value) {
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
    const propertyValue = value[propertyName as keyof value];
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

class ValidatorsTsCodeGenerator extends CodeGeneratorBase {
  protected *generateReferenceCompoundValidationStatements(reference: string) {
    const { factory: f } = this;
    const typeName = this.getTypeName(reference);

    yield f.createIfStatement(
      f.createPrefixUnaryExpression(
        ts.SyntaxKind.ExclamationToken,
        f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
          f.createIdentifier("value"),
        ]),
      ),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    yield itt`
    return true;
  `;
  }
  protected *generateOneOfCompoundValidationStatements(oneOf: string[]) {
    const { factory: f } = this;

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("validCounter"),
            undefined,
            undefined,
            f.createNumericLiteral(0),
          ),
        ],
        ts.NodeFlags.Let,
      ),
    );

    for (const typeNodeId of oneOf) {
      const typeName = this.getTypeName(typeNodeId);

      yield f.createIfStatement(
        f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
          f.createIdentifier("value"),
        ]),
        f.createBlock(
          [
            f.createExpressionStatement(
              f.createPostfixUnaryExpression(
                f.createIdentifier("validCounter"),
                ts.SyntaxKind.PlusPlusToken,
              ),
            ),
          ],
          true,
        ),
      );

      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createIdentifier("validCounter"),
          f.createToken(ts.SyntaxKind.GreaterThanToken),
          f.createNumericLiteral(1),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    yield f.createIfStatement(
      f.createBinaryExpression(
        f.createIdentifier("validCounter"),
        f.createToken(ts.SyntaxKind.LessThanToken),
        f.createNumericLiteral(1),
      ),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    yield itt`
    return true;
  `;
  }
  protected *generateAnyOfCompoundValidationStatements(anyOf: string[]) {
    const { factory: f } = this;

    for (const typeNodeId of anyOf) {
      const typeName = this.getTypeName(typeNodeId);

      yield f.createIfStatement(
        f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
          f.createIdentifier("value"),
        ]),
        f.createBlock([f.createReturnStatement(f.createTrue())], true),
      );
    }

    yield f.createReturnStatement(f.createFalse());
  }
  protected *generateAllOfCompoundValidationStatements(allOf: string[]) {
    const { factory: f } = this;

    for (const typeNodeId of allOf) {
      const typeName = this.getTypeName(typeNodeId);

      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
            f.createIdentifier("value"),
          ]),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    yield itt`
    return true;
  `;
  }
  protected *generateIfCompoundValidationStatements($if: string, then?: string, $else?: string) {
    const { factory: f } = this;
    const typeName = this.getTypeName($if);

    if (then != null && $else != null) {
      const thenTypeName = this.getTypeName(then);
      const elseTypeName = this.getTypeName($else);

      yield f.createIfStatement(
        f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
          f.createIdentifier("value"),
        ]),
        f.createBlock(
          [
            f.createIfStatement(
              f.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                f.createCallExpression(f.createIdentifier(`is${thenTypeName}`), undefined, [
                  f.createIdentifier("value"),
                ]),
              ),
              f.createBlock([f.createReturnStatement(f.createFalse())], true),
            ),
          ],
          true,
        ),
        f.createBlock(
          [
            f.createIfStatement(
              f.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                f.createCallExpression(f.createIdentifier(`is${elseTypeName}`), undefined, [
                  f.createIdentifier("value"),
                ]),
              ),
              f.createBlock([f.createReturnStatement(f.createFalse())], true),
            ),
          ],
          true,
        ),
      );
    }

    if (then != null && $else == null) {
      const thenTypeName = this.getTypeName(then);

      yield f.createIfStatement(
        f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
          f.createIdentifier("value"),
        ]),
        f.createBlock(
          [
            f.createIfStatement(
              f.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                f.createCallExpression(f.createIdentifier(`is${thenTypeName}`), undefined, [
                  f.createIdentifier("value"),
                ]),
              ),
              f.createBlock([f.createReturnStatement(f.createFalse())], true),
            ),
          ],
          true,
        ),
      );
    }

    if (then == null && $else != null) {
      const elseTypeName = this.getTypeName($else);

      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
            f.createIdentifier("value"),
          ]),
        ),
        f.createBlock(
          [
            f.createIfStatement(
              f.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                f.createCallExpression(f.createIdentifier(`is${elseTypeName}`), undefined, [
                  f.createIdentifier("value"),
                ]),
              ),
              f.createBlock([f.createReturnStatement(f.createFalse())], true),
            ),
          ],
          true,
        ),
      );
    }

    yield itt`
    return true;
  `;
  }
  protected *generateNotCompoundValidationStatements(not: string) {
    const { factory: f } = this;
    const typeName = this.getTypeName(not);

    yield f.createIfStatement(
      f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
        f.createIdentifier("value"),
      ]),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    yield itt`
    return true;
  `;
  }

  private createRegExpExpression(pattern: string) {
    const { factory } = this;
    return factory.createNewExpression(factory.createIdentifier("RegExp"), undefined, [
      factory.createStringLiteral(pattern),
    ]);
  }
}
