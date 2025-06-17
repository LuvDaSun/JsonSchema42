import * as core from "@jns42/core";
import { assert } from "console";

export interface ValidatorModel {
  readonly types: core.SchemaType[] | undefined;
  readonly reference: number | undefined;
  readonly ifSchema: number | undefined;
  readonly thenSchema: number | undefined;
  readonly elseSchema: number | undefined;
  readonly not: number | undefined;
  readonly propertyNames: number | undefined;
  readonly mapProperties: number | undefined;
  readonly arrayItems: number | undefined;
  readonly contains: number | undefined;
  readonly allOf: number[] | undefined;
  readonly anyOf: number[] | undefined;
  readonly oneOf: number[] | undefined;
  readonly tupleItems: number[] | undefined;
  readonly objectProperties: Record<string, number>;
  readonly patternProperties: Record<string, number>;
  readonly dependentSchemas: Record<string, number>;
  readonly options: any[] | undefined;
  readonly required: string[] | undefined;
  readonly minimumInclusive: number | undefined;
  readonly minimumExclusive: number | undefined;
  readonly maximumInclusive: number | undefined;
  readonly maximumExclusive: number | undefined;
  readonly multipleOf: number | undefined;
  readonly minimumLength: number | undefined;
  readonly maximumLength: number | undefined;
  readonly valuePattern: string | undefined;
  readonly valueFormat: string | undefined;
  readonly minimumItems: number | undefined;
  readonly maximumItems: number | undefined;
  readonly uniqueItems: boolean | undefined;
  readonly minimumProperties: number | undefined;
  readonly maximumProperties: number | undefined;
}

export function toValidatorModel(arena: core.SchemaArenaContainer, key: number): ValidatorModel {
  const item = arena.getItem(key);

  assert(item.exact === true);

  const { types } = item;

  const {
    reference,
    ifSchema,
    thenSchema,
    elseSchema,
    not,
    propertyNames,
    mapProperties,
    arrayItems,
    contains,
  } = item;

  const allOf = item.allOf != null ? [...item.allOf] : undefined;
  const anyOf = item.anyOf != null ? [...item.anyOf] : undefined;
  const oneOf = item.oneOf != null ? [...item.oneOf] : undefined;
  const tupleItems = item.tupleItems != null ? [...item.tupleItems] : undefined;

  const { objectProperties, patternProperties, dependentSchemas } = item;
  const { options, required } = item;

  const {
    minimumInclusive,
    minimumExclusive,
    maximumInclusive,
    maximumExclusive,
    multipleOf,
    minimumLength,
    maximumLength,
    valuePattern,
    valueFormat,
    minimumItems,
    maximumItems,
    uniqueItems,
    minimumProperties,
    maximumProperties,
  } = item;

  return {
    types,

    reference,
    ifSchema,
    thenSchema,
    elseSchema,
    not,
    propertyNames,
    mapProperties,
    arrayItems,
    contains,

    allOf,
    anyOf,
    oneOf,
    tupleItems,

    objectProperties,
    patternProperties,
    dependentSchemas,

    options,
    required,

    minimumInclusive,
    minimumExclusive,
    maximumInclusive,
    maximumExclusive,
    multipleOf,
    minimumLength,
    maximumLength,
    valuePattern,
    valueFormat,
    minimumItems,
    maximumItems,
    uniqueItems,
    minimumProperties,
    maximumProperties,
  };
}
