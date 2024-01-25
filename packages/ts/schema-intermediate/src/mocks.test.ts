// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.12.9                         -- www.JsonSchema42.org
//
import assert from "node:assert/strict";
import test from "node:test";
import * as validators from "./validators.js";
import * as mocks from "./mocks.js";
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node-reference}
*/
test("NodeReference", () => {
const mock = mocks.mockNodeReference();
const valid = validators.isNodeReference(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/integer-value}
*/
test("IntegerValue", () => {
const mock = mocks.mockIntegerValue();
const valid = validators.isIntegerValue(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/number-value}
*/
test("NumberValue", () => {
const mock = mocks.mockNumberValue();
const valid = validators.isNumberValue(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/boolean-value}
*/
test("BooleanValue", () => {
const mock = mocks.mockBooleanValue();
const valid = validators.isBooleanValue(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/string-value}
*/
test("StringValue", () => {
const mock = mocks.mockStringValue();
const valid = validators.isStringValue(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/non-empty-string-value}
*/
test("NonEmptyStringValue", () => {
const mock = mocks.mockNonEmptyStringValue();
const valid = validators.isNonEmptyStringValue(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/amount}
*/
test("Amount", () => {
const mock = mocks.mockAmount();
const valid = validators.isAmount(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/$schema}
*/
test("Schema", () => {
const mock = mocks.mockSchema();
const valid = validators.isSchema(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/title}
*/
test("Title", () => {
const mock = mocks.mockTitle();
const valid = validators.isTitle(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/description}
*/
test("Description", () => {
const mock = mocks.mockDescription();
const valid = validators.isDescription(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/deprecated}
*/
test("Deprecated", () => {
const mock = mocks.mockDeprecated();
const valid = validators.isDeprecated(mock);
assert.equal(valid, true);
});
/**
* @description What types does this schema describe<br />
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/types}
*/
test("Types", () => {
const mock = mocks.mockTypes();
const valid = validators.isTypes(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/reference}
*/
test("Reference", () => {
const mock = mocks.mockReference();
const valid = validators.isReference(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/oneOf}
*/
test("OneOf", () => {
const mock = mocks.mockOneOf();
const valid = validators.isOneOf(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/anyOf}
*/
test("AnyOf", () => {
const mock = mocks.mockAnyOf();
const valid = validators.isAnyOf(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/allOf}
*/
test("AllOf", () => {
const mock = mocks.mockAllOf();
const valid = validators.isAllOf(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/if}
*/
test("If", () => {
const mock = mocks.mockIf();
const valid = validators.isIf(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/then}
*/
test("Then", () => {
const mock = mocks.mockThen();
const valid = validators.isThen(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/else}
*/
test("Else", () => {
const mock = mocks.mockElse();
const valid = validators.isElse(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/not}
*/
test("Not", () => {
const mock = mocks.mockNot();
const valid = validators.isNot(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/dependentSchemas}
*/
test("DependentSchemas", () => {
const mock = mocks.mockDependentSchemas();
const valid = validators.isDependentSchemas(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/objectProperties}
*/
test("ObjectProperties", () => {
const mock = mocks.mockObjectProperties();
const valid = validators.isObjectProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/mapProperties}
*/
test("MapProperties", () => {
const mock = mocks.mockMapProperties();
const valid = validators.isMapProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/patternProperties}
*/
test("PatternProperties", () => {
const mock = mocks.mockPatternProperties();
const valid = validators.isPatternProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/propertyNames}
*/
test("PropertyNames", () => {
const mock = mocks.mockPropertyNames();
const valid = validators.isPropertyNames(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/tupleItems}
*/
test("TupleItems", () => {
const mock = mocks.mockTupleItems();
const valid = validators.isTupleItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/arrayItems}
*/
test("ArrayItems", () => {
const mock = mocks.mockArrayItems();
const valid = validators.isArrayItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/contains}
*/
test("Contains", () => {
const mock = mocks.mockContains();
const valid = validators.isContains(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumInclusive}
*/
test("MinimumInclusive", () => {
const mock = mocks.mockMinimumInclusive();
const valid = validators.isMinimumInclusive(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumExclusive}
*/
test("MinimumExclusive", () => {
const mock = mocks.mockMinimumExclusive();
const valid = validators.isMinimumExclusive(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumInclusive}
*/
test("MaximumInclusive", () => {
const mock = mocks.mockMaximumInclusive();
const valid = validators.isMaximumInclusive(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumExclusive}
*/
test("MaximumExclusive", () => {
const mock = mocks.mockMaximumExclusive();
const valid = validators.isMaximumExclusive(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/multipleOf}
*/
test("MultipleOf", () => {
const mock = mocks.mockMultipleOf();
const valid = validators.isMultipleOf(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumLength}
*/
test("MinimumLength", () => {
const mock = mocks.mockMinimumLength();
const valid = validators.isMinimumLength(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumLength}
*/
test("MaximumLength", () => {
const mock = mocks.mockMaximumLength();
const valid = validators.isMaximumLength(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/valuePattern}
*/
test("ValuePattern", () => {
const mock = mocks.mockValuePattern();
const valid = validators.isValuePattern(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/valueFormat}
*/
test("ValueFormat", () => {
const mock = mocks.mockValueFormat();
const valid = validators.isValueFormat(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumItems}
*/
test("MinimumItems", () => {
const mock = mocks.mockMinimumItems();
const valid = validators.isMinimumItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumItems}
*/
test("MaximumItems", () => {
const mock = mocks.mockMaximumItems();
const valid = validators.isMaximumItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/uniqueItems}
*/
test("UniqueItems", () => {
const mock = mocks.mockUniqueItems();
const valid = validators.isUniqueItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumProperties}
*/
test("MinimumProperties", () => {
const mock = mocks.mockMinimumProperties();
const valid = validators.isMinimumProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumProperties}
*/
test("MaximumProperties", () => {
const mock = mocks.mockMaximumProperties();
const valid = validators.isMaximumProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/types/items}
*/
test("TypesItems", () => {
const mock = mocks.mockTypesItems();
const valid = validators.isTypesItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/oneOf/items}
*/
test("OneOfItems", () => {
const mock = mocks.mockOneOfItems();
const valid = validators.isOneOfItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/anyOf/items}
*/
test("AnyOfItems", () => {
const mock = mocks.mockAnyOfItems();
const valid = validators.isAnyOfItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/allOf/items}
*/
test("AllOfItems", () => {
const mock = mocks.mockAllOfItems();
const valid = validators.isAllOfItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/dependentSchemas/additionalProperties}
*/
test("DependentSchemasAdditionalProperties", () => {
const mock = mocks.mockDependentSchemasAdditionalProperties();
const valid = validators.isDependentSchemasAdditionalProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/objectProperties/additionalProperties}
*/
test("ObjectPropertiesAdditionalProperties", () => {
const mock = mocks.mockObjectPropertiesAdditionalProperties();
const valid = validators.isObjectPropertiesAdditionalProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/patternProperties/additionalProperties}
*/
test("PatternPropertiesAdditionalProperties", () => {
const mock = mocks.mockPatternPropertiesAdditionalProperties();
const valid = validators.isPatternPropertiesAdditionalProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/tupleItems/items}
*/
test("TupleItemsItems", () => {
const mock = mocks.mockTupleItemsItems();
const valid = validators.isTupleItemsItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/required/items}
*/
test("RequiredItems", () => {
const mock = mocks.mockRequiredItems();
const valid = validators.isRequiredItems(mock);
assert.equal(valid, true);
});
