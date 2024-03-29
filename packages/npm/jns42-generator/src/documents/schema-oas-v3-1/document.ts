import * as schemaIntermediate from "@jns42/schema-intermediate";
import * as spec from "@jns42/schema-oas-v3-1";
import { NodeLocation } from "../../utils/index.js";
import { DocumentContext } from "../document-context.js";
import { SchemaDocumentBase } from "../schema-document-base.js";

type N = spec.DialectBase;

export class Document extends SchemaDocumentBase<N> {
  private readonly anchorMap = new Map<string, NodeLocation>();
  private readonly dynamicAnchorMap = new Map<string, NodeLocation>();

  constructor(
    retrievalLocation: NodeLocation,
    givenLocation: NodeLocation,
    antecedentLocation: NodeLocation | null,
    documentNode: unknown,
    context: DocumentContext,
  ) {
    super(retrievalLocation, givenLocation, antecedentLocation, documentNode, context);

    for (const [nodeId, node] of this.nodes) {
      const nodeLocation = NodeLocation.parse(nodeId);

      const nodeAnchor = this.selectNodeAnchor(node);
      if (nodeAnchor != null) {
        if (this.anchorMap.has(nodeAnchor)) {
          throw new TypeError(`duplicate anchor ${nodeAnchor}`);
        }
        this.anchorMap.set(nodeAnchor, nodeLocation);
      }

      const nodeDynamicAnchor = this.selectNodeDynamicAnchor(node);
      if (nodeDynamicAnchor != null) {
        if (this.dynamicAnchorMap.has(nodeDynamicAnchor)) {
          throw new TypeError(`duplicate dynamic anchor ${nodeDynamicAnchor}`);
        }
        this.dynamicAnchorMap.set(nodeDynamicAnchor, nodeLocation);
      }
    }
  }

  //#region document

  protected assertDocumentNode(node: unknown): asserts node is N {
    if (!spec.isDialectBase(node)) {
      const validationError = spec.getLastValidationError();
      throw new TypeError(`rule ${validationError.rule} failed for ${validationError.path}`);
    }
  }

  public *getNodeLocations(): Iterable<NodeLocation> {
    yield* super.getNodeLocations();

    for (const [anchorId] of this.anchorMap) {
      yield this.documentNodeLocation.toRoot().setAnchor(anchorId);
    }

    /*
		don't emit dynamic anchors here, they are treated differently
		*/
  }

  //#endregion

  //#region intermediate applicators

  protected getIntermediateReference(
    nodePointer: string[],
    node: N,
  ): schemaIntermediate.Reference | undefined {
    const nodeRef = this.selectNodeRef(node);
    if (nodeRef != null) {
      const resolvedNodeLocation = this.resolveReferenceNodeLocation(nodeRef);
      const resolvedNodeId = resolvedNodeLocation.toString();
      return resolvedNodeId;
    }

    const nodeDynamicRef = this.selectNodeDynamicRef(node);
    if (nodeDynamicRef != null) {
      const resolvedNodeLocation = this.resolveDynamicReferenceNodeLocation(nodeDynamicRef);
      const resolvedNodeId = resolvedNodeLocation.toString();
      return resolvedNodeId;
    }
  }

  //#endregion

  //#region reference

  private resolveReferenceNodeLocation(nodeRef: string): NodeLocation {
    const resolvedNodeLocation = this.documentNodeLocation.join(NodeLocation.parse(nodeRef));

    const resolvedDocument = this.context.getDocumentForNode(resolvedNodeLocation);
    if (resolvedDocument instanceof Document) {
      const anchor = resolvedNodeLocation.anchor;
      const anchorResolvedLocation = resolvedDocument.anchorMap.get(anchor);
      if (anchorResolvedLocation != null) {
        return anchorResolvedLocation;
      }
    }

    return resolvedNodeLocation;
  }
  private resolveDynamicReferenceNodeLocation(nodeDynamicRef: string): NodeLocation {
    const documents = [this, ...this.getAntecedentDocuments()];
    documents.reverse();

    const dynamicLocation = NodeLocation.parse(nodeDynamicRef);

    for (const document of documents) {
      if (!(document instanceof Document)) {
        continue;
      }

      const resolvedLocation = document.dynamicAnchorMap.get(dynamicLocation.anchor);

      if (resolvedLocation != null) {
        return resolvedLocation;
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

  protected *selectNodePropertiesPointerEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.properties != null) {
      for (const key of Object.keys(node.properties)) {
        const subNodePointer = [...nodePointer, "properties", key];
        yield [key, subNodePointer] as const;
      }
    }
  }

  protected *selectNodeDependentSchemasPointerEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.dependentSchemas != null) {
      for (const key of Object.keys(node.dependentSchemas)) {
        const subNodePointer = [...nodePointer, "dependentSchemas", key];
        yield [key, subNodePointer] as const;
      }
    }
  }

  protected *selectNodePatternPropertyPointerEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.patternProperties != null) {
      for (const key of Object.keys(node.patternProperties)) {
        const subNodePointer = [...nodePointer, "patternProperties", key];
        yield [key, subNodePointer] as const;
      }
    }
  }

  //#endregion

  //#region schema selectors

  protected *selectSubNodeDefinitionsEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.$defs != null) {
      for (const [key, subNode] of Object.entries(node.$defs)) {
        const subNodePointer = [...nodePointer, "$defs", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeObjectPropertyEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.properties != null) {
      for (const [key, subNode] of Object.entries(node.properties)) {
        const subNodePointer = [...nodePointer, "properties", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeMapPropertiesEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.additionalProperties != null) {
      const subNode = node.additionalProperties;
      const subNodePointer = [...nodePointer, "additionalProperties"];
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodePatternPropertiesEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.patternProperties != null) {
      for (const [key, subNode] of Object.entries(node.patternProperties)) {
        const subNodePointer = [...nodePointer, "patternProperties", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeDependentSchemasEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
    if (typeof node === "object" && node.dependentSchemas != null) {
      for (const [key, subNode] of Object.entries(node.dependentSchemas)) {
        const subNodePointer = [...nodePointer, "dependentSchemas", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodePropertyNamesEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.propertyNames != null) {
      const subNode = node.propertyNames;
      const subNodePointer = [...nodePointer, "propertyNames"];
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeTupleItemsEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.prefixItems != null) {
      for (const [key, subNode] of Object.entries(node.prefixItems)) {
        const subNodePointer = [...nodePointer, "prefixItems", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeArrayItemsEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.items != null) {
      const subNode = node.items;
      const subNodePointer = [...nodePointer, "items"];
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeContainsEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.contains != null) {
      const subNode = node.contains;
      const subNodePointer = [...nodePointer, "contains"];
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeAllOfEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.allOf != null) {
      for (const [key, subNode] of Object.entries(node.allOf)) {
        const subNodePointer = [...nodePointer, "allOf", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeAnyOfEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.anyOf != null) {
      for (const [key, subNode] of Object.entries(node.anyOf)) {
        const subNodePointer = [...nodePointer, "anyOf", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeOneOfEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.oneOf != null) {
      for (const [key, subNode] of Object.entries(node.oneOf)) {
        const subNodePointer = [...nodePointer, "oneOf", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeNotEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.not != null) {
      const subNode = node.not;
      const subNodePointer = [...nodePointer, "not"];
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeIfEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.if != null) {
      const subNode = node.if;
      const subNodePointer = [...nodePointer, "if"];
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeThenEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.then != null) {
      const subNode = node.then;
      const subNodePointer = [...nodePointer, "then"];
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeElseEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.else != null) {
      const subNode = node.else;
      const subNodePointer = [...nodePointer, "else"];
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
