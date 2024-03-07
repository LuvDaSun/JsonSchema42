import * as schemaIntermediate from "@jns42/schema-intermediate";
import { NodeLocation } from "../utils/index.js";
import { DocumentBase } from "./document-base.js";
import { DocumentContext } from "./document-context.js";

export interface EmbeddedDocument {
  retrievalLocation: NodeLocation;
  givenLocation: NodeLocation;
}

export interface ReferencedDocument {
  retrievalLocation: NodeLocation;
  givenLocation: NodeLocation;
}

export abstract class SchemaDocumentBase<N = unknown> extends DocumentBase<N> {
  /**
   * The unique url for this document, possibly derived from the node. This
   * is not necessarily the location where the document was retrieved from.
   */
  public readonly documentNodeLocation: NodeLocation;
  /**
   * All nodes in the document, indexed by pointer
   */
  public readonly nodes = new Map<string, N>();

  public readonly referencedDocuments = new Array<ReferencedDocument>();
  public readonly embeddedDocuments = new Array<EmbeddedDocument>();

  /**
   * Constructor for creating new documents
   * @param givenUrl url that is derived from the referencing document
   * @param antecedentUrl url of referencing, parent, preceding document
   * @param documentNode the actual document
   */
  constructor(
    retrievalUrl: NodeLocation,
    givenUrl: NodeLocation,
    public readonly antecedentUrl: NodeLocation | null,
    documentNode: unknown,
    protected context: DocumentContext,
  ) {
    super(documentNode);

    const maybeDocumentNodeUrl = this.getDocumentNodeUrl();
    const documentNodeUrl = maybeDocumentNodeUrl ?? givenUrl;
    this.documentNodeLocation = documentNodeUrl;

    const queue = new Array<readonly [string[], N]>();
    queue.push([[], this.documentNode]);

    let pair: readonly [string[], N] | undefined;
    while ((pair = queue.shift()) != null) {
      const [nodePointer, node] = pair;

      this.nodes.set(this.documentNodeLocation.pushPointer(...nodePointer).toString(), node);

      const nodeRef = this.selectNodeRef(node);
      if (nodeRef != null) {
        const nodeRefLocation = NodeLocation.parse(nodeRef);
        this.referencedDocuments.push({
          retrievalLocation: retrievalUrl.join(nodeRefLocation),
          givenLocation: documentNodeUrl.join(nodeRefLocation),
        });
      }

      for (const [subNodePointer, subNode] of this.selectSubNodes(nodePointer, node)) {
        const subNodeId = this.selectNodeId(subNode);
        if (subNodeId != null) {
          const subNodeLocation = NodeLocation.parse(subNodeId);
          this.embeddedDocuments.push({
            retrievalLocation: retrievalUrl.join(subNodeLocation),
            givenLocation: documentNodeUrl.join(subNodeLocation),
          });
          continue;
        }

        queue.push([subNodePointer, subNode]);
      }
    }
  }

  protected getDocumentNodeUrl(): NodeLocation | null {
    const nodeId = this.selectNodeId(this.documentNode);
    if (nodeId == null) {
      return null;
    }
    const nodeLocation = NodeLocation.parse(nodeId);

    const documentNodeUrl =
      this.antecedentUrl == null ? nodeLocation : this.antecedentUrl.join(nodeLocation);

    return documentNodeUrl;
  }

  /**
   * All unique node urls that this document contains
   */
  public *getNodeUrls(): Iterable<NodeLocation> {
    for (const [nodeId] of this.nodes) {
      yield NodeLocation.parse(nodeId);
    }
  }

  public getNodeByUrl(nodeUrl: NodeLocation) {
    const nodeId = nodeUrl.toString();
    const node = this.nodes.get(nodeId);
    if (node == null) {
      throw new TypeError(`node not found ${nodeUrl.toString()}`);
    }
    return node;
  }

  public getNodeByPointer(nodePointer: string[]) {
    const nodeUrl = this.documentNodeLocation.pushPointer(...nodePointer);
    return this.getNodeByUrl(nodeUrl);
  }

  protected *getAntecedentDocuments(): Iterable<SchemaDocumentBase> {
    let currentDocument: SchemaDocumentBase = this;
    while (currentDocument.antecedentUrl != null) {
      const maybeNextDocument = this.context.getDocument(currentDocument.antecedentUrl);
      if (!(maybeNextDocument instanceof SchemaDocumentBase)) {
        break;
      }
      currentDocument = maybeNextDocument;
      yield currentDocument;
    }
  }

  public *getIntermediateNodeEntries(): Iterable<readonly [string, schemaIntermediate.Node]> {
    for (const [nodeId, node] of this.nodes) {
      const nodeUrl = NodeLocation.parse(nodeId);
      const nodePointer = nodeUrl.pointer;

      const metadata = this.getIntermediateMetadataPart(nodePointer, node);
      const types = this.getIntermediateTypesPart(nodePointer, node);
      const assertions = this.getIntermediateAssertionsPart(nodePointer, node);
      const applicators = this.getIntermediateApplicatorsPart(nodePointer, node);

      yield [
        nodeId,
        {
          ...metadata,
          ...types,
          ...assertions,
          ...applicators,
        },
      ];
    }
  }
  protected getIntermediateMetadataPart(nodePointer: string[], node: N) {
    const title = this.selectNodeTitle(node);
    const description = this.selectNodeDescription(node);
    const deprecated = this.selectNodeDeprecated(node);
    const examples = this.selectNodeExamples(node);

    return {
      deprecated,
      title,
      description,
      examples,
    };
  }
  protected getIntermediateTypesPart(nodePointer: string[], node: N) {
    let types = new Array<schemaIntermediate.TypesItems>();

    if (node === true) {
      types = ["any"];
    } else if (node === false) {
      types = ["never"];
    } else {
      types = (this.selectNodeTypes(node) ?? [])
        .filter((type) => type != null)
        .map((type) => type!)
        .map((type) => this.mapType(type));
    }

    if (types.length === 0) {
      return {};
    }

    return { types };
  }

  protected getIntermediateAssertionsPart(nodePointer: string[], node: N) {
    const enumValues = this.selectValidationEnum(node);
    const constValue = this.selectValidationConst(node);

    let options: Array<any> | undefined;

    if (constValue != null) {
      options = [constValue];
    } else if (enumValues != null) {
      options = enumValues;
    }
    const minimumInclusive = this.selectValidationMinimumInclusive(node);
    const minimumExclusive = this.selectValidationMinimumExclusive(node);
    const maximumInclusive = this.selectValidationMaximumInclusive(node);
    const maximumExclusive = this.selectValidationMaximumExclusive(node);
    const multipleOf = this.selectValidationMultipleOf(node);

    const minimumLength = this.selectValidationMinimumLength(node);
    const maximumLength = this.selectValidationMaximumLength(node);
    const valuePattern = this.selectValidationValuePattern(node);
    const valueFormat = this.selectValidationValueFormat(node);

    const minimumItems = this.selectValidationMinimumItems(node);
    const maximumItems = this.selectValidationMaximumItems(node);
    const uniqueItems = this.selectValidationUniqueItems(node);

    const minimumProperties = this.selectValidationMinimumProperties(node);
    const maximumProperties = this.selectValidationMaximumProperties(node);
    const required = this.selectValidationRequired(node);

    return {
      options,

      minimumInclusive,
      minimumExclusive,
      maximumInclusive,
      maximumExclusive,
      multipleOf,

      minimumLength,
      maximumLength,
      valuePattern,
      valueFormat,

      maximumItems,
      minimumItems,
      uniqueItems,

      minimumProperties,
      maximumProperties,
      required,
    };
  }
  protected getIntermediateApplicatorsPart(nodePointer: string[], node: N) {
    const reference = this.getIntermediateReference(nodePointer, node);
    const allOf = this.mapEntriesToManyNodeIds(nodePointer, node, [
      ...this.selectSubNodeAllOfEntries(nodePointer, node),
    ]);
    const anyOf = this.mapEntriesToManyNodeIds(nodePointer, node, [
      ...this.selectSubNodeAnyOfEntries(nodePointer, node),
    ]);
    const oneOf = this.mapEntriesToManyNodeIds(nodePointer, node, [
      ...this.selectSubNodeOneOfEntries(nodePointer, node),
    ]);

    const not = this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeNotEntries(nodePointer, node),
    ]);
    const $if = this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeIfEntries(nodePointer, node),
    ]);
    const then = this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeThenEntries(nodePointer, node),
    ]);
    const $else = this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeElseEntries(nodePointer, node),
    ]);

    const dependentSchemas = this.mapPointerEntriesRecord(nodePointer, node, [
      ...this.selectNodeDependentSchemasPointerEntries(nodePointer, node),
    ]);

    const tupleItems = this.mapEntriesToManyNodeIds(nodePointer, node, [
      ...this.selectSubNodeTupleItemsEntries(nodePointer, node),
    ]);
    const arrayItems = this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeArrayItemsEntries(nodePointer, node),
    ]);
    const contains = this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeContainsEntries(nodePointer, node),
    ]);

    const objectProperties = this.mapPointerEntriesRecord(nodePointer, node, [
      ...this.selectNodePropertiesPointerEntries(nodePointer, node),
    ]);
    const mapProperties = this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeMapPropertiesEntries(nodePointer, node),
    ]);
    const patternProperties = this.mapPointerEntriesRecord(nodePointer, node, [
      ...this.selectNodePatternPropertyPointerEntries(nodePointer, node),
    ]);
    const propertyNames = this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodePropertyNamesEntries(nodePointer, node),
    ]);

    return {
      reference,
      allOf,
      anyOf,
      oneOf,
      not,
      if: $if,
      then,
      else: $else,
      dependentSchemas,
      tupleItems,
      arrayItems,
      contains,
      objectProperties,
      mapProperties,
      patternProperties,
      propertyNames,
    };
  }

  //#region intermediate applicators

  protected abstract getIntermediateReference(
    nodePointer: string[],
    node: N,
  ): schemaIntermediate.Reference | undefined;

  //#endregion

  //#region selectors

  protected *selectSubNodes(nodePointer: string[], node: N): Iterable<readonly [string[], N]> {
    yield* this.selectSubNodeDefinitionsEntries(nodePointer, node);
    yield* this.selectSubNodeObjectPropertyEntries(nodePointer, node);
    yield* this.selectSubNodeMapPropertiesEntries(nodePointer, node);
    yield* this.selectSubNodePatternPropertiesEntries(nodePointer, node);
    yield* this.selectSubNodePropertyNamesEntries(nodePointer, node);
    yield* this.selectSubNodeTupleItemsEntries(nodePointer, node);
    yield* this.selectSubNodeArrayItemsEntries(nodePointer, node);
    yield* this.selectSubNodeContainsEntries(nodePointer, node);
    yield* this.selectSubNodeAllOfEntries(nodePointer, node);
    yield* this.selectSubNodeAnyOfEntries(nodePointer, node);
    yield* this.selectSubNodeOneOfEntries(nodePointer, node);
    yield* this.selectSubNodeNotEntries(nodePointer, node);
    yield* this.selectSubNodeIfEntries(nodePointer, node);
    yield* this.selectSubNodeThenEntries(nodePointer, node);
    yield* this.selectSubNodeElseEntries(nodePointer, node);
  }

  protected abstract selectNodeSchema(node: N): string | undefined;
  protected abstract selectNodeId(node: N): string | undefined;
  protected abstract selectNodeRef(node: N): string | undefined;

  protected abstract selectNodeTitle(node: N): string | undefined;
  protected abstract selectNodeDescription(node: N): string | undefined;
  protected abstract selectNodeDeprecated(node: N): boolean | undefined;
  protected abstract selectNodeExamples(node: N): any[] | undefined;

  protected abstract selectNodeTypes(node: N): string[] | undefined;

  protected abstract selectValidationMaximumProperties(node: N): number | undefined;
  protected abstract selectValidationMinimumProperties(node: N): number | undefined;
  protected abstract selectValidationRequired(node: N): string[] | undefined;
  protected abstract selectValidationMinimumItems(node: N): number | undefined;
  protected abstract selectValidationMaximumItems(node: N): number | undefined;
  protected abstract selectValidationUniqueItems(node: N): boolean | undefined;
  protected abstract selectValidationMinimumLength(node: N): number | undefined;
  protected abstract selectValidationMaximumLength(node: N): number | undefined;
  protected abstract selectValidationValuePattern(node: N): string | undefined;
  protected abstract selectValidationValueFormat(node: N): string | undefined;
  protected abstract selectValidationMinimumInclusive(node: N): number | undefined;
  protected abstract selectValidationMinimumExclusive(node: N): number | undefined;
  protected abstract selectValidationMaximumInclusive(node: N): number | undefined;
  protected abstract selectValidationMaximumExclusive(node: N): number | undefined;
  protected abstract selectValidationMultipleOf(node: N): number | undefined;
  protected abstract selectValidationConst(node: N): any | undefined;
  protected abstract selectValidationEnum(node: N): any[] | undefined;

  protected abstract selectNodePropertiesPointerEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string, string[]]>;
  protected abstract selectNodeDependentSchemasPointerEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string, string[]]>;
  protected abstract selectNodePatternPropertyPointerEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string, string[]]>;

  protected abstract selectSubNodeDefinitionsEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeObjectPropertyEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeMapPropertiesEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodePatternPropertiesEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodePropertyNamesEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeTupleItemsEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeArrayItemsEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeContainsEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeAllOfEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeAnyOfEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeOneOfEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeNotEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeIfEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeThenEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;
  protected abstract selectSubNodeElseEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]>;

  //#endregion

  //#region helpers

  protected mapPointerEntriesRecord(
    nodePointer: string[],
    node: N,
    entries: Array<readonly [string, string[]]>,
  ): Record<string, string> | undefined {
    if (entries.length > 0) {
      const nodeIds = Object.fromEntries(
        entries.map(([key, nodePointer]) => {
          const nodeUrl = this.documentNodeLocation.pushPointer(...nodePointer);
          const nodeId = String(nodeUrl);
          return [key, nodeId];
        }),
      );
      return nodeIds;
    }
  }

  protected mapEntriesToManyNodeIds(
    nodePointer: string[],
    node: N,
    entries: Array<readonly [string[], N]>,
  ): Array<string> | undefined {
    if (entries.length > 0) {
      const nodeIds = entries.map(([nodePointer]) => {
        const nodeUrl = this.documentNodeLocation.pushPointer(...nodePointer);
        const nodeId = String(nodeUrl);
        return nodeId;
      });
      return nodeIds;
    }
  }

  protected mapEntriesToSingleNodeId(
    nodePointer: string[],
    node: N,
    entries: Array<readonly [string[], N]>,
  ): string | undefined {
    for (const [nodePointer] of entries) {
      const nodeUrl = this.documentNodeLocation.pushPointer(...nodePointer);
      const nodeId = String(nodeUrl);
      return nodeId;
    }
  }

  protected mapType(type: string) {
    switch (type) {
      case "never":
        return "never";
      case "any":
        return "any";
      case "null":
        return "null";
      case "boolean":
        return "boolean";
      case "integer":
        return "integer";
      case "number":
        return "number";
      case "string":
        return "string";
      case "array":
        return "array";
      case "object":
        return "map";
      default:
        throw new Error("unexpected type");
    }
  }

  //#endregion
}
