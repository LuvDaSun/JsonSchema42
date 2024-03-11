import {
  Node,
  SchemaDocument,
  getLastValidationError,
  isSchemaDocument,
} from "@jns42/schema-intermediate";
import { NodeLocation } from "../../utils/index.js";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<SchemaDocument> {
  constructor(
    public readonly documentNodeLocation: NodeLocation,
    documentNode: unknown,
  ) {
    super(documentNode);
  }

  protected assertDocumentNode(node: unknown): asserts node is SchemaDocument {
    if (!isSchemaDocument(node)) {
      const validationError = getLastValidationError();
      throw new TypeError(`rule ${validationError.rule} failed for ${validationError.path}`);
    }
  }

  public getIntermediateNodeEntries(): Iterable<readonly [string, Node]> {
    return Object.entries(this.documentNode.schemas);
  }

  public getNodeLocations(): Iterable<NodeLocation> {
    return Object.keys(this.documentNode.schemas).map((value) => NodeLocation.parse(value));
  }
}
