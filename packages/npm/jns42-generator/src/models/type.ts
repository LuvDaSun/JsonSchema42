import * as core from "@jns42/core";
import assert from "node:assert";

export interface NeverTypeModel {
  type: "never";
}

export interface AnyTypeModel {
  type: "any";
}

export interface NullTypeModel {
  type: "null";
}

export interface BooleanTypeModel {
  type: "boolean";
}

export interface IntegerTypeModel {
  type: "integer";
}

export interface NumberTypeModel {
  type: "number";
}

export interface StringTypeModel {
  type: "string";
}

export interface ArrayTypeModel {
  type: "array";
}

export interface ObjectTypeModel {
  type: "object";
}

export interface AllOfTypeModel {}

export interface OneOfTypeModel {}

export interface ReferenceTypeModel {}

export interface MetadataTypeModel {
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
  readonly allOf: [number, ...number[]] | undefined;
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

  readonly mockable: boolean;
}

export type TypeModel = MetadataTypeModel &
  (
    | NeverTypeModel
    | AnyTypeModel
    | NullTypeModel
    | BooleanTypeModel
    | IntegerTypeModel
    | NumberTypeModel
    | StringTypeModel
    | ArrayTypeModel
    | ObjectTypeModel
    | AllOfTypeModel
    | OneOfTypeModel
    | ReferenceTypeModel
  );

export function toTypeModel(arena: core.SchemaArenaContainer, key: number): TypeModel {
  const item = arena.getItem(key);

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
    assert(item.allOf.length > 1);
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

  const allOf = item.allOf != null ? ([...item.allOf] as [number, ...number[]]) : undefined;
  const oneOf = item.oneOf != null ? ([...item.oneOf] as [number, ...number[]]) : undefined;
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

  const mockable = isMockable(arena, key);

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

    allOf,
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

    mockable,
  };
}

function isMockable(arena: core.SchemaArenaContainer, key: number) {
  const item = arena.getItem(key);

  // the counter keeps track of of this item is unknown or not. If the counter is 0
  // then the item has no meaningful mockable elements (often only validation).
  let mockableCounter = 0;

  // we can only mock exact items
  if (!(item.exact ?? false)) {
    return false;
  }

  // we might support this one day
  if (item.uniqueItems != null) {
    return false;
  }

  // one day we might support some formats
  if (item.valueFormat != null) {
    return false;
  }

  // anything with a regex cannot be mocked
  if (item.valuePattern != null) {
    return false;
  }

  if (item.types != null) {
    // we cannot mock never and any types
    if (
      item.types.every(
        (type: core.SchemaType) => type === core.SchemaType.Never || type === core.SchemaType.Any,
      )
    ) {
      return false;
    }
    mockableCounter++;
  }

  if (item.reference != null) {
    if (!isMockable(arena, item.reference)) {
      return false;
    }
    mockableCounter++;
  }

  if (item.ifSchema != null) {
    return false;
  }
  if (item.thenSchema != null) {
    return false;
  }
  if (item.elseSchema != null) {
    return false;
  }
  if (item.not != null) {
    return false;
  }

  if (item.mapProperties != null) {
    if (!isMockable(arena, item.mapProperties)) {
      return false;
    }

    // we should not increase the mockableCounter for these kinds of
    // fields as they are not making the item more mockable
  }

  if (item.arrayItems != null) {
    if (!isMockable(arena, item.arrayItems)) {
      return false;
    }
  }

  if (item.propertyNames != null) {
    if (!isMockable(arena, item.propertyNames)) {
      return false;
    }
  }

  if (item.contains != null) {
    return false;
  }

  if (item.oneOf != null && item.oneOf.length > 0) {
    if (!item.oneOf.some((key) => isMockable(arena, key))) {
      return false;
    }
    mockableCounter++;
  }

  if (item.anyOf != null && item.anyOf.length > 0) {
    return false;
  }

  if (item.allOf != null && item.allOf.length > 0) {
    return false;
  }

  if (item.objectProperties != null && Object.keys(item.objectProperties).length > 0) {
    const required = new Set(item.required);
    if (
      !Object.entries(item.objectProperties as Record<string, number>)
        .filter(([name, key]) => required.has(name))
        .every(([name, key]) => isMockable(arena, key))
    ) {
      return false;
    }
  }

  // anything with a regex cannot be mocked
  if (item.patternProperties != null && Object.keys(item.patternProperties).length > 0) {
    return false;
  }
  if (item.dependentSchemas != null && Object.keys(item.dependentSchemas).length > 0) {
    return false;
  }

  return mockableCounter > 0;
}
