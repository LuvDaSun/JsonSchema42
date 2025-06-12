import * as core from "@jns42/core";
import { ArenaSchemaItemContainer } from "@jns42/core";
import assert from "node:assert";

export interface TypeModel {
  readonly location: string | undefined;
  readonly title: string | undefined;
  readonly description: string | undefined;
  readonly examples: any[] | undefined;
  readonly deprecated: boolean | undefined;

  readonly type: core.SchemaType | undefined;

  readonly reference: number | undefined;
  readonly propertyNames: number | undefined;
  readonly mapProperties: number | undefined;
  readonly arrayItems: number | undefined;
  readonly contains: number | undefined;

  readonly oneOf: [number, ...number[]] | undefined;
  readonly tupleItems: number[] | undefined;

  readonly objectProperties: Record<string, number>;
  readonly patternProperties: Record<string, number>;
  readonly dependentSchemas: Record<string, number>;

  readonly options: any[] | undefined;
  readonly required: string[] | undefined;
}

export function toTypeModel(item: ArenaSchemaItemContainer): TypeModel {
  if (item.types != null) {
    assert(item.types.length <= 1);
  }

  if (item.ifSchema != null) {
    assert(item.ifSchema == null);
  }
  if (item.thenSchema != null) {
    assert(item.thenSchema == null);
  }
  if (item.elseSchema != null) {
    assert(item.elseSchema == null);
  }
  if (item.not != null) {
    assert(item.not == null);
  }

  if (item.allOf != null) {
    assert(item.allOf.length === 0);
  }
  if (item.anyOf != null) {
    assert(item.anyOf.length === 0);
  }
  if (item.oneOf != null) {
    assert(item.oneOf.length > 1);
  }

  const { location, title, description, examples, deprecated } = item;

  const type = item.types?.[0];

  const { reference, propertyNames, mapProperties, arrayItems, contains } = item;

  const oneOf = item.oneOf != null ? ([...item.oneOf] as [number, ...number[]]) : undefined;
  const tupleItems = item.tupleItems != null ? [...item.tupleItems] : undefined;

  const { objectProperties, patternProperties, dependentSchemas } = item;
  const { options, required } = item;

  return {
    location,
    title,
    description,
    examples,
    deprecated,

    type,

    reference,
    propertyNames,
    mapProperties,
    arrayItems,
    contains,

    oneOf,
    tupleItems,

    objectProperties,
    patternProperties,
    dependentSchemas,

    options,
    required,
  };
}
