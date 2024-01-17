// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.11.8                         -- www.JsonSchema42.org
//
import assert from "node:assert/strict";
import test from "node:test";
import * as validators from "./validators.js";
import * as mocks from "./mocks.js";
test("SchemaDocument", () => {
const mock = mocks.mockSchemaDocument();
const valid = validators.isSchemaDocument(mock);
assert.equal(valid, true);
});
test("Node", () => {
const mock = mocks.mockNode();
const valid = validators.isNode(mock);
assert.equal(valid, true);
});
test("NodeReference", () => {
const mock = mocks.mockNodeReference();
const valid = validators.isNodeReference(mock);
assert.equal(valid, true);
});
test("IntegerValue", () => {
const mock = mocks.mockIntegerValue();
const valid = validators.isIntegerValue(mock);
assert.equal(valid, true);
});
test("NumberValue", () => {
const mock = mocks.mockNumberValue();
const valid = validators.isNumberValue(mock);
assert.equal(valid, true);
});
test("BooleanValue", () => {
const mock = mocks.mockBooleanValue();
const valid = validators.isBooleanValue(mock);
assert.equal(valid, true);
});
test("StringValue", () => {
const mock = mocks.mockStringValue();
const valid = validators.isStringValue(mock);
assert.equal(valid, true);
});
test("NonEmptyStringValue", () => {
const mock = mocks.mockNonEmptyStringValue();
const valid = validators.isNonEmptyStringValue(mock);
assert.equal(valid, true);
});
test("Amount", () => {
const mock = mocks.mockAmount();
const valid = validators.isAmount(mock);
assert.equal(valid, true);
});
test("Schema", () => {
const mock = mocks.mockSchema();
const valid = validators.isSchema(mock);
assert.equal(valid, true);
});
test("Schemas", () => {
const mock = mocks.mockSchemas();
const valid = validators.isSchemas(mock);
assert.equal(valid, true);
});
test("Title", () => {
const mock = mocks.mockTitle();
const valid = validators.isTitle(mock);
assert.equal(valid, true);
});
test("Description", () => {
const mock = mocks.mockDescription();
const valid = validators.isDescription(mock);
assert.equal(valid, true);
});
test("Examples", () => {
const mock = mocks.mockExamples();
const valid = validators.isExamples(mock);
assert.equal(valid, true);
});
test("Deprecated", () => {
const mock = mocks.mockDeprecated();
const valid = validators.isDeprecated(mock);
assert.equal(valid, true);
});
test("Types", () => {
const mock = mocks.mockTypes();
const valid = validators.isTypes(mock);
assert.equal(valid, true);
});
test("Reference", () => {
const mock = mocks.mockReference();
const valid = validators.isReference(mock);
assert.equal(valid, true);
});
test("OneOf", () => {
const mock = mocks.mockOneOf();
const valid = validators.isOneOf(mock);
assert.equal(valid, true);
});
test("AnyOf", () => {
const mock = mocks.mockAnyOf();
const valid = validators.isAnyOf(mock);
assert.equal(valid, true);
});
test("AllOf", () => {
const mock = mocks.mockAllOf();
const valid = validators.isAllOf(mock);
assert.equal(valid, true);
});
test("If", () => {
const mock = mocks.mockIf();
const valid = validators.isIf(mock);
assert.equal(valid, true);
});
test("Then", () => {
const mock = mocks.mockThen();
const valid = validators.isThen(mock);
assert.equal(valid, true);
});
test("Else", () => {
const mock = mocks.mockElse();
const valid = validators.isElse(mock);
assert.equal(valid, true);
});
test("Not", () => {
const mock = mocks.mockNot();
const valid = validators.isNot(mock);
assert.equal(valid, true);
});
test("DependentSchemas", () => {
const mock = mocks.mockDependentSchemas();
const valid = validators.isDependentSchemas(mock);
assert.equal(valid, true);
});
test("ObjectProperties", () => {
const mock = mocks.mockObjectProperties();
const valid = validators.isObjectProperties(mock);
assert.equal(valid, true);
});
test("MapProperties", () => {
const mock = mocks.mockMapProperties();
const valid = validators.isMapProperties(mock);
assert.equal(valid, true);
});
test("PatternProperties", () => {
const mock = mocks.mockPatternProperties();
const valid = validators.isPatternProperties(mock);
assert.equal(valid, true);
});
test("PropertyNames", () => {
const mock = mocks.mockPropertyNames();
const valid = validators.isPropertyNames(mock);
assert.equal(valid, true);
});
test("TupleItems", () => {
const mock = mocks.mockTupleItems();
const valid = validators.isTupleItems(mock);
assert.equal(valid, true);
});
test("ArrayItems", () => {
const mock = mocks.mockArrayItems();
const valid = validators.isArrayItems(mock);
assert.equal(valid, true);
});
test("Contains", () => {
const mock = mocks.mockContains();
const valid = validators.isContains(mock);
assert.equal(valid, true);
});
test("Options", () => {
const mock = mocks.mockOptions();
const valid = validators.isOptions(mock);
assert.equal(valid, true);
});
test("MinimumInclusive", () => {
const mock = mocks.mockMinimumInclusive();
const valid = validators.isMinimumInclusive(mock);
assert.equal(valid, true);
});
test("MinimumExclusive", () => {
const mock = mocks.mockMinimumExclusive();
const valid = validators.isMinimumExclusive(mock);
assert.equal(valid, true);
});
test("MaximumInclusive", () => {
const mock = mocks.mockMaximumInclusive();
const valid = validators.isMaximumInclusive(mock);
assert.equal(valid, true);
});
test("MaximumExclusive", () => {
const mock = mocks.mockMaximumExclusive();
const valid = validators.isMaximumExclusive(mock);
assert.equal(valid, true);
});
test("MultipleOf", () => {
const mock = mocks.mockMultipleOf();
const valid = validators.isMultipleOf(mock);
assert.equal(valid, true);
});
test("MinimumLength", () => {
const mock = mocks.mockMinimumLength();
const valid = validators.isMinimumLength(mock);
assert.equal(valid, true);
});
test("MaximumLength", () => {
const mock = mocks.mockMaximumLength();
const valid = validators.isMaximumLength(mock);
assert.equal(valid, true);
});
test("ValuePattern", () => {
const mock = mocks.mockValuePattern();
const valid = validators.isValuePattern(mock);
assert.equal(valid, true);
});
test("ValueFormat", () => {
const mock = mocks.mockValueFormat();
const valid = validators.isValueFormat(mock);
assert.equal(valid, true);
});
test("MinimumItems", () => {
const mock = mocks.mockMinimumItems();
const valid = validators.isMinimumItems(mock);
assert.equal(valid, true);
});
test("MaximumItems", () => {
const mock = mocks.mockMaximumItems();
const valid = validators.isMaximumItems(mock);
assert.equal(valid, true);
});
test("UniqueItems", () => {
const mock = mocks.mockUniqueItems();
const valid = validators.isUniqueItems(mock);
assert.equal(valid, true);
});
test("Required", () => {
const mock = mocks.mockRequired();
const valid = validators.isRequired(mock);
assert.equal(valid, true);
});
test("MinimumProperties", () => {
const mock = mocks.mockMinimumProperties();
const valid = validators.isMinimumProperties(mock);
assert.equal(valid, true);
});
test("MaximumProperties", () => {
const mock = mocks.mockMaximumProperties();
const valid = validators.isMaximumProperties(mock);
assert.equal(valid, true);
});
test("SchemasAdditionalProperties", () => {
const mock = mocks.mockSchemasAdditionalProperties();
const valid = validators.isSchemasAdditionalProperties(mock);
assert.equal(valid, true);
});
test("ExamplesItems", () => {
const mock = mocks.mockExamplesItems();
const valid = validators.isExamplesItems(mock);
assert.equal(valid, true);
});
test("TypesItems", () => {
const mock = mocks.mockTypesItems();
const valid = validators.isTypesItems(mock);
assert.equal(valid, true);
});
test("OneOfItems", () => {
const mock = mocks.mockOneOfItems();
const valid = validators.isOneOfItems(mock);
assert.equal(valid, true);
});
test("AnyOfItems", () => {
const mock = mocks.mockAnyOfItems();
const valid = validators.isAnyOfItems(mock);
assert.equal(valid, true);
});
test("AllOfItems", () => {
const mock = mocks.mockAllOfItems();
const valid = validators.isAllOfItems(mock);
assert.equal(valid, true);
});
test("DependentSchemasAdditionalProperties", () => {
const mock = mocks.mockDependentSchemasAdditionalProperties();
const valid = validators.isDependentSchemasAdditionalProperties(mock);
assert.equal(valid, true);
});
test("ObjectPropertiesAdditionalProperties", () => {
const mock = mocks.mockObjectPropertiesAdditionalProperties();
const valid = validators.isObjectPropertiesAdditionalProperties(mock);
assert.equal(valid, true);
});
test("PatternPropertiesAdditionalProperties", () => {
const mock = mocks.mockPatternPropertiesAdditionalProperties();
const valid = validators.isPatternPropertiesAdditionalProperties(mock);
assert.equal(valid, true);
});
test("TupleItemsItems", () => {
const mock = mocks.mockTupleItemsItems();
const valid = validators.isTupleItemsItems(mock);
assert.equal(valid, true);
});
test("OptionsItems", () => {
const mock = mocks.mockOptionsItems();
const valid = validators.isOptionsItems(mock);
assert.equal(valid, true);
});
test("RequiredItems", () => {
const mock = mocks.mockRequiredItems();
const valid = validators.isRequiredItems(mock);
assert.equal(valid, true);
});
