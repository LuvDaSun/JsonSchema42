import * as schemaIntermediateB from "@jns42/jns42-schema-intermediate-b";
import { DocumentBase } from "./document-base.js";
import { DocumentContext } from "./document-context.js";

export interface EmbeddedDocument {
  retrievalUrl: URL;
  givenUrl: URL;
  node: unknown;
}

export interface ReferencedDocument {
  retrievalUrl: URL;
  givenUrl: URL;
}

export abstract class SchemaDocumentBase<N = unknown> extends DocumentBase<N> {
  /**
   * The unique url for this document, possibly derived from the node. This
   * is not necessarily the location where the document was retrieved from.
   */
  public readonly documentNodeUrl: URL;
  /**
   * base pointer, this is usually ""
   */
  protected readonly documentNodePointer: string;
  /**
   * All nodes in the document, indexed by pointer
   */
  protected readonly nodes: Map<string, N>;

  /**
   * Constructor for creating new documents
   * @param givenUrl url that is derived from the referencing document
   * @param antecedentUrl url of referencing, parent, preceding document
   * @param documentNode the actual document
   */
  constructor(
    givenUrl: URL,
    public readonly antecedentUrl: URL | null,
    documentNode: unknown,
    protected context: DocumentContext,
  ) {
    super(documentNode);

    const maybeDocumentNodeUrl = this.getDocumentNodeUrl();
    const documentNodeUrl = maybeDocumentNodeUrl ?? givenUrl;
    this.documentNodeUrl = documentNodeUrl;
    this.documentNodePointer = this.nodeUrlToPointer(documentNodeUrl);

    this.nodes = new Map(this.getNodePairs());
  }

  protected abstract isNodeEmbeddedSchema(node: N): boolean;

  /**
   * get all embedded document nodes
   */
  public *getEmbeddedDocuments(retrievalUrl: URL): Iterable<EmbeddedDocument> {
    const queue = new Array<readonly [string, N]>();
    queue.push(
      ...this.selectSubNodes(this.documentNodePointer, this.documentNode),
    );

    let pair: readonly [string, N] | undefined;
    while ((pair = queue.shift()) != null) {
      const [nodePointer, node] = pair;

      const nodeId = this.selectNodeId(node);
      if (nodeId == null || !this.isNodeEmbeddedSchema(node)) {
        queue.push(...this.selectSubNodes(nodePointer, node));

        continue;
      }
      yield {
        node,
        retrievalUrl: new URL(nodeId, retrievalUrl),
        givenUrl: new URL(nodeId, this.documentNodeUrl),
      };
    }
  }
  /**
   * get all references to other documents
   */
  public *getReferencedDocuments(
    retrievalUrl: URL,
  ): Iterable<ReferencedDocument> {
    for (const [, node] of this.nodes) {
      const nodeRef = this.selectNodeRef(node);
      if (nodeRef == null) {
        continue;
      }

      yield {
        retrievalUrl: new URL(nodeRef, retrievalUrl),
        givenUrl: new URL(nodeRef, this.documentNodeUrl),
      };

      /*
			don't emit dynamic-refs here, they are supposed to be hash-only
			urls, so they don't reference any document
			*/
    }
  }

  protected *getNodePairs(): Iterable<readonly [string, N]> {
    const queue = new Array<readonly [string, N]>();
    queue.push(
      ...this.selectSubNodes(this.documentNodePointer, this.documentNode),
    );

    yield [this.documentNodePointer, this.documentNode];

    let pair: readonly [string, N] | undefined;
    while ((pair = queue.shift()) != null) {
      const [nodePointer, node] = pair;

      const nodeId = this.selectNodeId(node);
      if (nodeId == null || nodeId.startsWith("#")) {
        queue.push(...this.selectSubNodes(nodePointer, node));

        yield pair;
      }
    }
  }

  protected getDocumentNodeUrl(): URL | null {
    const nodeId = this.selectNodeId(this.documentNode);
    if (nodeId == null) {
      return null;
    }
    const nodeUrl =
      this.antecedentUrl == null
        ? new URL(nodeId)
        : new URL(nodeId, this.antecedentUrl);
    return nodeUrl;
  }

  public nodeUrlToPointer(nodeUrl: URL): string {
    if (nodeUrl.origin !== this.documentNodeUrl.origin) {
      throw new TypeError("origins should match");
    }
    return this.nodeHashToPointer(nodeUrl.hash);
  }

  /**
   * All unique node urls that this document contains
   */
  public *getNodeUrls(): Iterable<URL> {
    for (const [nodePointer] of this.nodes) {
      yield this.pointerToNodeUrl(nodePointer);
    }
  }

  public getNodeByUrl(nodeUrl: URL) {
    const nodePointer = this.nodeUrlToPointer(nodeUrl);
    return this.getNodeByPointer(nodePointer);
  }

  public getNodeByPointer(nodePointer: string) {
    const node = this.nodes.get(nodePointer);
    if (node == null) {
      throw new TypeError(`node not found ${nodePointer}`);
    }
    return node;
  }

  protected *getAntecedentDocuments(): Iterable<SchemaDocumentBase> {
    let currentDocument: SchemaDocumentBase = this;
    while (currentDocument.antecedentUrl != null) {
      const maybeNextDocument = this.context.getDocument(
        currentDocument.antecedentUrl,
      );
      if (!(maybeNextDocument instanceof SchemaDocumentBase)) {
        break;
      }
      currentDocument = maybeNextDocument;
      yield currentDocument;
    }
  }

  public *getIntermediateNodeEntries(): Iterable<
    readonly [string, schemaIntermediateB.Node]
  > {
    for (const [nodePointer, node] of this.nodes) {
      const nodeUrl = this.pointerToNodeUrl(nodePointer);
      const nodeId = nodeUrl.toString();

      const metadata = this.getIntermediateMetadataSection(nodePointer, node);
      const types = this.getIntermediateTypesSection(nodePointer, node);
      const assertions = this.getIntermediateAssertionsSection(
        nodePointer,
        node,
      );
      const applicators = this.getIntermediateApplicatorsSection(
        nodePointer,
        node,
      );

      yield [
        nodeId,
        {
          metadata,
          types,
          assertions,
          applicators,
        },
      ];
    }
  }
  protected getIntermediateMetadataSection(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.MetadataSection {
    const title = this.selectNodeTitle(node) ?? "";
    const description = this.selectNodeDescription(node) ?? "";
    const deprecated = this.selectNodeDeprecated(node) ?? false;
    const examples = this.selectNodeExamples(node) ?? [];

    return {
      deprecated,
      title,
      description,
      examples,
    };
  }
  protected getIntermediateTypesSection(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.TypesSection {
    if (node === true) {
      return ["any"];
    }

    if (node === false) {
      return ["never"];
    }

    const types = this.selectNodeTypes(node);
    if (types != null) {
      return types
        .filter((type) => type != null)
        .map((type) => type!)
        .map((type) => this.mapType(type));
    }

    return this.guessTypes(node);
  }

  protected getIntermediateAssertionsSection(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.AssertionsSection {
    const booleanAssertions = this.getIntermediateBooleanAssertion(
      nodePointer,
      node,
    );
    const integerAssertions = this.getIntermediateIntegerAssertion(
      nodePointer,
      node,
    );
    const numberAssertions = this.getIntermediateNumberAssertion(
      nodePointer,
      node,
    );
    const stringAssertions = this.getIntermediateStringAssertion(
      nodePointer,
      node,
    );
    const arrayAssertions = this.getIntermediateArrayAssertion(
      nodePointer,
      node,
    );
    const mapAssertions = this.getIntermediateMapAssertion(nodePointer, node);

    return {
      boolean: booleanAssertions,
      integer: integerAssertions,
      number: numberAssertions,
      string: stringAssertions,
      array: arrayAssertions,
      map: mapAssertions,
    };
  }
  protected getIntermediateApplicatorsSection(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.ApplicatorsSection {
    const reference = this.getIntermediateReference(nodePointer, node);
    const allOf = this.getIntermediateAllOf(nodePointer, node);
    const anyOf = this.getIntermediateAnyOf(nodePointer, node);
    const oneOf = this.getIntermediateOneOf(nodePointer, node);

    const not = this.getIntermediateNot(nodePointer, node);
    const $if = this.getIntermediateIf(nodePointer, node);
    const then = this.getIntermediateThen(nodePointer, node);
    const $else = this.getIntermediateElse(nodePointer, node);

    const dependentSchemas = this.getIntermediateDependentSchemas(
      nodePointer,
      node,
    );

    const tupleItems = this.getIntermediateTupleItems(nodePointer, node);
    const arrayItems = this.getIntermediateArrayItems(nodePointer, node);
    const contains = this.getIntermediateContains(nodePointer, node);

    const objectProperties = this.getIntermediateObjectProperties(
      nodePointer,
      node,
    );
    const mapProperties = this.getIntermediateMapProperties(nodePointer, node);
    const patternProperties = this.getIntermediatePatternProperties(
      nodePointer,
      node,
    );
    const propertyNames = this.getIntermediatePropertyNames(nodePointer, node);

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

  //#region intermediate assertions

  protected getIntermediateBooleanAssertion(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.BooleanAssertion | undefined {
    const enumValues = this.selectValidationEnum(node);
    const constValue = this.selectValidationConst(node);

    let options: Array<boolean> | undefined;

    if (constValue != null && typeof constValue === "boolean") {
      options = [constValue];
    } else if (enumValues != null) {
      options = [...enumValues].filter((value) => typeof value === "boolean");
    }

    return {
      options,
    };
  }
  protected getIntermediateIntegerAssertion(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.IntegerAssertion | undefined {
    const enumValues = this.selectValidationEnum(node);
    const constValue = this.selectValidationConst(node);

    let options: Array<number> | undefined;

    if (constValue != null && typeof constValue === "number") {
      options = [constValue];
    } else if (enumValues != null) {
      options = [...enumValues].filter((value) => typeof value === "number");
    }

    const minimumInclusive = this.selectValidationMinimumInclusive(node);
    const minimumExclusive = this.selectValidationMinimumExclusive(node);
    const maximumInclusive = this.selectValidationMaximumInclusive(node);
    const maximumExclusive = this.selectValidationMaximumExclusive(node);
    const multipleOf = this.selectValidationMultipleOf(node);

    return {
      options,
      minimumInclusive,
      minimumExclusive,
      maximumInclusive,
      maximumExclusive,
      multipleOf,
    };
  }
  protected getIntermediateNumberAssertion(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.NumberAssertion | undefined {
    const enumValues = this.selectValidationEnum(node);
    const constValue = this.selectValidationConst(node);

    let options: Array<number> | undefined;

    if (constValue != null && typeof constValue === "number") {
      options = [constValue];
    } else if (enumValues != null) {
      options = [...enumValues].filter((value) => typeof value === "number");
    }

    const minimumInclusive = this.selectValidationMinimumInclusive(node);
    const minimumExclusive = this.selectValidationMinimumExclusive(node);
    const maximumInclusive = this.selectValidationMaximumInclusive(node);
    const maximumExclusive = this.selectValidationMaximumExclusive(node);
    const multipleOf = this.selectValidationMultipleOf(node);

    return {
      options,
      minimumInclusive,
      minimumExclusive,
      maximumInclusive,
      maximumExclusive,
      multipleOf,
    };
  }
  protected getIntermediateStringAssertion(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.StringAssertion | undefined {
    const enumValues = this.selectValidationEnum(node);
    const constValue = this.selectValidationConst(node);

    let options: Array<string> | undefined;

    if (constValue != null && typeof constValue === "string") {
      options = [constValue];
    } else if (enumValues != null) {
      options = [...enumValues].filter((value) => typeof value === "string");
    }

    const minimumLength = this.selectValidationMinimumLength(node);
    const maximumLength = this.selectValidationMaximumLength(node);
    const valuePattern = this.selectValidationValuePattern(node);
    const valueFormat = this.selectValidationValueFormat(node);

    return {
      options,
      minimumLength,
      maximumLength,
      valuePattern,
      valueFormat,
    };
  }
  protected getIntermediateArrayAssertion(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.ArrayAssertion | undefined {
    const minimumItems = this.selectValidationMinimumItems(node);
    const maximumItems = this.selectValidationMaximumItems(node);
    const uniqueItems = this.selectValidationUniqueItems(node) ?? false;

    return {
      maximumItems,
      minimumItems,
      uniqueItems,
    };
  }
  protected getIntermediateMapAssertion(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.MapAssertion | undefined {
    const minimumProperties = this.selectValidationMinimumProperties(node);
    const maximumProperties = this.selectValidationMaximumProperties(node);

    const required = this.selectValidationRequired(node) ?? [];

    return {
      minimumProperties,
      maximumProperties,
      required,
    };
  }

  //#endregion

  //#region intermediate applicators

  protected getIntermediateAllOf(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.AllOf | undefined {
    return this.mapEntriesToManyNodeIds(nodePointer, node, [
      ...this.selectSubNodeAllOfEntries(nodePointer, node),
    ]);
  }
  protected getIntermediateAnyOf(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.AnyOf | undefined {
    return this.mapEntriesToManyNodeIds(nodePointer, node, [
      ...this.selectSubNodeAnyOfEntries(nodePointer, node),
    ]);
  }
  protected getIntermediateOneOf(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.OneOf | undefined {
    return this.mapEntriesToManyNodeIds(nodePointer, node, [
      ...this.selectSubNodeOneOfEntries(nodePointer, node),
    ]);
  }

  protected getIntermediateNot(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.Not | undefined {
    return this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeNotEntries(nodePointer, node),
    ]);
  }

  protected getIntermediateIf(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.If | undefined {
    return this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeIfEntries(nodePointer, node),
    ]);
  }

  protected getIntermediateThen(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.Then | undefined {
    return this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeThenEntries(nodePointer, node),
    ]);
  }

  protected getIntermediateElse(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.Else | undefined {
    return this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeElseEntries(nodePointer, node),
    ]);
  }

  protected getIntermediateDependentSchemas(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.DependentSchemas | undefined {
    return this.mapPointerEntriesRecord(nodePointer, node, [
      ...this.selectNodeDependentSchemasPointerEntries(nodePointer, node),
    ]);
  }

  protected getIntermediateTupleItems(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.TupleItems | undefined {
    return this.mapEntriesToManyNodeIds(nodePointer, node, [
      ...this.selectSubNodeTupleItemsEntries(nodePointer, node),
    ]);
  }

  protected getIntermediateArrayItems(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.ArrayItems | undefined {
    return this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeArrayItemsEntries(nodePointer, node),
    ]);
  }

  protected getIntermediateContains(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.Contains | undefined {
    return this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeContainsEntries(nodePointer, node),
    ]);
  }

  protected getIntermediateObjectProperties(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.ObjectProperties | undefined {
    return this.mapPointerEntriesRecord(nodePointer, node, [
      ...this.selectNodePropertiesPointerEntries(nodePointer, node),
    ]);
  }

  protected getIntermediateMapProperties(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.MapProperties | undefined {
    return this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodeMapPropertiesEntries(nodePointer, node),
    ]);
  }
  protected getIntermediatePatternProperties(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.PatternProperties | undefined {
    return this.mapPointerEntriesRecord(nodePointer, node, [
      ...this.selectNodePatternPropertyPointerEntries(nodePointer, node),
    ]);
  }
  protected getIntermediatePropertyNames(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.PropertyNames | undefined {
    return this.mapEntriesToSingleNodeId(nodePointer, node, [
      ...this.selectSubNodePropertyNamesEntries(nodePointer, node),
    ]);
  }

  protected abstract getIntermediateReference(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.Reference | undefined;

  //#endregion

  //#region selectors

  protected *selectSubNodes(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]> {
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

  protected abstract selectValidationMaximumProperties(
    node: N,
  ): number | undefined;
  protected abstract selectValidationMinimumProperties(
    node: N,
  ): number | undefined;
  protected abstract selectValidationRequired(node: N): string[] | undefined;
  protected abstract selectValidationMinimumItems(node: N): number | undefined;
  protected abstract selectValidationMaximumItems(node: N): number | undefined;
  protected abstract selectValidationUniqueItems(node: N): boolean | undefined;
  protected abstract selectValidationMinimumLength(node: N): number | undefined;
  protected abstract selectValidationMaximumLength(node: N): number | undefined;
  protected abstract selectValidationValuePattern(node: N): string | undefined;
  protected abstract selectValidationValueFormat(node: N): string | undefined;
  protected abstract selectValidationMinimumInclusive(
    node: N,
  ): number | undefined;
  protected abstract selectValidationMinimumExclusive(
    node: N,
  ): number | undefined;
  protected abstract selectValidationMaximumInclusive(
    node: N,
  ): number | undefined;
  protected abstract selectValidationMaximumExclusive(
    node: N,
  ): number | undefined;
  protected abstract selectValidationMultipleOf(node: N): number | undefined;
  protected abstract selectValidationConst(node: N): any | undefined;
  protected abstract selectValidationEnum(node: N): any[] | undefined;

  protected abstract selectNodePropertiesPointerEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, string]>;
  protected abstract selectNodeDependentSchemasPointerEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, string]>;
  protected abstract selectNodePatternPropertyPointerEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, string]>;

  protected abstract selectSubNodeDefinitionsEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeObjectPropertyEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeMapPropertiesEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodePatternPropertiesEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodePropertyNamesEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeTupleItemsEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeArrayItemsEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeContainsEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeAllOfEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeAnyOfEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeOneOfEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeNotEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeIfEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeThenEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;
  protected abstract selectSubNodeElseEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]>;

  //#endregion

  //#region helpers

  protected mapPointerEntriesRecord(
    nodePointer: string,
    node: N,
    entries: Array<readonly [string, string]>,
  ): Record<string, string> | undefined {
    if (entries.length > 0) {
      const nodeIds = Object.fromEntries(
        entries.map(([key, nodePointer]) => {
          const nodeUrl = this.pointerToNodeUrl(nodePointer);
          const nodeId = String(nodeUrl);
          return [key, nodeId];
        }),
      );
      return nodeIds;
    }
  }

  protected mapEntriesToManyNodeIds(
    nodePointer: string,
    node: N,
    entries: Array<readonly [string, N]>,
  ): Array<string> | undefined {
    if (entries.length > 0) {
      const nodeIds = entries.map(([typeNodePointer]) => {
        const nodeUrl = this.pointerToNodeUrl(typeNodePointer);
        const nodeId = String(nodeUrl);
        return nodeId;
      });
      return nodeIds;
    }
  }

  protected mapEntriesToSingleNodeId(
    nodePointer: string,
    node: N,
    entries: Array<readonly [string, N]>,
  ): string | undefined {
    for (const [nodePointer] of entries) {
      const nodeUrl = this.pointerToNodeUrl(nodePointer);
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

  protected guessTypes(node: N) {
    const nodeConst = this.selectValidationConst(node);
    const nodeEnums = this.selectValidationEnum(node);
    const types = new Set<schemaIntermediateB.TypesSectionItems>();

    if (nodeConst != null) {
      switch (typeof nodeConst) {
        case "number":
          types.add("number");
          break;
        case "boolean":
          types.add("boolean");
          break;
        case "string":
          types.add("string");
          break;
        case "bigint":
          types.add("integer");
          break;

        default:
          throw new Error("unexpected const type");
      }
    }

    if (nodeEnums != null) {
      for (const nodeEnum of nodeEnums) {
        switch (typeof nodeEnum) {
          case "number":
            types.add("number");
            break;
          case "boolean":
            types.add("boolean");
            break;
          case "string":
            types.add("string");
            break;
          case "bigint":
            types.add("integer");
            break;

          default:
            throw new Error("unexpected enum type");
        }
      }
    }

    if (
      this.selectValidationMinimumInclusive(node) != null ||
      this.selectValidationMinimumExclusive(node) != null ||
      this.selectValidationMaximumInclusive(node) != null ||
      this.selectValidationMaximumExclusive(node) != null ||
      this.selectValidationMultipleOf(node) != null
    ) {
      types.add("number");
    }

    if (
      this.selectValidationMinimumLength(node) != null ||
      this.selectValidationMaximumLength(node) != null ||
      this.selectValidationValuePattern(node) != null ||
      this.selectValidationValueFormat(node) != null
    ) {
      types.add("string");
    }

    if (
      this.selectValidationMinimumItems(node) != null ||
      this.selectValidationMaximumItems(node) != null ||
      this.selectValidationUniqueItems(node) != null
    ) {
      types.add("array");
    }

    if (
      this.selectValidationMinimumItems(node) != null ||
      this.selectValidationMaximumItems(node) != null ||
      this.selectValidationUniqueItems(node) != null ||
      [...this.selectSubNodeTupleItemsEntries("", node)].length > 0
    ) {
      types.add("array");
    }

    if (
      this.selectValidationMinimumProperties(node) != null ||
      this.selectValidationMaximumProperties(node) != null ||
      this.selectValidationRequired(node) != null ||
      [...this.selectSubNodeObjectPropertyEntries("", node)].length > 0
    ) {
      types.add("map");
    }

    return [...types];
  }

  //#endregion
}
