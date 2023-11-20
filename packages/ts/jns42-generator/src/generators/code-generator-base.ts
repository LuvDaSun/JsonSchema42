import * as schemaIntermediateB from "@jns42/jns42-schema-intermediate-b";
import ts from "typescript";

export abstract class CodeGeneratorBase {
  constructor(
    protected readonly factory: ts.NodeFactory,
    protected readonly names: Record<string, string>,
    protected readonly nodes: Record<string, schemaIntermediateB.Node>,
  ) {}

  protected getTypeName(nodeId: string) {
    const name = this.names[nodeId];
    return name;
  }

  protected generateTypeReference(nodeId: string) {
    const { factory: f } = this;

    const name = this.getTypeName(nodeId);
    return f.createTypeReferenceNode(f.createIdentifier(name));
  }

  protected joinExpressions(
    expressions: ts.Expression[],
    glue: ts.BinaryOperator | ts.BinaryOperatorToken,
  ) {
    const { factory: f } = this;

    if (expressions.length === 1) {
      return expressions[0];
    }

    return expressions.reduce((a, b) => f.createBinaryExpression(a, glue, b));
  }

  protected nestedTextFromTs(statements: Iterable<ts.Statement>) {
    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
    });

    const sourceFile = this.factory.createSourceFile(
      [...statements],
      this.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None,
    );

    return printer.printFile(sourceFile);
  }
}
