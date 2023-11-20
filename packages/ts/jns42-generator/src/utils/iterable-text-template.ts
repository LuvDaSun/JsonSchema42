import ts from "typescript";

export type NestedText = Iterable<NestedText> | string;

export function* iterableTextTemplate(
  strings: TemplateStringsArray,
  ...values: NestedText[]
): Iterable<NestedText> {
  for (let index = 0; index < strings.length + values.length; index++) {
    if (index % 2 === 0) {
      yield strings[index / 2];
    } else {
      const value = values[(index - 1) / 2];
      yield value;
    }
  }
}

export const itt = iterableTextTemplate;

export function* flattenNestedText(nestedText: NestedText): Iterable<string> {
  if (typeof nestedText === "string") {
    yield nestedText;
  } else {
    for (const text of nestedText) {
      yield* flattenNestedText(text);
    }
  }
}

/**
 * temporary helper function, should be factored out
 */
export function nestedTextFromTs(factory: ts.NodeFactory, statements: Iterable<ts.Statement>) {
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
  });

  const sourceFile = factory.createSourceFile(
    [...statements],
    factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );

  return printer.printFile(sourceFile);
}
