import * as spec from "@jns42/oas-v3-0";
import { getLastValidationError, isSchema0 } from "@jns42/oas-v3-0";
import * as schemaIntermediate from "@jns42/schema-intermediate";
import { NodeLocation } from "../../utils/index.js";
import { SchemaDocumentBase } from "../schema-document-base.js";

type N = spec.DefinitionsSchema | spec.Reference | spec.Schema2;

export class Document extends SchemaDocumentBase<N> {
  //#region document

  protected assertDocumentNode(node: unknown): asserts node is N {
    if (!spec.isDefinitionsSchema && !spec.isReference && !spec.isSchema2(node)) {
      const validationError = getLastValidationError();
      throw new TypeError(`rule ${validationError.rule} failed for ${validationError.path}`);
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
      const resolvedNodeUrl = this.resolveReferenceNodeUrl(nodeRef);
      const resolvedNodeId = resolvedNodeUrl.toString();
      return resolvedNodeId;
    }
  }

  //#endregion

  //#region reference

  private resolveReferenceNodeUrl(nodeRef: string): NodeLocation {
    const resolvedNodeUrl = this.documentNodeLocation.join(NodeLocation.parse(nodeRef));

    return resolvedNodeUrl;
  }

  //#endregion

  //#region core selectors

  protected selectNodeTypes(node: N) {
    if (spec.isDefinitionsSchema(node) && node.type != null) {
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
    if (spec.isReference(node)) {
      return node.$ref;
    }
  }

  //#endregion

  //#region metadata selectors

  protected selectNodeTitle(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.title;
    }
  }

  protected selectNodeDescription(node: N) {
    if (spec.isDefinitionsSchema(node)) {
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
    if (spec.isDefinitionsSchema(node) && node.properties != null) {
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
    if (spec.isDefinitionsSchema(node) && node.patternProperties != null) {
      for (const key of Object.keys(node.patternProperties)) {
        const subNodePointer = [...nodePointer, "patternProperties", key];
        yield [key, subNodePointer] as const;
      }
    }
  }

  //#endregion

  //#region schema selectors

  protected *selectSubNodeDefinitionsEntries(nodePointer: string[], node: N) {
    if (isSchema0(node) && node.definitions != null) {
      for (const [key, subNode] of Object.entries(node.definitions)) {
        const subNodePointer = [...nodePointer, "definitions", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeObjectPropertyEntries(nodePointer: string[], node: N) {
    if (isSchema0(node) && node.properties != null) {
      for (const [key, subNode] of Object.entries(node.properties)) {
        const subNodePointer = [...nodePointer, "properties", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeMapPropertiesEntries(nodePointer: string[], node: N) {
    if (spec.isDefinitionsSchema(node) && node.additionalProperties != null) {
      const subNode = node.additionalProperties;
      const subNodePointer = [...nodePointer, "additionalProperties"];
      yield [subNodePointer, subNode] as const;
    }
  }

  protected *selectSubNodeTupleItemsEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
    if (spec.isDefinitionsSchema(node) && node.items != null && Array.isArray(node.items)) {
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
    if (spec.isDefinitionsSchema(node) && node.items != null && !Array.isArray(node.items)) {
      const subNode = node.items;
      const subNodePointer = [...nodePointer, "items"];
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
    if (spec.isDefinitionsSchema(node) && node.patternProperties != null) {
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
    //
  }

  protected *selectSubNodePropertyNamesEntries(
    nodePointer: string[],
    node: N,
  ): Iterable<readonly [string[], N]> {
    yield* [];
  }

  protected *selectSubNodeAnyOfEntries(nodePointer: string[], node: N) {
    if (spec.isDefinitionsSchema(node) && node.anyOf != null) {
      for (const [key, subNode] of Object.entries(node.anyOf)) {
        const subNodePointer = [...nodePointer, "anyOf", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeOneOfEntries(nodePointer: string[], node: N) {
    if (spec.isDefinitionsSchema(node) && node.oneOf != null) {
      for (const [key, subNode] of Object.entries(node.oneOf)) {
        const subNodePointer = [...nodePointer, "oneOf", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeAllOfEntries(nodePointer: string[], node: N) {
    if (spec.isDefinitionsSchema(node) && node.allOf != null) {
      for (const [key, subNode] of Object.entries(node.allOf)) {
        const subNodePointer = [...nodePointer, "allOf", key];
        yield [subNodePointer, subNode] as const;
      }
    }
  }

  protected *selectSubNodeNotEntries(nodePointer: string[], node: N) {
    if (spec.isDefinitionsSchema(node) && node.not != null) {
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
    if (spec.isDefinitionsSchema(node)) {
      return node.maxProperties;
    }
  }

  protected selectValidationMinimumProperties(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.minProperties;
    }
  }

  protected selectValidationRequired(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.required;
    }
  }

  protected selectValidationMinimumItems(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.minItems;
    }
  }

  protected selectValidationMaximumItems(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.maxItems;
    }
  }

  protected selectValidationUniqueItems(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.uniqueItems;
    }
  }

  protected selectValidationMinimumLength(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.minLength;
    }
  }

  protected selectValidationMaximumLength(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.maxLength;
    }
  }

  protected selectValidationValuePattern(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.pattern;
    }
  }

  protected selectValidationValueFormat(node: N) {
    if (typeof node === "object") {
      return node.format;
    }
  }

  protected selectValidationMinimumInclusive(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      if (node.exclusiveMinimum ?? false) {
        return undefined;
      } else {
        return node.minimum;
      }
    }
  }

  protected selectValidationMinimumExclusive(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      if (node.exclusiveMinimum ?? false) {
        return node.minimum;
      } else {
        return undefined;
      }
    }
  }

  protected selectValidationMaximumInclusive(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      if (node.exclusiveMaximum ?? false) {
        return undefined;
      } else {
        return node.maximum;
      }
    }
  }

  protected selectValidationMaximumExclusive(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      if (node.exclusiveMaximum ?? false) {
        return node.maximum;
      } else {
        return undefined;
      }
    }
  }

  protected selectValidationMultipleOf(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.multipleOf;
    }
  }

  protected selectValidationEnum(node: N) {
    if (spec.isDefinitionsSchema(node)) {
      return node.enum;
    }
  }

  protected selectValidationConst(node: N) {
    return undefined;
  }

  //#endregion
}
