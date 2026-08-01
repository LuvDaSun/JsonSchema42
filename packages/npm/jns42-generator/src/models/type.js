import * as core from "@jns42/core";
import assert from "node:assert";
export function toTypeModel(arena, key) {
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
    const type = item.types?.[0];
    const { reference, propertyNames, mapProperties, arrayItems, contains } = item;
    const oneOf = item.oneOf != null ? [...item.oneOf] : undefined;
    const tupleItems = item.tupleItems != null ? [...item.tupleItems] : undefined;
    const { objectProperties, patternProperties, dependentSchemas } = item;
    const { options, required } = item;
    const exact = item.exact ?? false;
    const { minimumInclusive, minimumExclusive, maximumInclusive, maximumExclusive, multipleOf, minimumLength, maximumLength, valuePattern, valueFormat, minimumItems, maximumItems, uniqueItems, minimumProperties, maximumProperties, } = item;
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
                    exact,
                    type: "never",
                };
            case core.SchemaType.Any:
                return {
                    location,
                    title,
                    description,
                    examples,
                    deprecated,
                    exact,
                    type: "any",
                };
            case core.SchemaType.Null:
                return {
                    location,
                    title,
                    description,
                    examples,
                    deprecated,
                    exact,
                    type: "null",
                };
            case core.SchemaType.Boolean:
                return {
                    location,
                    title,
                    description,
                    examples,
                    deprecated,
                    exact,
                    type: "boolean",
                    options: options?.filter((option) => typeof option === "boolean"),
                };
            case core.SchemaType.Integer:
                return {
                    location,
                    title,
                    description,
                    examples,
                    deprecated,
                    exact,
                    type: "integer",
                    options: options?.filter((option) => typeof option === "number"),
                    minimumInclusive,
                    minimumExclusive,
                    maximumInclusive,
                    maximumExclusive,
                    multipleOf,
                };
            case core.SchemaType.Number:
                return {
                    location,
                    title,
                    description,
                    examples,
                    deprecated,
                    exact,
                    type: "number",
                    options: options?.filter((option) => typeof option === "number"),
                    minimumInclusive,
                    minimumExclusive,
                    maximumInclusive,
                    maximumExclusive,
                    multipleOf,
                };
            case core.SchemaType.String:
                return {
                    location,
                    title,
                    description,
                    examples,
                    deprecated,
                    exact,
                    type: "string",
                    options: options?.filter((option) => typeof option === "string"),
                    minimumLength,
                    maximumLength,
                    valuePattern,
                    valueFormat,
                };
            case core.SchemaType.Array:
                return {
                    location,
                    title,
                    description,
                    examples,
                    deprecated,
                    exact,
                    type: "array",
                    arrayItems,
                    contains,
                    tupleItems,
                    minimumItems,
                    maximumItems,
                    uniqueItems,
                };
            case core.SchemaType.Object:
                return {
                    location,
                    title,
                    description,
                    examples,
                    deprecated,
                    exact,
                    type: "object",
                    propertyNames,
                    mapProperties,
                    objectProperties,
                    patternProperties,
                    required,
                    minimumProperties,
                    maximumProperties,
                };
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
            exact,
            type: "reference",
            reference,
        };
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
            exact,
            type: "union",
            members: oneOf,
        };
    }
    return {
        location,
        title,
        description,
        examples,
        deprecated,
        exact,
        type: "unknown",
    };
}
