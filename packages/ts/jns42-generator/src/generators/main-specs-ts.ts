import ts from "typescript";
import * as models from "../models/index.js";
import { itt, nestedTextFromTs } from "../utils/index.js";
import { generateLiteral } from "../utils/literal.js";
import { CodeGeneratorBase } from "./code-generator-base.js";

export function* generateMainSpecTsCode(specification: models.Specification) {
  const { names, nodes } = specification;
  const { factory } = ts;

  const codeGenerator = new MainSpecsTsCodeGenerator(factory, names, nodes);
  const code = codeGenerator.getCode();

  return code;
}

class MainSpecsTsCodeGenerator extends CodeGeneratorBase {
  public *getCode() {
    yield itt`
      import assert from "node:assert/strict";
      import test from "node:test";
      import * as main from "./main.js";
    `;

    for (const nodeId in this.nodes) {
      const statements = this.generateTestStatement(nodeId);
      yield* nestedTextFromTs(this.factory, statements);
    }
  }

  protected *generateTestStatement(nodeId: string) {
    const { factory: f } = this;

    const typeName = this.getTypeName(nodeId);

    const assertStatements = [...this.generateAssertStatements(nodeId)];

    if (assertStatements.length === 0) return;

    yield f.createExpressionStatement(
      f.createCallExpression(f.createIdentifier("test"), undefined, [
        f.createStringLiteral(typeName),
        f.createArrowFunction(
          undefined,
          undefined,
          [
            f.createParameterDeclaration(
              undefined,
              undefined,
              f.createIdentifier("t"),
              undefined,
              undefined,
              undefined,
            ),
          ],
          undefined,
          f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
          f.createBlock(assertStatements, true),
        ),
      ]),
    );
  }

  protected *generateAssertStatements(nodeId: string): Iterable<ts.Statement> {
    const { factory: f } = this;
    const node = this.nodes[nodeId];

    const typeName = this.getTypeName(nodeId);

    for (const example of node.metadata.examples ?? []) {
      yield f.createExpressionStatement(
        f.createCallExpression(
          f.createPropertyAccessExpression(
            f.createIdentifier("assert"),
            f.createIdentifier("equal"),
          ),
          undefined,
          [
            f.createCallExpression(
              f.createPropertyAccessExpression(
                f.createIdentifier("main"),
                f.createIdentifier(`is${typeName}`),
              ),
              undefined,
              [generateLiteral(f, example)],
            ),
            f.createTrue(),
          ],
        ),
      );
    }
  }
}
