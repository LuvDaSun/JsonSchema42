import { assert } from "console";
export function toValidatorModel(arena, key) {
    const item = arena.getItem(key);
    assert(item.exact === true);
    const { types } = item;
    const { reference, ifSchema, thenSchema, elseSchema, not, propertyNames, mapProperties, arrayItems, contains, } = item;
    const allOf = item.allOf != null ? [...item.allOf] : undefined;
    const anyOf = item.anyOf != null ? [...item.anyOf] : undefined;
    const oneOf = item.oneOf != null ? [...item.oneOf] : undefined;
    const tupleItems = item.tupleItems != null ? [...item.tupleItems] : undefined;
    const { objectProperties, patternProperties, dependentSchemas } = item;
    const { options, required } = item;
    const { minimumInclusive, minimumExclusive, maximumInclusive, maximumExclusive, multipleOf, minimumLength, maximumLength, valuePattern, valueFormat, minimumItems, maximumItems, uniqueItems, minimumProperties, maximumProperties, } = item;
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
