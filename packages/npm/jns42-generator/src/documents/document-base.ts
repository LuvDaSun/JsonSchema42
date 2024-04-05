import * as core from "@jns42/core";
import * as schemaIntermediate from "@jns42/schema-intermediate";

export abstract class DocumentBase<N = unknown> {
  public abstract readonly documentNodeLocation: core.NodeLocation;
  public readonly documentNode: N;

  constructor(documentNode: unknown) {
    this.assertDocumentNode(documentNode);
    this.documentNode = documentNode;
  }

  public abstract getIntermediateNodeEntries(): Iterable<
    readonly [string, schemaIntermediate.Node]
  >;

  public abstract getNodeLocations(): Iterable<core.NodeLocation>;

  protected abstract assertDocumentNode(node: unknown): asserts node is N;
}
