import * as core from "@jns42/core";
import { Node, SchemaJson, getLastValidationError, isSchemaJson } from "@jns42/schema-intermediate";
import { DocumentBase } from "../document-base.js";

export class Document extends DocumentBase<SchemaJson> {
  constructor(
    public readonly documentNodeLocation: core.NodeLocation,
    documentNode: unknown,
  ) {
    super(documentNode);
  }

  protected assertDocumentNode(node: unknown): asserts node is SchemaJson {
    if (!isSchemaJson(node)) {
      const validationError = getLastValidationError();
      throw new TypeError(`rule ${validationError.rule} failed for ${validationError.path}`);
    }
  }

  public getIntermediateNodeEntries(): Iterable<readonly [string, Node]> {
    return Object.entries(this.documentNode.schemas);
  }

  public getNodeLocations(): Iterable<core.NodeLocation> {
    return Object.keys(this.documentNode.schemas).map((value) => core.NodeLocation.parse(value));
  }
}
