import * as spec from "@jns42/schema-draft-04";
import * as schemaIntermediate from "@jns42/schema-intermediate";
import { NodeLocation } from "../../utils/index.js";
import { DocumentContext } from "../document-context.js";
import { SchemaDocumentBase } from "../schema-document-base.js";

type N = spec.Schema | boolean;

export class Document extends SchemaDocumentBase<N> {
  private readonly aliasMap = new Map<string, NodeLocation>();

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
      const nodeAliasId = this.selectNodeId(node);
      if (nodeAliasId != null) {
        const aliasLocation = this.documentNodeLocation.join(NodeLocation.parse(nodeAliasId));
        const aliasId = aliasLocation.toString();
        if (this.aliasMap.has(aliasId)) {
          throw new TypeError(`duplicate node alias ${aliasId}`);
        }
        this.aliasMap.set(aliasId, nodeLocation);
      }
    }
  }

  //#region document

  protected assertDocumentNode(node: unknown): asserts node is N {
    if (!spec.isSchema(node) && typeof node !== "boolean") {
      const validationError = spec.getLastValidationError();
      throw new TypeError(`rule ${validationError.rule} failed for ${validationError.path}`);
    }
  }

  public *getNodeLocations(): Iterable<NodeLocation> {
    yield* super.getNodeLocations();

    for (const [nodeName] of this.aliasMap) {
      yield NodeLocation.parse(nodeName);
    }
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
  }

  //#endregion

  //#region reference

  private resolveReferenceNodeLocation(nodeRef: string): NodeLocation {
    const refLocation = NodeLocation.parse(nodeRef);
    const resolvedNodeLocation = this.documentNodeLocation.join(refLocation);

    const resolvedDocument = this.context.getDocumentForNode(resolvedNodeLocation);
    if (resolvedDocument instanceof Document) {
      const resolvedNodeLocation = resolvedDocument.documentNodeLocation.join(refLocation);
      const resolvedNodeId = resolvedNodeLocation.toString();
      const resolvedAliasLocation = resolvedDocument.aliasMap.get(resolvedNodeId);
      if (resolvedAliasLocation != null) {
        return resolvedAliasLocation;
      }
    }

    return resolvedNodeLocation;
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
    if (typeof node === "object" && "$ref" in node && typeof node.$ref === "string") {
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

  protected *selectNodePropertiesPointerEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.properties != null) {
      for (const key of Object.keys(node.properties)) {
        const subNodePointer = [...nodePointer, "properties", key];
        yield [key, subNodePointer] as const;
      }
    }
  }

  protected *selectNodeDependentSchemasPointerEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string, string[]]> {
    yield* [];
  }

  protected *selectNodePatternPropertyPointerEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.patternProperties != null) {
      for (const key of Object.keys(node.patternProperties)) {
        const subNodePointer = [...nodePointer, "patternProperties", key];
        yield [key, subNodePointer] as const;
      }
    }
  }

  protected *selectSubNodeDependentSchemasEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
    //
  }

  //#endregion

  //#region schema selectors

  protected *selectSubNodeDefinitionsEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.definitions != null) {
      for (const [key, subNode] of Object.entries(node.definitions)) {
        const subNodePointer = [...nodePointer, "definitions", key];
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

  protected *selectSubNodeTupleItemsEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
    if (typeof node === "object" && node.items != null && Array.isArray(node.items)) {
      for (const [key, subNode] of Object.entries(node.items)) {
        const subNodePointer = [...nodePointer, "items", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }
  protected *selectSubNodeArrayItemsEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
    if (typeof node === "object" && node.items != null && !Array.isArray(node.items)) {
      const subNode = node.items;
      const subNodePointer = [...nodePointer, "items"];
      yield [subNodePointer, subNode] as const;
    }
    if (typeof node === "object" && node.additionalItems != null) {
      const subNode = node.additionalItems;
      const subNodePointer = [...nodePointer, "additionalItems"];
      yield [subNodePointer, subNode] as const;
    }
  }
  protected *selectSubNodeContainsEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
    yield* [];
  }

  protected *selectSubNodePatternPropertiesEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.patternProperties != null) {
      for (const [key, subNode] of Object.entries(node.patternProperties)) {
        const subNodePointer = [...nodePointer, "patternProperties", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodePropertyNamesEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
    yield* [];
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

  protected *selectSubNodeAllOfEntries(nodePointer: string[], node: N) {
    if (typeof node === "object" && node.allOf != null) {
      for (const [key, subNode] of Object.entries(node.allOf)) {
        const subNodePointer = [...nodePointer, "allOf", key];
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

  protected selectSubNodeIfEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
    return [];
  }

  protected selectSubNodeThenEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
    return [];
  }

  protected *selectSubNodeElseEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
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
