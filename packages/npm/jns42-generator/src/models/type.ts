import * as core from "@jns42/core";
import assert from "node:assert";

export interface UnknownTypeModel {
  readonly type: "unknown";
}

export interface NeverTypeModel {
  readonly type: "never";
}

export interface AnyTypeModel {
  readonly type: "any";
}

export interface NullTypeModel {
  readonly type: "null";
}

export interface BooleanTypeModel {
  readonly type: "boolean";
  readonly options: boolean[];
}

export interface IntegerTypeModel {
  readonly type: "integer";
  readonly options: number[];

  readonly minimumInclusive: number | undefined;
  readonly minimumExclusive: number | undefined;
  readonly maximumInclusive: number | undefined;
  readonly maximumExclusive: number | undefined;
  readonly multipleOf: number | undefined;
}

export interface NumberTypeModel {
  readonly type: "number";
  readonly options: number[];

  readonly minimumInclusive: number | undefined;
  readonly minimumExclusive: number | undefined;
  readonly maximumInclusive: number | undefined;
  readonly maximumExclusive: number | undefined;
  readonly multipleOf: number | undefined;
}

export interface StringTypeModel {
  readonly type: "string";
  readonly options: string[];

  readonly minimumLength: number | undefined;
  readonly maximumLength: number | undefined;
  readonly valuePattern: string | undefined;
  readonly valueFormat: string | undefined;
}

export interface ArrayTypeModel {
  readonly type: "array";
  readonly arrayItems: number | undefined;
  readonly contains: number | undefined;
  readonly tupleItems: number[] | undefined;

  readonly minimumItems: number | undefined;
  readonly maximumItems: number | undefined;
  readonly uniqueItems: boolean | undefined;
}

export interface ObjectTypeModel {
  readonly type: "object";
  readonly propertyNames: number | undefined;
  readonly mapProperties: number | undefined;
  readonly objectProperties: Record<string, number>;
  readonly patternProperties: Record<string, number>;
  readonly required: string[] | undefined;

  readonly minimumProperties: number | undefined;
  readonly maximumProperties: number | undefined;
}

export interface UnionTypeModel {
  readonly type: "union";
  readonly members: [number, ...number[]];
}

export interface ReferenceTypeModel {
  readonly type: "reference";
  readonly reference: number;
}

export interface MetadataTypeModel {
  readonly location: string | undefined;
  readonly title: string | undefined;
  readonly description: string | undefined;
  readonly examples: any[] | undefined;
  readonly deprecated: boolean | undefined;

  readonly mockable: boolean;
  readonly exact: boolean;
}

export type TypeModel = MetadataTypeModel &
  (
    | UnknownTypeModel
    | NeverTypeModel
    | AnyTypeModel
    | NullTypeModel
    | BooleanTypeModel
    | IntegerTypeModel
    | NumberTypeModel
    | StringTypeModel
    | ArrayTypeModel
    | ObjectTypeModel
    | UnionTypeModel
    | ReferenceTypeModel
  );

export function toTypeModel(arena: core.SchemaArenaContainer, key: number): TypeModel {
  const item = arena.getItem(key);

  if (item.types != null) {
    assert(item.types.length <= 1, "unexpected multiple type");
  }

  if (item.ifSchema != null) {
    assert(item.ifSchema == null, "unexpected if");
  }
  if (item.thenSchema != null) {
    assert(item.thenSchema == null, "unexpected then");
  }
  if (item.elseSchema != null) {
    assert(item.elseSchema == null, "unexpected else");
  }
  if (item.not != null) {
    assert(item.not == null, "unexpected not");
  }

  if (item.allOf != null) {
    assert(item.allOf.length === 0, "unexpected allOf");
  }
  if (item.anyOf != null) {
    assert(item.anyOf.length === 0, "unexpected anyOf");
  }
  if (item.oneOf != null) {
    assert(item.oneOf.length > 1, "unexpected single oneOf");
  }

  const { location, title, description, examples, deprecated } = item;

  const type = item.types?.[0] as core.SchemaType;

  const { reference, propertyNames, mapProperties, arrayItems, contains } = item;

  const oneOf = item.oneOf != null ? ([...item.oneOf] as [number, ...number[]]) : undefined;
  const tupleItems = item.tupleItems != null ? [...item.tupleItems] : undefined;

  const { objectProperties, patternProperties, dependentSchemas } = item;
  const { options, required } = item;

  const exact = item.exact ?? false;

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

  if (type != null) {
    assert(reference == null, "unexpected reference");
    assert(oneOf == null, "unexpected oneOf");

    switch (type) {
      case core.SchemaType.Never:
        return {
          location,
          title,
          description,
          examples,
          deprecated,

          mockable,
          exact,

          type: "never",
        } as MetadataTypeModel & NeverTypeModel;

      case core.SchemaType.Any:
        return {
          location,
          title,
          description,
          examples,
          deprecated,

          mockable,
          exact,

          type: "any",
        } as MetadataTypeModel & AnyTypeModel;

      case core.SchemaType.Null:
        return {
          location,
          title,
          description,
          examples,
          deprecated,

          mockable,
          exact,

          type: "null",
        } as MetadataTypeModel & NullTypeModel;

      case core.SchemaType.Boolean:
        return {
          location,
          title,
          description,
          examples,
          deprecated,

          mockable,
          exact,

          type: "boolean",
          options: options?.filter((option) => typeof option === "boolean"),
        } as MetadataTypeModel & BooleanTypeModel;

      case core.SchemaType.Integer:
        return {
          location,
          title,
          description,
          examples,
          deprecated,

          mockable,
          exact,

          type: "integer",
          options: options?.filter((option) => typeof option === "number"),

          minimumInclusive,
          minimumExclusive,
          maximumInclusive,
          maximumExclusive,
          multipleOf,
        } as MetadataTypeModel & IntegerTypeModel;

      case core.SchemaType.Number:
        return {
          location,
          title,
          description,
          examples,
          deprecated,

          mockable,
          exact,

          type: "number",
          options: options?.filter((option) => typeof option === "number"),

          minimumInclusive,
          minimumExclusive,
          maximumInclusive,
          maximumExclusive,
          multipleOf,
        } as MetadataTypeModel & NumberTypeModel;

      case core.SchemaType.String:
        return {
          location,
          title,
          description,
          examples,
          deprecated,

          mockable,
          exact,

          type: "string",
          options: options?.filter((option) => typeof option === "string"),

          minimumLength,
          maximumLength,
          valuePattern,
          valueFormat,
        } as MetadataTypeModel & StringTypeModel;

      case core.SchemaType.Array:
        return {
          location,
          title,
          description,
          examples,
          deprecated,

          mockable,
          exact,

          type: "array",

          arrayItems,
          contains,
          tupleItems,

          minimumItems,
          maximumItems,
          uniqueItems,
        } as MetadataTypeModel & ArrayTypeModel;

      case core.SchemaType.Object:
        return {
          location,
          title,
          description,
          examples,
          deprecated,

          mockable,
          exact,

          type: "object",

          propertyNames,
          mapProperties,
          objectProperties,
          patternProperties,

          required,
          minimumProperties,
          maximumProperties,
        } as MetadataTypeModel & ObjectTypeModel;
    }
  }

  if (reference != null) {
    assert(type == null, "unexpected type");
    assert(oneOf == null, "unexpected oneOf");

    return {
      location,
      title,
      description,
      examples,
      deprecated,

      mockable,
      exact,

      type: "reference",
      reference,
    } as MetadataTypeModel & ReferenceTypeModel;
  }

  if (oneOf != null) {
    assert(type == null, "unexpected type");
    assert(reference == null, "unexpected reference");

    return {
      location,
      title,
      description,
      examples,
      deprecated,

      mockable,
      exact,

      type: "union",
      members: oneOf,
    } as MetadataTypeModel & UnionTypeModel;
  }

  return {
    location,
    title,
    description,
    examples,
    deprecated,

    mockable,
    exact,

    type: "unknown",
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
