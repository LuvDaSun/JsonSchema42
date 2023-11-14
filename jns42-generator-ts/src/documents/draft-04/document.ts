import { Draft04Schema, isDraft04Schema } from "@jns42/jns42-schema-draft-04";
import * as schemaIntermediateB from "@jns42/jns42-schema-intermediate-b";
import { DocumentContext } from "../document-context.js";
import { SchemaDocumentBase } from "../schema-document-base.js";

type N = Draft04Schema | boolean;

function isNode(value: unknown): value is N {
  return isDraft04Schema(value) || typeof value === "boolean";
}

export class Document extends SchemaDocumentBase<N> {
  private readonly nodeNameMap = new Map<string, string>();

  constructor(
    givenUrl: URL,
    antecedentUrl: URL | null,
    documentNode: unknown,
    context: DocumentContext,
  ) {
    super(givenUrl, antecedentUrl, documentNode, context);

    for (const [nodePointer, node] of this.nodes) {
      const nodeId = this.selectNodeId(node);
      if (nodeId != null && nodeId.startsWith("#")) {
        const nodeName = this.nodeHashToPointer(nodeId);
        if (this.nodeNameMap.has(nodeName)) {
          throw new TypeError(`duplicate node name ${nodeName}`);
        }
        this.nodeNameMap.set(nodeName, nodePointer);
      }
    }
  }

  //#region document

  protected isDocumentNode(node: unknown): node is N {
    return isNode(node);
  }

  public *getNodeUrls(): Iterable<URL> {
    yield* super.getNodeUrls();

    for (const [nodeName] of this.nodeNameMap) {
      yield this.pointerToNodeUrl(nodeName);
    }
  }

  //#endregion

  //#region node

  protected isNodeEmbeddedSchema(node: N): boolean {
    const nodeId = this.selectNodeId(node);
    if (nodeId == null || nodeId.startsWith("#")) {
      return false;
    }
    return true;
  }
  public pointerToNodeHash(nodePointer: string): string {
    return `#${nodePointer}`;
  }
  public nodeHashToPointer(nodeHash: string): string {
    if (nodeHash === "") {
      return "";
    }
    if (!nodeHash.startsWith("#")) {
      throw new TypeError("hash should start with #");
    }
    return nodeHash.substring(1);
  }

  //#endregion

  //#region intermediate applicators

  protected getIntermediateReference(
    nodePointer: string,
    node: N,
  ): schemaIntermediateB.Reference | undefined {
    const nodeRef = this.selectNodeRef(node);
    if (nodeRef != null) {
      const resolvedNodeUrl = this.resolveReferenceNodeUrl(nodeRef);
      const resolvedNodeId = resolvedNodeUrl.toString();
      return resolvedNodeId;
    }
  }

  //#endregion

  //#region reference

  private resolveReferenceNodeUrl(nodeRef: string): URL {
    const resolvedNodeUrl = new URL(nodeRef, this.documentNodeUrl);

    const resolvedDocument = this.context.getDocumentForNode(resolvedNodeUrl);
    if (resolvedDocument instanceof Document) {
      const resolvedPointer =
        resolvedDocument.nodeUrlToPointer(resolvedNodeUrl);
      const anchorResolvedPointer =
        resolvedDocument.nodeNameMap.get(resolvedPointer);
      if (anchorResolvedPointer != null) {
        const anchorResolvedUrl = resolvedDocument.pointerToNodeUrl(
          anchorResolvedPointer,
        );
        return anchorResolvedUrl;
      }
    }

    return resolvedNodeUrl;
  }

  //#endregion

  //#region core selectors

  protected selectNodeTypes(node: N) {
    if (typeof node === "object" && node.type != null) {
      if (Array.isArray(node.type)) {
        return node.type as string[];
      } else {
        return [node.type] as string[];
      }
    }
  }

  protected selectNodeSchema(node: N) {
    if (typeof node === "object") {
      return node.$schema;
    }
  }

  protected selectNodeId(node: N) {
    if (typeof node === "object") {
      return node.id;
    }
  }

  protected selectNodeRef(node: N) {
    if (
      typeof node === "object" &&
      "$ref" in node &&
      typeof node.$ref === "string"
    ) {
      return node.$ref;
    }
  }

  //#endregion

  //#region metadata selectors

  protected selectNodeTitle(node: N) {
    if (typeof node === "object") {
      return node.title;
    }
  }

  protected selectNodeDescription(node: N) {
    if (typeof node === "object") {
      return node.description;
    }
  }

  protected selectNodeDeprecated(node: N): boolean | undefined {
    return undefined;
  }
  protected selectNodeExamples(node: N): any[] | undefined {
    return undefined;
  }

  //#endregion

  //#region pointers selectors

  protected *selectNodePropertiesPointerEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.properties != null) {
      for (const key of Object.keys(node.properties)) {
        const subNodePointer = [nodePointer, "properties", key].join("/");
        yield [key, subNodePointer] as const;
      }
    }
  }

  protected *selectNodeDependentSchemasPointerEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, string]> {
    yield* [];
  }

  protected *selectNodePatternPropertyPointerEntries(
    nodePointer: string,
    node: N,
  ) {
    if (typeof node === "object" && node.patternProperties != null) {
      for (const key of Object.keys(node.patternProperties)) {
        const subNodePointer = [nodePointer, "patternProperties", key].join(
          "/",
        );
        yield [key, subNodePointer] as const;
      }
    }
  }

  //#endregion

  //#region schema selectors

  protected *selectSubNodeDefinitionsEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.definitions != null) {
      for (const [key, subNode] of Object.entries(node.definitions)) {
        const subNodePointer = [nodePointer, "definitions", key].join("/");
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeObjectPropertyEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.properties != null) {
      for (const [key, subNode] of Object.entries(node.properties)) {
        const subNodePointer = [nodePointer, "properties", key].join("/");
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeMapPropertiesEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.additionalProperties != null) {
      const subNode = node.additionalProperties;
      const subNodePointer = [nodePointer, "additionalProperties"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeTupleItemsEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]> {
    if (
      typeof node === "object" &&
      node.items != null &&
      Array.isArray(node.items)
    ) {
      for (const [key, subNode] of Object.entries(node.items)) {
        const subNodePointer = [nodePointer, "items", key].join("/");
        yield [subNodePointer, subNode] as [string, N];
      }
    }
  }
  protected *selectSubNodeArrayItemsEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]> {
    if (
      typeof node === "object" &&
      node.items != null &&
      !Array.isArray(node.items)
    ) {
      const subNode = node.items;
      const subNodePointer = [nodePointer, "items"].join("/");
      yield [subNodePointer, subNode] as const;
    }
    if (typeof node === "object" && node.additionalItems != null) {
      const subNode = node.additionalItems;
      const subNodePointer = [nodePointer, "additionalItems"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }
  protected *selectSubNodeContainsEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]> {
    yield* [];
  }

  protected *selectSubNodePatternPropertiesEntries(
    nodePointer: string,
    node: N,
  ) {
    if (typeof node === "object" && node.patternProperties != null) {
      for (const [key, subNode] of Object.entries(node.patternProperties)) {
        const subNodePointer = [nodePointer, "patternProperties", key].join(
          "/",
        );
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodePropertyNamesEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]> {
    yield* [];
  }

  protected *selectSubNodeAnyOfEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.anyOf != null) {
      for (const [key, subNode] of Object.entries(node.anyOf)) {
        const subNodePointer = [nodePointer, "anyOf", key].join("/");
        yield [subNodePointer, subNode] as [string, N];
      }
    }
  }

  protected *selectSubNodeOneOfEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.oneOf != null) {
      for (const [key, subNode] of Object.entries(node.oneOf)) {
        const subNodePointer = [nodePointer, "oneOf", key].join("/");
        yield [subNodePointer, subNode] as [string, N];
      }
    }
  }

  protected *selectSubNodeAllOfEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.allOf != null) {
      for (const [key, subNode] of Object.entries(node.allOf)) {
        const subNodePointer = [nodePointer, "allOf", key].join("/");
        yield [subNodePointer, subNode] as [string, N];
      }
    }
  }

  protected *selectSubNodeNotEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.not != null) {
      const subNode = node.not;
      const subNodePointer = [nodePointer, "not"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }

  protected selectSubNodeIfEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]> {
    return [];
  }

  protected selectSubNodeThenEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]> {
    return [];
  }

  protected *selectSubNodeElseEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]> {
    yield* [];
  }

  //#endregion

  //#region validation selectors

  protected selectValidationMaximumProperties(node: N) {
    if (typeof node === "object") {
      return node.maxProperties;
    }
  }

  protected selectValidationMinimumProperties(node: N) {
    if (typeof node === "object") {
      return node.minProperties;
    }
  }

  protected selectValidationRequired(node: N) {
    if (typeof node === "object") {
      return node.required as string[];
    }
  }

  protected selectValidationMinimumItems(node: N) {
    if (typeof node === "object") {
      return node.minItems;
    }
  }

  protected selectValidationMaximumItems(node: N) {
    if (typeof node === "object") {
      return node.maxItems;
    }
  }

  protected selectValidationUniqueItems(node: N) {
    if (typeof node === "object") {
      return node.uniqueItems;
    }
  }

  protected selectValidationMinimumLength(node: N) {
    if (typeof node === "object") {
      return node.minLength;
    }
  }

  protected selectValidationMaximumLength(node: N) {
    if (typeof node === "object") {
      return node.maxLength;
    }
  }

  protected selectValidationValuePattern(node: N) {
    if (typeof node === "object") {
      return node.pattern;
    }
  }

  protected selectValidationValueFormat(node: N) {
    if (typeof node === "object") {
      return node.format;
    }
  }

  protected selectValidationMinimumInclusive(node: N) {
    if (typeof node === "object") {
      if (node.exclusiveMinimum ?? false) {
        return undefined;
      } else {
        return node.minimum;
      }
    }
  }

  protected selectValidationMinimumExclusive(node: N) {
    if (typeof node === "object") {
      if (node.exclusiveMinimum ?? false) {
        return node.minimum;
      } else {
        return undefined;
      }
    }
  }

  protected selectValidationMaximumInclusive(node: N) {
    if (typeof node === "object") {
      if (node.exclusiveMaximum ?? false) {
        return undefined;
      } else {
        return node.maximum;
      }
    }
  }

  protected selectValidationMaximumExclusive(node: N) {
    if (typeof node === "object") {
      if (node.exclusiveMaximum ?? false) {
        return node.maximum;
      } else {
        return undefined;
      }
    }
  }

  protected selectValidationMultipleOf(node: N) {
    if (typeof node === "object") {
      return node.multipleOf;
    }
  }

  protected selectValidationEnum(node: N) {
    if (typeof node === "object") {
      return node.enum;
    }
  }

  protected selectValidationConst(node: N) {
    return undefined;
  }

  //#endregion
}
