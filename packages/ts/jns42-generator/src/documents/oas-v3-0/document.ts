import * as spec from "@jns42/oas-v3-0";
import { getLastValidationError, isSchema0 } from "@jns42/oas-v3-0";
import * as schemaIntermediate from "@jns42/schema-intermediate";
import { SchemaDocumentBase } from "../schema-document-base.js";

type N = spec.Schema0 | spec.Schema1 | spec.Schema2;

export class Document extends SchemaDocumentBase<N> {
  //#region document

  protected assertDocumentNode(node: unknown): asserts node is N {
    if (!spec.isSchema0 && !spec.isSchema1 && !spec.isSchema2(node)) {
      const validationError = getLastValidationError();
      throw new TypeError(`rule ${validationError.rule} failed for ${validationError.path}`);
    }
  }

  //#endregion

  //#region node

  protected isNodeEmbeddedSchema(node: N): boolean {
    return false;
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
  ): schemaIntermediate.Reference | undefined {
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

    return resolvedNodeUrl;
  }

  //#endregion

  //#region core selectors

  protected selectNodeTypes(node: N) {
    if (spec.isSchema0(node) && node.type != null) {
      return [node.type] as string[];
    }
  }

  protected selectNodeSchema(node: N) {
    return undefined;
  }

  protected selectNodeId(node: N) {
    return undefined;
  }

  protected selectNodeRef(node: N) {
    if (spec.isSchema1(node)) {
      return node.$ref;
    }
  }

  //#endregion

  //#region metadata selectors

  protected selectNodeTitle(node: N) {
    if (spec.isSchema0(node)) {
      return node.title;
    }
  }

  protected selectNodeDescription(node: N) {
    if (spec.isSchema0(node)) {
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
    if (spec.isSchema0(node) && node.properties != null) {
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

  protected *selectNodePatternPropertyPointerEntries(nodePointer: string, node: N) {
    if (spec.isSchema0(node) && node.patternProperties != null) {
      for (const key of Object.keys(node.patternProperties)) {
        const subNodePointer = [nodePointer, "patternProperties", key].join("/");
        yield [key, subNodePointer] as const;
      }
    }
  }

  //#endregion

  //#region schema selectors

  protected *selectSubNodeDefinitionsEntries(nodePointer: string, node: N) {
    if (isSchema0(node) && node.definitions != null) {
      for (const [key, subNode] of Object.entries(node.definitions)) {
        const subNodePointer = [nodePointer, "definitions", key].join("/");
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeObjectPropertyEntries(nodePointer: string, node: N) {
    if (isSchema0(node) && node.properties != null) {
      for (const [key, subNode] of Object.entries(node.properties)) {
        const subNodePointer = [nodePointer, "properties", key].join("/");
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeMapPropertiesEntries(nodePointer: string, node: N) {
    if (spec.isSchema0(node) && node.additionalProperties != null) {
      const subNode = node.additionalProperties;
      const subNodePointer = [nodePointer, "additionalProperties"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeTupleItemsEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]> {
    if (spec.isSchema0(node) && node.items != null && Array.isArray(node.items)) {
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
    if (spec.isSchema0(node) && node.items != null && !Array.isArray(node.items)) {
      const subNode = node.items;
      const subNodePointer = [nodePointer, "items"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }
  protected *selectSubNodeContainsEntries(
    nodePointer: string,
    node: N,
  ): Iterable<readonly [string, N]> {
    yield* [];
  }

  protected *selectSubNodePatternPropertiesEntries(nodePointer: string, node: N) {
    if (spec.isSchema0(node) && node.patternProperties != null) {
      for (const [key, subNode] of Object.entries(node.patternProperties)) {
        const subNodePointer = [nodePointer, "patternProperties", key].join("/");
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
    if (spec.isSchema0(node) && node.anyOf != null) {
      for (const [key, subNode] of Object.entries(node.anyOf)) {
        const subNodePointer = [nodePointer, "anyOf", key].join("/");
        yield [subNodePointer, subNode] as [string, N];
      }
    }
  }

  protected *selectSubNodeOneOfEntries(nodePointer: string, node: N) {
    if (spec.isSchema0(node) && node.oneOf != null) {
      for (const [key, subNode] of Object.entries(node.oneOf)) {
        const subNodePointer = [nodePointer, "oneOf", key].join("/");
        yield [subNodePointer, subNode] as [string, N];
      }
    }
  }

  protected *selectSubNodeAllOfEntries(nodePointer: string, node: N) {
    if (spec.isSchema0(node) && node.allOf != null) {
      for (const [key, subNode] of Object.entries(node.allOf)) {
        const subNodePointer = [nodePointer, "allOf", key].join("/");
        yield [subNodePointer, subNode] as [string, N];
      }
    }
  }

  protected *selectSubNodeNotEntries(nodePointer: string, node: N) {
    if (spec.isSchema0(node) && node.not != null) {
      const subNode = node.not;
      const subNodePointer = [nodePointer, "not"].join("/");
      yield [subNodePointer, subNode] as const;
    }
  }

  protected selectSubNodeIfEntries(nodePointer: string, node: N): Iterable<readonly [string, N]> {
    return [];
  }

  protected selectSubNodeThenEntries(nodePointer: string, node: N): Iterable<readonly [string, N]> {
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
    if (spec.isSchema0(node)) {
      return node.maxProperties;
    }
  }

  protected selectValidationMinimumProperties(node: N) {
    if (spec.isSchema0(node)) {
      return node.minProperties;
    }
  }

  protected selectValidationRequired(node: N) {
    if (spec.isSchema0(node)) {
      return node.required;
    }
  }

  protected selectValidationMinimumItems(node: N) {
    if (spec.isSchema0(node)) {
      return node.minItems;
    }
  }

  protected selectValidationMaximumItems(node: N) {
    if (spec.isSchema0(node)) {
      return node.maxItems;
    }
  }

  protected selectValidationUniqueItems(node: N) {
    if (spec.isSchema0(node)) {
      return node.uniqueItems;
    }
  }

  protected selectValidationMinimumLength(node: N) {
    if (spec.isSchema0(node)) {
      return node.minLength;
    }
  }

  protected selectValidationMaximumLength(node: N) {
    if (spec.isSchema0(node)) {
      return node.maxLength;
    }
  }

  protected selectValidationValuePattern(node: N) {
    if (spec.isSchema0(node)) {
      return node.pattern;
    }
  }

  protected selectValidationValueFormat(node: N) {
    if (typeof node === "object") {
      return node.format;
    }
  }

  protected selectValidationMinimumInclusive(node: N) {
    if (spec.isSchema0(node)) {
      if (node.exclusiveMinimum ?? false) {
        return undefined;
      } else {
        return node.minimum;
      }
    }
  }

  protected selectValidationMinimumExclusive(node: N) {
    if (spec.isSchema0(node)) {
      if (node.exclusiveMinimum ?? false) {
        return node.minimum;
      } else {
        return undefined;
      }
    }
  }

  protected selectValidationMaximumInclusive(node: N) {
    if (spec.isSchema0(node)) {
      if (node.exclusiveMaximum ?? false) {
        return undefined;
      } else {
        return node.maximum;
      }
    }
  }

  protected selectValidationMaximumExclusive(node: N) {
    if (spec.isSchema0(node)) {
      if (node.exclusiveMaximum ?? false) {
        return node.maximum;
      } else {
        return undefined;
      }
    }
  }

  protected selectValidationMultipleOf(node: N) {
    if (spec.isSchema0(node)) {
      return node.multipleOf;
    }
  }

  protected selectValidationEnum(node: N) {
    if (spec.isSchema0(node)) {
      return node.enum;
    }
  }

  protected selectValidationConst(node: N) {
    return undefined;
  }

  //#endregion
}
