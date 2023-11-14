import ts from "typescript";

export function formatData(content: unknown) {
  return JSON.stringify(content, undefined, 2);
}

export function formatStatements(factory: ts.NodeFactory, statements: Iterable<ts.Statement>) {
  const banner = `
// @generated by
//     __             _____     _                 ___ ___ 
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
//                                 -- www.JsonSchema42.org
`.trim();

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  const sourceFile = factory.createSourceFile(
    [...statements],
    factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );

  return `${banner}\n\n${printer.printFile(sourceFile)}`;
}
