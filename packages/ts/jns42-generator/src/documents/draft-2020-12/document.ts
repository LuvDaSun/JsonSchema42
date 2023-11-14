import {
  Draft202012Schema as N,
  isDraft202012Schema as isNode,
} from "@jns42/jns42-schema-draft-2020-12";
import * as schemaIntermediateB from "@jns42/jns42-schema-intermediate-b";
import { DocumentContext } from "../document-context.js";
import { SchemaDocumentBase } from "../schema-document-base.js";

export class Document extends SchemaDocumentBase<N> {
  private readonly anchorMap = new Map<string, string>();
  private readonly dynamicAnchorMap = new Map<string, string>();

  constructor(
    givenUrl: URL,
    antecedentUrl: URL | null,
    documentNode: unknown,
    context: DocumentContext,
  ) {
    super(givenUrl, antecedentUrl, documentNode, context);

    for (const [nodePointer, node] of this.nodes) {
      const nodeAnchor = this.selectNodeAnchor(node);
      if (nodeAnchor != null) {
        if (this.anchorMap.has(nodeAnchor)) {
          throw new TypeError(`duplicate anchor ${nodeAnchor}`);
        }
        this.anchorMap.set(nodeAnchor, nodePointer);
      }

      const nodeDynamicAnchor = this.selectNodeDynamicAnchor(node);
      if (nodeDynamicAnchor != null) {
        if (this.dynamicAnchorMap.has(nodeDynamicAnchor)) {
          throw new TypeError(`duplicate dynamic anchor ${nodeDynamicAnchor}`);
        }
        this.dynamicAnchorMap.set(nodeDynamicAnchor, nodePointer);
      }
    }
  }

  //#region document

  protected isDocumentNode(node: unknown): node is N {
    return isNode(node);
  }

  public *getNodeUrls(): Iterable<URL> {
    yield* super.getNodeUrls();

    for (const [anchor] of this.anchorMap) {
      yield this.pointerToNodeUrl(anchor);
    }

    /*
		don't emit dynamic anchors here, they are treated differently
		*/
  }

  //#endregion

  //#region node

  protected isNodeEmbeddedSchema(node: N): boolean {
    const nodeId = this.selectNodeId(node);
    if (nodeId == null) {
      return false;
    }
    return true;
  }

  public pointerToNodeHash(nodePointer: string): string {
    return nodePointer === "" ? "" : `#${nodePointer}`;
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

    const nodeDynamicRef = this.selectNodeDynamicRef(node);
    if (nodeDynamicRef != null) {
      const resolvedNodeUrl =
        this.resolveDynamicReferenceNodeUrl(nodeDynamicRef);
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
        resolvedDocument.anchorMap.get(resolvedPointer);
      if (anchorResolvedPointer != null) {
        const anchorResolvedUrl = resolvedDocument.pointerToNodeUrl(
          anchorResolvedPointer,
        );
        return anchorResolvedUrl;
      }
    }

    return resolvedNodeUrl;
  }
  private resolveDynamicReferenceNodeUrl(nodeDynamicRef: string): URL {
    const documents = [this, ...this.getAntecedentDocuments()];
    documents.reverse();

    for (const document of documents) {
      if (!(document instanceof Document)) {
        continue;
      }

      const resolvedPointer = this.nodeHashToPointer(nodeDynamicRef);
      const dynamicAnchorResolvedPointer =
        document.dynamicAnchorMap.get(resolvedPointer);

      if (dynamicAnchorResolvedPointer != null) {
        const dynamicAnchorResolvedUrl = document.pointerToNodeUrl(
          dynamicAnchorResolvedPointer,
        );
        return dynamicAnchorResolvedUrl;
      }
    }

    throw new TypeError("dynamic anchor not found");
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
      return node.$id;
    }
  }

  protected selectNodeAnchor(node: N) {
    if (typeof node === "object") {
      return node.$anchor;
    }
  }

  protected selectNodeDynamicAnchor(node: N) {
    if (typeof node === "object") {
      return node.$dynamicAnchor;
    }
  }

  protected selectNodeRef(node: N) {
    if (typeof node === "object") {
      return node.$ref;
    }
  }

  protected selectNodeDynamicRef(node: N) {
    if (typeof node === "object") {
      return node.$dynamicRef;
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

  protected selectNodeDeprecated(node: N) {
    if (typeof node === "object") {
      return node.deprecated;
    }
  }

  protected selectNodeExamples(node: N) {
    if (typeof node === "object") {
      return node.examples;
    }
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
  ) {
    if (typeof node === "object" && node.dependentSchemas != null) {
      for (const key of Object.keys(node.dependentSchemas)) {
        const subNodePointer = [nodePointer, "dependentSchemas", key].join("/");
        yield [key, subNodePointer] as const;
      }
    }
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
    if (typeof node === "object" && node.$defs != null) {
      for (const [key, subNode] of Object.entries(node.$defs)) {
        const subNodePointer = [nodePointer, "$defs", key].join("/");
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

  protected *selectSubNodePropertyNamesEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.propertyNames != null) {
      const subNode = node.propertyNames;
      const subNodePointer = [nodePointer, "propertyNames"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeTupleItemsEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.prefixItems != null) {
      for (const [key, subNode] of Object.entries(node.prefixItems)) {
        const subNodePointer = [nodePointer, "prefixItems", key].join("/");
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeArrayItemsEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.items != null) {
      const subNode = node.items;
      const subNodePointer = [nodePointer, "items"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeContainsEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.contains != null) {
      const subNode = node.contains;
      const subNodePointer = [nodePointer, "contains"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeAllOfEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.allOf != null) {
      for (const [key, subNode] of Object.entries(node.allOf)) {
        const subNodePointer = [nodePointer, "allOf", key].join("/");
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeAnyOfEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.anyOf != null) {
      for (const [key, subNode] of Object.entries(node.anyOf)) {
        const subNodePointer = [nodePointer, "anyOf", key].join("/");
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeOneOfEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.oneOf != null) {
      for (const [key, subNode] of Object.entries(node.oneOf)) {
        const subNodePointer = [nodePointer, "oneOf", key].join("/");
        yield [subNodePointer, subNode] as const;
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

  protected *selectSubNodeIfEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.if != null) {
      const subNode = node.if;
      const subNodePointer = [nodePointer, "if"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeThenEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.then != null) {
      const subNode = node.then;
      const subNodePointer = [nodePointer, "then"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeElseEntries(nodePointer: string, node: N) {
    if (typeof node === "object" && node.else != null) {
      const subNode = node.else;
      const subNodePointer = [nodePointer, "else"].join("/");
      yield [subNodePointer, subNode] as const;
    }
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
      return node.required;
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
      return node.minimum;
    }
  }

  protected selectValidationMinimumExclusive(node: N) {
    if (typeof node === "object") {
      return node.exclusiveMinimum;
    }
  }

  protected selectValidationMaximumInclusive(node: N) {
    if (typeof node === "object") {
      return node.maximum;
    }
  }

  protected selectValidationMaximumExclusive(node: N) {
    if (typeof node === "object") {
      return node.exclusiveMaximum;
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
    if (typeof node === "object") {
      return node.const;
    }
  }

  //#endregion
}
