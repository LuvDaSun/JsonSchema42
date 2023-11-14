import * as schemaIntermediateB from "@jns42/jns42-schema-intermediate-b";
import camelcase from "camelcase";
import ts from "typescript";
import { CodeGeneratorBase } from "./code-generator-base.js";

export class ValidatorsTsCodeGenerator extends CodeGeneratorBase {
  public *getStatements() {
    for (const nodeId in this.nodes) {
      yield* this.generateValidatorFunctionDeclarationStatements(nodeId);
    }
  }

  protected *generateValidatorFunctionDeclarationStatements(
    nodeId: string,
  ): Iterable<ts.FunctionDeclaration> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];

    const typeName = this.getTypeName(nodeId);

    yield f.createFunctionDeclaration(
      [f.createToken(ts.SyntaxKind.ExportKeyword)],
      undefined,
      `is${typeName}`,
      undefined,
      [
        f.createParameterDeclaration(
          undefined,
          undefined,
          "value",
          undefined,
          f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ),
      ],
      f.createTypePredicateNode(
        undefined,
        f.createIdentifier("value"),
        this.generateTypeReference(nodeId),
      ),
      f.createBlock(
        [...this.generateValidatorFunctionBodyStatements(nodeId)],
        true,
      ),
    );

    for (const type of node.types) {
      yield f.createFunctionDeclaration(
        undefined,
        undefined,
        `_is${camelcase(type, {
          pascalCase: true,
        })}${typeName}`,
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            "value",
            undefined,
            f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ),
        ],
        f.createTypePredicateNode(
          undefined,
          f.createIdentifier("value"),
          f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ),
        f.createBlock(
          [...this.generateTypeValidationStatements(nodeId, type)],
          true,
        ),
      );
    }

    if (node.applicators.reference != null) {
      yield f.createFunctionDeclaration(
        undefined,
        undefined,
        `_isReference${typeName}`,
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            "value",
            undefined,
            f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ),
        ],
        f.createTypePredicateNode(
          undefined,
          f.createIdentifier("value"),
          f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ),
        f.createBlock(
          [
            ...this.generateReferenceCompoundValidationStatements(
              node.applicators.reference,
            ),
          ],
          true,
        ),
      );
    }

    if (node.applicators.oneOf != null) {
      yield f.createFunctionDeclaration(
        undefined,
        undefined,
        `_isOneOf${typeName}`,
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            "value",
            undefined,
            f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ),
        ],
        f.createTypePredicateNode(
          undefined,
          f.createIdentifier("value"),
          f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ),
        f.createBlock(
          [
            ...this.generateOneOfCompoundValidationStatements(
              node.applicators.oneOf,
            ),
          ],
          true,
        ),
      );
    }

    if (node.applicators.anyOf != null) {
      yield f.createFunctionDeclaration(
        undefined,
        undefined,
        `_isAnyOf${typeName}`,
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            "value",
            undefined,
            f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ),
        ],
        f.createTypePredicateNode(
          undefined,
          f.createIdentifier("value"),
          f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ),
        f.createBlock(
          [
            ...this.generateAnyOfCompoundValidationStatements(
              node.applicators.anyOf,
            ),
          ],
          true,
        ),
      );
    }

    if (node.applicators.allOf != null) {
      yield f.createFunctionDeclaration(
        undefined,
        undefined,
        `_isAllOf${typeName}`,
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            "value",
            undefined,
            f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ),
        ],
        f.createTypePredicateNode(
          undefined,
          f.createIdentifier("value"),
          f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ),
        f.createBlock(
          [
            ...this.generateAllOfCompoundValidationStatements(
              node.applicators.allOf,
            ),
          ],
          true,
        ),
      );
    }

    if (node.applicators.if != null) {
      yield f.createFunctionDeclaration(
        undefined,
        undefined,
        `_isIf${typeName}`,
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            "value",
            undefined,
            f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ),
        ],
        f.createTypePredicateNode(
          undefined,
          f.createIdentifier("value"),
          f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ),
        f.createBlock(
          [
            ...this.generateIfCompoundValidationStatements(
              node.applicators.if,
              node.applicators.then,
              node.applicators.else,
            ),
          ],
          true,
        ),
      );
    }

    if (node.applicators.not != null) {
      yield f.createFunctionDeclaration(
        undefined,
        undefined,
        `_isNot${typeName}`,
        undefined,
        [
          f.createParameterDeclaration(
            undefined,
            undefined,
            "value",
            undefined,
            f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
          ),
        ],
        f.createTypePredicateNode(
          undefined,
          f.createIdentifier("value"),
          f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
        ),
        f.createBlock(
          [
            ...this.generateNotCompoundValidationStatements(
              node.applicators.not,
            ),
          ],
          true,
        ),
      );
    }
  }

  protected *generateValidatorFunctionBodyStatements(
    nodeId: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];

    const typeName = this.getTypeName(nodeId);

    if (node.types.length > 0) {
      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createParenthesizedExpression(
            this.joinExpressions(
              node.types.map((type) =>
                f.createCallExpression(
                  f.createIdentifier(
                    `_is${camelcase(type, {
                      pascalCase: true,
                    })}${typeName}`,
                  ),
                  undefined,
                  [f.createIdentifier("value")],
                ),
              ),
              f.createToken(ts.SyntaxKind.BarBarToken),
            ),
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (node.applicators.reference != null) {
      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(`_isReference${typeName}`),
            undefined,
            [f.createIdentifier("value")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (node.applicators.oneOf != null) {
      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(`_isOneOf${typeName}`),
            undefined,
            [f.createIdentifier("value")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (node.applicators.anyOf != null) {
      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(`_isAnyOf${typeName}`),
            undefined,
            [f.createIdentifier("value")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (node.applicators.allOf != null) {
      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(`_isAllOf${typeName}`),
            undefined,
            [f.createIdentifier("value")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (node.applicators.if != null) {
      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(`_isIf${typeName}`),
            undefined,
            [f.createIdentifier("value")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (node.applicators.not != null) {
      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(`_isNot${typeName}`),
            undefined,
            [f.createIdentifier("value")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    yield f.createReturnStatement(f.createTrue());
  }

  protected generateTypeValidationStatements(
    nodeId: string,
    type: schemaIntermediateB.TypesSectionItems,
  ) {
    switch (type) {
      case "never":
        return this.generateNeverTypeValidationStatements(nodeId);

      case "any":
        return this.generateAnyTypeValidationStatements(nodeId);

      case "null":
        return this.generateNullTypeValidationStatements(nodeId);

      case "boolean":
        return this.generateBooleanTypeValidationStatements(nodeId);

      case "integer":
        return this.generateIntegerTypeValidationStatements(nodeId);

      case "number":
        return this.generateNumberTypeValidationStatements(nodeId);

      case "string":
        return this.generateStringTypeValidationStatements(nodeId);

      case "array":
        return this.generateArrayTypeValidationStatements(nodeId);

      case "map":
        return this.generateMapTypeValidationStatements(nodeId);

      default:
        throw new Error("type not supported");
    }
  }

  protected *generateNeverTypeValidationStatements(
    nodeId: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;
    /*
     * never never validates
     */
    yield f.createReturnStatement(f.createFalse());
  }
  protected *generateAnyTypeValidationStatements(
    nodeId: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;

    /*
     * any is always valid
     */
    yield f.createReturnStatement(f.createTrue());
  }
  protected *generateNullTypeValidationStatements(
    nodeId: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;

    yield f.createIfStatement(
      f.createBinaryExpression(
        f.createIdentifier("value"),
        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
        f.createNull(),
      ),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    yield f.createReturnStatement(f.createTrue());
  }
  protected *generateBooleanTypeValidationStatements(
    nodeId: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];
    const assertions = node.assertions.boolean ?? {};

    yield f.createIfStatement(
      f.createBinaryExpression(
        f.createTypeOfExpression(f.createIdentifier("value")),
        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
        f.createStringLiteral("boolean"),
      ),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    if (assertions.options != null && assertions.options.length > 0) {
      yield f.createIfStatement(
        this.joinExpressions(
          assertions.options.map((option) =>
            f.createBinaryExpression(
              f.createIdentifier("value"),
              f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
              option ? f.createTrue() : f.createFalse(),
            ),
          ),
          f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    yield f.createReturnStatement(f.createTrue());
  }
  protected *generateIntegerTypeValidationStatements(
    nodeId: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];
    const assertions = node.assertions.integer ?? {};

    yield f.createIfStatement(
      f.createBinaryExpression(
        f.createBinaryExpression(
          f.createTypeOfExpression(f.createIdentifier("value")),
          f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
          f.createStringLiteral("number"),
        ),
        f.createToken(ts.SyntaxKind.BarBarToken),
        f.createCallExpression(f.createIdentifier("isNaN"), undefined, [
          f.createIdentifier("value"),
        ]),
      ),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    yield f.createIfStatement(
      f.createBinaryExpression(
        f.createBinaryExpression(
          f.createIdentifier("value"),
          f.createToken(ts.SyntaxKind.PercentToken),
          f.createNumericLiteral(1),
        ),
        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
        f.createNumericLiteral(0),
      ),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    if (assertions.minimumInclusive != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createIdentifier("value"),
          f.createToken(ts.SyntaxKind.LessThanToken),
          f.createNumericLiteral(assertions.minimumInclusive),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.minimumExclusive != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createIdentifier("value"),
          f.createToken(ts.SyntaxKind.LessThanEqualsToken),
          f.createNumericLiteral(assertions.minimumExclusive),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.maximumInclusive != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createIdentifier("value"),
          f.createToken(ts.SyntaxKind.GreaterThanToken),
          f.createNumericLiteral(assertions.maximumInclusive),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.maximumExclusive != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createIdentifier("value"),
          f.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
          f.createNumericLiteral(assertions.maximumExclusive),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.multipleOf != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createBinaryExpression(
            f.createIdentifier("value"),
            f.createToken(ts.SyntaxKind.PercentToken),
            f.createNumericLiteral(assertions.multipleOf),
          ),
          f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
          f.createNumericLiteral(0),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.options != null && assertions.options.length > 0) {
      yield f.createIfStatement(
        this.joinExpressions(
          assertions.options.map((option) =>
            f.createBinaryExpression(
              f.createIdentifier("value"),
              f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
              f.createNumericLiteral(option),
            ),
          ),
          f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    yield f.createReturnStatement(f.createTrue());
  }
  protected *generateNumberTypeValidationStatements(
    nodeId: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];
    const assertions = node.assertions.number ?? {};

    yield f.createIfStatement(
      f.createBinaryExpression(
        f.createBinaryExpression(
          f.createTypeOfExpression(f.createIdentifier("value")),
          f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
          f.createStringLiteral("number"),
        ),
        f.createToken(ts.SyntaxKind.BarBarToken),
        f.createCallExpression(f.createIdentifier("isNaN"), undefined, [
          f.createIdentifier("value"),
        ]),
      ),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    if (assertions.minimumInclusive != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createIdentifier("value"),
          f.createToken(ts.SyntaxKind.LessThanToken),
          f.createNumericLiteral(assertions.minimumInclusive),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.minimumExclusive != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createIdentifier("value"),
          f.createToken(ts.SyntaxKind.LessThanEqualsToken),
          f.createNumericLiteral(assertions.minimumExclusive),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.maximumInclusive != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createIdentifier("value"),
          f.createToken(ts.SyntaxKind.GreaterThanToken),
          f.createNumericLiteral(assertions.maximumInclusive),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.maximumExclusive != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createIdentifier("value"),
          f.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
          f.createNumericLiteral(assertions.maximumExclusive),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.multipleOf != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createBinaryExpression(
            f.createIdentifier("value"),
            f.createToken(ts.SyntaxKind.PercentToken),
            f.createNumericLiteral(assertions.multipleOf),
          ),
          f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
          f.createNumericLiteral(0),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.options != null && assertions.options.length > 0) {
      yield f.createIfStatement(
        this.joinExpressions(
          assertions.options.map((option) =>
            f.createBinaryExpression(
              f.createIdentifier("value"),
              f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
              f.createNumericLiteral(option),
            ),
          ),
          f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    yield f.createReturnStatement(f.createTrue());
  }
  protected *generateStringTypeValidationStatements(
    nodeId: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];
    const assertions = node.assertions.string ?? {};

    yield f.createIfStatement(
      f.createBinaryExpression(
        f.createTypeOfExpression(f.createIdentifier("value")),
        f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
        f.createStringLiteral("string"),
      ),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    if (assertions.minimumLength != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createPropertyAccessExpression(
            f.createIdentifier("value"),
            f.createIdentifier("length"),
          ),
          f.createToken(ts.SyntaxKind.LessThanToken),
          f.createNumericLiteral(assertions.minimumLength),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.maximumLength != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createPropertyAccessExpression(
            f.createIdentifier("value"),
            f.createIdentifier("length"),
          ),
          f.createToken(ts.SyntaxKind.GreaterThanToken),
          f.createNumericLiteral(assertions.maximumLength),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.valuePattern != null) {
      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createPropertyAccessExpression(
              this.createRegExpExpression(assertions.valuePattern),
              f.createIdentifier("test"),
            ),
            undefined,
            [f.createIdentifier("value")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.options != null && assertions.options.length > 0) {
      yield f.createIfStatement(
        this.joinExpressions(
          assertions.options.map((option) =>
            f.createBinaryExpression(
              f.createIdentifier("value"),
              f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
              f.createStringLiteral(option),
            ),
          ),
          f.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    yield f.createReturnStatement(f.createTrue());
  }
  protected *generateArrayTypeValidationStatements(
    nodeId: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];
    const assertions = node.assertions.array ?? {};

    const hasSeenSet = assertions.uniqueItems ?? false;

    yield f.createIfStatement(
      f.createPrefixUnaryExpression(
        ts.SyntaxKind.ExclamationToken,
        f.createCallExpression(
          f.createPropertyAccessExpression(
            f.createIdentifier("Array"),
            f.createIdentifier("isArray"),
          ),
          undefined,
          [f.createIdentifier("value")],
        ),
      ),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    if (assertions.minimumItems != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createPropertyAccessExpression(
            f.createIdentifier("value"),
            f.createIdentifier("length"),
          ),
          f.createToken(ts.SyntaxKind.LessThanToken),
          f.createNumericLiteral(assertions.minimumItems),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (assertions.maximumItems != null) {
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createPropertyAccessExpression(
            f.createIdentifier("value"),
            f.createIdentifier("length"),
          ),
          f.createToken(ts.SyntaxKind.GreaterThanToken),
          f.createNumericLiteral(assertions.maximumItems),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    /**
     * if we want unique values, create a set to keep track of em
     */
    if (hasSeenSet) {
      yield f.createVariableStatement(
        undefined,
        f.createVariableDeclarationList(
          [
            f.createVariableDeclaration(
              f.createIdentifier("elementValueSeen"),
              undefined,
              undefined,
              f.createNewExpression(
                f.createIdentifier("Set"),
                [f.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)],
                [],
              ),
            ),
          ],
          ts.NodeFlags.Const,
        ),
      );
    }

    /**
     * if we have tuple items the length should be the length of the tuple
     * or at least the length of the tuple if there are array items
     */
    if (node.applicators.tupleItems != null) {
      if (node.applicators.arrayItems == null) {
        yield f.createIfStatement(
          f.createBinaryExpression(
            f.createPropertyAccessExpression(
              f.createIdentifier("value"),
              f.createIdentifier("length"),
            ),
            f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
            f.createNumericLiteral(node.applicators.tupleItems.length),
          ),
          f.createBlock([f.createReturnStatement(f.createFalse())], true),
        );
      } else {
        yield f.createIfStatement(
          f.createBinaryExpression(
            f.createPropertyAccessExpression(
              f.createIdentifier("value"),
              f.createIdentifier("length"),
            ),
            f.createToken(ts.SyntaxKind.GreaterThanEqualsToken),
            f.createNumericLiteral(node.applicators.tupleItems.length),
          ),
          f.createBlock([f.createReturnStatement(f.createFalse())], true),
        );
      }
    }

    /**
     * Loop through the elements to validate them!
     */
    yield f.createForStatement(
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("elementIndex"),
            undefined,
            undefined,
            f.createNumericLiteral(0),
          ),
        ],
        ts.NodeFlags.Let,
      ),
      f.createBinaryExpression(
        f.createIdentifier("elementIndex"),
        f.createToken(ts.SyntaxKind.LessThanToken),
        f.createPropertyAccessExpression(
          f.createIdentifier("value"),
          f.createIdentifier("length"),
        ),
      ),
      f.createPostfixUnaryExpression(
        f.createIdentifier("elementIndex"),
        ts.SyntaxKind.PlusPlusToken,
      ),
      f.createBlock(
        [...this.generateArrayTypeItemValidationStatements(nodeId)],
        true,
      ),
    );
    yield f.createReturnStatement(f.createTrue());
  }
  private *generateArrayTypeItemValidationStatements(nodeId: string) {
    const { factory: f } = this;
    const node = this.nodes[nodeId];
    const assertions = node.assertions.array ?? {};

    const hasSeenSet = assertions.uniqueItems ?? false;

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("elementValue"),
            undefined,
            undefined,
            f.createElementAccessExpression(
              f.createIdentifier("value"),
              f.createIdentifier("elementIndex"),
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    if (hasSeenSet) {
      /**
       * if we want uniqueness, check iof the value is already present
       */
      yield f.createIfStatement(
        f.createCallExpression(
          f.createPropertyAccessExpression(
            f.createIdentifier("elementValueSeen"),
            f.createIdentifier("has"),
          ),
          undefined,
          [f.createIdentifier("elementValue")],
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );

      /**
       * if we want uniqueness, add this value to the set
       */
      yield f.createExpressionStatement(
        f.createCallExpression(
          f.createPropertyAccessExpression(
            f.createIdentifier("elementValueSeen"),
            f.createIdentifier("add"),
          ),
          undefined,
          [f.createIdentifier("elementValue")],
        ),
      );
    }

    if (
      node.applicators.tupleItems != null &&
      node.applicators.arrayItems != null
    ) {
      const typeName = this.getTypeName(node.applicators.arrayItems);
      yield f.createIfStatement(
        f.createBinaryExpression(
          f.createIdentifier("elementIndex"),
          f.createToken(ts.SyntaxKind.LessThanToken),
          f.createNumericLiteral(node.applicators.tupleItems.length),
        ),
        f.createBlock(
          [
            f.createSwitchStatement(
              f.createIdentifier("elementIndex"),
              f.createCaseBlock([
                ...this.generateArrayTypeItemCaseClausesValidationStatements(
                  nodeId,
                ),
              ]),
            ),
          ],
          true,
        ),
        f.createBlock(
          [
            f.createIfStatement(
              f.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                f.createCallExpression(
                  f.createIdentifier(`is${typeName}`),
                  undefined,
                  [f.createIdentifier("elementValue")],
                ),
              ),
              f.createBlock([f.createReturnStatement(f.createFalse())], true),
            ),
          ],
          true,
        ),
      );
    }

    if (
      node.applicators.tupleItems != null &&
      node.applicators.arrayItems == null
    ) {
      yield f.createSwitchStatement(
        f.createIdentifier("elementIndex"),
        f.createCaseBlock([
          ...this.generateArrayTypeItemCaseClausesValidationStatements(nodeId),
        ]),
      );
    }

    if (
      node.applicators.tupleItems == null &&
      node.applicators.arrayItems != null
    ) {
      const typeName = this.getTypeName(node.applicators.arrayItems);
      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(`is${typeName}`),
            undefined,
            [f.createIdentifier("elementValue")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }
  }
  private *generateArrayTypeItemCaseClausesValidationStatements(
    nodeId: string,
  ): Iterable<ts.CaseOrDefaultClause> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];

    if (node.applicators.tupleItems == null) {
      return;
    }

    for (const elementIndex in node.applicators.tupleItems) {
      const itemTypeNodeId = node.applicators.tupleItems[elementIndex];
      const typeName = this.getTypeName(itemTypeNodeId);

      yield f.createCaseClause(f.createNumericLiteral(elementIndex), [
        f.createIfStatement(
          f.createPrefixUnaryExpression(
            ts.SyntaxKind.ExclamationToken,
            f.createCallExpression(
              f.createIdentifier(`is${typeName}`),
              undefined,
              [f.createIdentifier("elementValue")],
            ),
          ),
          f.createBlock([f.createReturnStatement(f.createFalse())], true),
        ),
        f.createBreakStatement(),
      ]);
    }

    yield f.createDefaultClause([f.createReturnStatement(f.createFalse())]);
  }
  protected *generateMapTypeValidationStatements(
    nodeId: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];
    const assertions = node.assertions.map ?? {};

    const hasPropertyCounter =
      assertions.minimumProperties != null ||
      assertions.maximumProperties != null;

    yield f.createIfStatement(
      f.createBinaryExpression(
        f.createBinaryExpression(
          f.createBinaryExpression(
            f.createTypeOfExpression(f.createIdentifier("value")),
            f.createToken(ts.SyntaxKind.ExclamationEqualsEqualsToken),
            f.createStringLiteral("object"),
          ),
          f.createToken(ts.SyntaxKind.BarBarToken),
          f.createBinaryExpression(
            f.createIdentifier("value"),
            f.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
            f.createNull(),
          ),
        ),
        f.createToken(ts.SyntaxKind.BarBarToken),
        f.createCallExpression(
          f.createPropertyAccessExpression(
            f.createIdentifier("Array"),
            f.createIdentifier("isArray"),
          ),
          undefined,
          [f.createIdentifier("value")],
        ),
      ),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    /**
     * we want to count the properties
     */
    if (hasPropertyCounter) {
      yield f.createVariableStatement(
        undefined,
        f.createVariableDeclarationList(
          [
            f.createVariableDeclaration(
              f.createIdentifier("propertyCount"),
              undefined,
              undefined,
              f.createNumericLiteral(0),
            ),
          ],
          ts.NodeFlags.Let,
        ),
      );
    }

    /**
     * check if all the required properties are present
     */
    for (const propertyName of assertions.required ?? []) {
      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createParenthesizedExpression(
            f.createBinaryExpression(
              f.createStringLiteral(propertyName),
              f.createToken(ts.SyntaxKind.InKeyword),
              f.createIdentifier("value"),
            ),
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    /**
     * loop through all the properties to validate em
     */
    yield f.createForInStatement(
      f.createVariableDeclarationList(
        [f.createVariableDeclaration(f.createIdentifier("propertyName"))],
        ts.NodeFlags.Const,
      ),
      f.createIdentifier("value"),
      f.createBlock(
        [...this.generateMapTypeItemValidationStatements(nodeId)],
        true,
      ),
    );

    /**
     * property count validation
     */
    if (hasPropertyCounter) {
      if (assertions.minimumProperties != null) {
        yield f.createIfStatement(
          f.createBinaryExpression(
            f.createIdentifier("propertyCount"),
            f.createToken(ts.SyntaxKind.LessThanToken),
            f.createNumericLiteral(assertions.minimumProperties),
          ),
          f.createBlock([f.createReturnStatement(f.createFalse())], true),
        );
      }

      if (assertions.maximumProperties != null) {
        yield f.createIfStatement(
          f.createBinaryExpression(
            f.createIdentifier("propertyCount"),
            f.createToken(ts.SyntaxKind.GreaterThanToken),
            f.createNumericLiteral(assertions.maximumProperties),
          ),
          f.createBlock([f.createReturnStatement(f.createFalse())], true),
        );
      }
    }

    yield f.createReturnStatement(f.createTrue());
  }
  private *generateMapTypeItemValidationStatements(nodeId: string) {
    const { factory: f } = this;
    const node = this.nodes[nodeId];
    const assertions = node.assertions.map ?? {};

    const hasPropertyCounter =
      assertions.minimumProperties != null ||
      assertions.maximumProperties != null;

    if (hasPropertyCounter) {
      yield f.createExpressionStatement(
        f.createPostfixUnaryExpression(
          f.createIdentifier("propertyCount"),
          ts.SyntaxKind.PlusPlusToken,
        ),
      );
    }

    yield f.createVariableStatement(
      undefined,
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier("propertyValue"),
            undefined,
            undefined,
            f.createElementAccessExpression(
              f.createIdentifier("value"),
              f.createAsExpression(
                f.createIdentifier("propertyName"),
                f.createTypeOperatorNode(
                  ts.SyntaxKind.KeyOfKeyword,
                  f.createTypeQueryNode(f.createIdentifier("value")),
                ),
              ),
            ),
          ),
        ],
        ts.NodeFlags.Const,
      ),
    );

    if (node.applicators.objectProperties != null) {
      yield f.createSwitchStatement(
        f.createIdentifier("propertyName"),
        f.createCaseBlock([
          ...this.generateMapTypeItemCaseClausesValidationStatements(nodeId),
        ]),
      );
    }

    if (node.applicators.patternProperties != null) {
      for (const [pattern, typeNodeId] of Object.entries(
        node.applicators.patternProperties,
      )) {
        const typeName = this.getTypeName(typeNodeId);

        yield f.createIfStatement(
          f.createCallExpression(
            f.createPropertyAccessExpression(
              this.createRegExpExpression(pattern),
              f.createIdentifier("test"),
            ),
            undefined,
            [f.createIdentifier("propertyName")],
          ),
          f.createBlock(
            [
              f.createIfStatement(
                f.createPrefixUnaryExpression(
                  ts.SyntaxKind.ExclamationToken,
                  f.createCallExpression(
                    f.createIdentifier(`is${typeName}`),
                    undefined,
                    [f.createIdentifier("propertyValue")],
                  ),
                ),
                f.createBlock([f.createReturnStatement(f.createFalse())], true),
              ),
              f.createContinueStatement(),
            ],
            true,
          ),
        );
      }
    }

    if (node.applicators.propertyNames != null) {
      const typeName = this.getTypeName(node.applicators.propertyNames);

      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(`is${typeName}`),
            undefined,
            [f.createIdentifier("propertyName")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    if (node.applicators.mapProperties != null) {
      const typeName = this.getTypeName(node.applicators.mapProperties);

      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(`is${typeName}`),
            undefined,
            [f.createIdentifier("propertyValue")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }
  }
  private *generateMapTypeItemCaseClausesValidationStatements(
    nodeId: string,
  ): Iterable<ts.CaseOrDefaultClause> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];

    if (node.applicators.objectProperties == null) {
      return;
    }

    for (const propertyName in node.applicators.objectProperties) {
      const propertyTypeNodeId =
        node.applicators.objectProperties[propertyName];
      const typeName = this.getTypeName(propertyTypeNodeId);

      yield f.createCaseClause(f.createStringLiteral(propertyName), [
        f.createIfStatement(
          f.createPrefixUnaryExpression(
            ts.SyntaxKind.ExclamationToken,
            f.createCallExpression(
              f.createIdentifier(`is${typeName}`),
              undefined,
              [f.createIdentifier("propertyValue")],
            ),
          ),
          f.createBlock([f.createReturnStatement(f.createFalse())], true),
        ),
        f.createContinueStatement(),
      ]);
    }
  }

  protected *generateReferenceCompoundValidationStatements(
    reference: string,
  ): Iterable<ts.Statement> {
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

    yield f.createReturnStatement(f.createTrue());
  }
  protected *generateOneOfCompoundValidationStatements(
    oneOf: string[],
  ): Iterable<ts.Statement> {
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

    yield f.createReturnStatement(f.createTrue());
  }
  protected *generateAnyOfCompoundValidationStatements(
    anyOf: string[],
  ): Iterable<ts.Statement> {
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
  protected *generateAllOfCompoundValidationStatements(
    allOf: string[],
  ): Iterable<ts.Statement> {
    const { factory: f } = this;

    for (const typeNodeId of allOf) {
      const typeName = this.getTypeName(typeNodeId);

      yield f.createIfStatement(
        f.createPrefixUnaryExpression(
          ts.SyntaxKind.ExclamationToken,
          f.createCallExpression(
            f.createIdentifier(`is${typeName}`),
            undefined,
            [f.createIdentifier("value")],
          ),
        ),
        f.createBlock([f.createReturnStatement(f.createFalse())], true),
      );
    }

    yield f.createReturnStatement(f.createTrue());
  }
  protected *generateIfCompoundValidationStatements(
    $if: string,
    then?: string,
    $else?: string,
  ): Iterable<ts.Statement> {
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
                f.createCallExpression(
                  f.createIdentifier(`is${thenTypeName}`),
                  undefined,
                  [f.createIdentifier("value")],
                ),
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
                f.createCallExpression(
                  f.createIdentifier(`is${elseTypeName}`),
                  undefined,
                  [f.createIdentifier("value")],
                ),
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
                f.createCallExpression(
                  f.createIdentifier(`is${thenTypeName}`),
                  undefined,
                  [f.createIdentifier("value")],
                ),
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
          f.createCallExpression(
            f.createIdentifier(`is${typeName}`),
            undefined,
            [f.createIdentifier("value")],
          ),
        ),
        f.createBlock(
          [
            f.createIfStatement(
              f.createPrefixUnaryExpression(
                ts.SyntaxKind.ExclamationToken,
                f.createCallExpression(
                  f.createIdentifier(`is${elseTypeName}`),
                  undefined,
                  [f.createIdentifier("value")],
                ),
              ),
              f.createBlock([f.createReturnStatement(f.createFalse())], true),
            ),
          ],
          true,
        ),
      );
    }

    yield f.createReturnStatement(f.createTrue());
  }
  protected *generateNotCompoundValidationStatements(
    not: string,
  ): Iterable<ts.Statement> {
    const { factory: f } = this;
    const typeName = this.getTypeName(not);

    yield f.createIfStatement(
      f.createCallExpression(f.createIdentifier(`is${typeName}`), undefined, [
        f.createIdentifier("value"),
      ]),
      f.createBlock([f.createReturnStatement(f.createFalse())], true),
    );

    yield f.createReturnStatement(f.createTrue());
  }

  private createRegExpExpression(pattern: string) {
    const { factory } = this;
    return factory.createNewExpression(
      factory.createIdentifier("RegExp"),
      undefined,
      [factory.createStringLiteral(pattern)],
    );
  }
}
