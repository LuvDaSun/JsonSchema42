import { Node, SchemaDocument, isSchemaDocument } from "schema-intermediate";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<SchemaDocument> {
  constructor(
    public readonly documentNodeUrl: URL,
    documentNode: unknown,
  ) {
    super(documentNode);
  }

  protected isDocumentNode(node: unknown): node is SchemaDocument {
    return isSchemaDocument(node);
  }

  public getIntermediateNodeEntries(): Iterable<readonly [string, Node]> {
    return Object.entries(this.documentNode.schemas);
  }

  public getNodeUrls(): Iterable<URL> {
    return Object.keys(this.documentNode.schemas).map((id) => new URL(id));
  }

  public pointerToNodeHash(nodePointer: string): string {
    throw new Error("Method not implemented.");
  }
  public nodeHashToPointer(nodeHash: string): string {
    throw new Error("Method not implemented.");
  }
}
