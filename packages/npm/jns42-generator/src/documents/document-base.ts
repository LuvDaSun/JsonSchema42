import * as schemaIntermediate from "@jns42/schema-intermediate";
import { JsonLocation } from "../utils/index.js";

export abstract class DocumentBase<N = unknown> {
  public abstract readonly documentNodeUrl: JsonLocation;
  public readonly documentNode: N;

  constructor(documentNode: unknown) {
    this.assertDocumentNode(documentNode);
    this.documentNode = documentNode;
  }

  public abstract getIntermediateNodeEntries(): Iterable<
    readonly [string, schemaIntermediate.Node]
  >;

  public abstract getNodeUrls(): Iterable<JsonLocation>;

  protected abstract assertDocumentNode(node: unknown): asserts node is N;
}
