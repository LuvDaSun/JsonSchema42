// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.9.6                          -- www.JsonSchema42.org
//
import assert from "node:assert/strict";
import test from "node:test";
import * as validators from "./validators.js";
import * as mocks from "./mocks.js";
test("SchemaDocument", () => {
const mock = mocks.mockSchemaDocument();
assert.equal(
validators.isSchemaDocument(mock),
true,
)
});
test("Node", () => {
const mock = mocks.mockNode();
assert.equal(
validators.isNode(mock),
true,
)
});
test("NodeReference", () => {
const mock = mocks.mockNodeReference();
assert.equal(
validators.isNodeReference(mock),
true,
)
});
test("IntegerValue", () => {
const mock = mocks.mockIntegerValue();
assert.equal(
validators.isIntegerValue(mock),
true,
)
});
test("NumberValue", () => {
const mock = mocks.mockNumberValue();
assert.equal(
validators.isNumberValue(mock),
true,
)
});
test("BooleanValue", () => {
const mock = mocks.mockBooleanValue();
assert.equal(
validators.isBooleanValue(mock),
true,
)
});
test("StringValue", () => {
const mock = mocks.mockStringValue();
assert.equal(
validators.isStringValue(mock),
true,
)
});
test("NonEmptyStringValue", () => {
const mock = mocks.mockNonEmptyStringValue();
assert.equal(
validators.isNonEmptyStringValue(mock),
true,
)
});
test("Amount", () => {
const mock = mocks.mockAmount();
assert.equal(
validators.isAmount(mock),
true,
)
});
test("Schema", () => {
const mock = mocks.mockSchema();
assert.equal(
validators.isSchema(mock),
true,
)
});
test("Schemas", () => {
const mock = mocks.mockSchemas();
assert.equal(
validators.isSchemas(mock),
true,
)
});
test("Title", () => {
const mock = mocks.mockTitle();
assert.equal(
validators.isTitle(mock),
true,
)
});
test("Description", () => {
const mock = mocks.mockDescription();
assert.equal(
validators.isDescription(mock),
true,
)
});
test("Examples", () => {
const mock = mocks.mockExamples();
assert.equal(
validators.isExamples(mock),
true,
)
});
test("Deprecated", () => {
const mock = mocks.mockDeprecated();
assert.equal(
validators.isDeprecated(mock),
true,
)
});
test("Types", () => {
const mock = mocks.mockTypes();
assert.equal(
validators.isTypes(mock),
true,
)
});
test("Reference", () => {
const mock = mocks.mockReference();
assert.equal(
validators.isReference(mock),
true,
)
});
test("OneOf", () => {
const mock = mocks.mockOneOf();
assert.equal(
validators.isOneOf(mock),
true,
)
});
test("AnyOf", () => {
const mock = mocks.mockAnyOf();
assert.equal(
validators.isAnyOf(mock),
true,
)
});
test("AllOf", () => {
const mock = mocks.mockAllOf();
assert.equal(
validators.isAllOf(mock),
true,
)
});
test("If", () => {
const mock = mocks.mockIf();
assert.equal(
validators.isIf(mock),
true,
)
});
test("Then", () => {
const mock = mocks.mockThen();
assert.equal(
validators.isThen(mock),
true,
)
});
test("Else", () => {
const mock = mocks.mockElse();
assert.equal(
validators.isElse(mock),
true,
)
});
test("Not", () => {
const mock = mocks.mockNot();
assert.equal(
validators.isNot(mock),
true,
)
});
test("DependentSchemas", () => {
const mock = mocks.mockDependentSchemas();
assert.equal(
validators.isDependentSchemas(mock),
true,
)
});
test("ObjectProperties", () => {
const mock = mocks.mockObjectProperties();
assert.equal(
validators.isObjectProperties(mock),
true,
)
});
test("MapProperties", () => {
const mock = mocks.mockMapProperties();
assert.equal(
validators.isMapProperties(mock),
true,
)
});
test("PatternProperties", () => {
const mock = mocks.mockPatternProperties();
assert.equal(
validators.isPatternProperties(mock),
true,
)
});
test("PropertyNames", () => {
const mock = mocks.mockPropertyNames();
assert.equal(
validators.isPropertyNames(mock),
true,
)
});
test("TupleItems", () => {
const mock = mocks.mockTupleItems();
assert.equal(
validators.isTupleItems(mock),
true,
)
});
test("ArrayItems", () => {
const mock = mocks.mockArrayItems();
assert.equal(
validators.isArrayItems(mock),
true,
)
});
test("Contains", () => {
const mock = mocks.mockContains();
assert.equal(
validators.isContains(mock),
true,
)
});
test("Options", () => {
const mock = mocks.mockOptions();
assert.equal(
validators.isOptions(mock),
true,
)
});
test("MinimumInclusive", () => {
const mock = mocks.mockMinimumInclusive();
assert.equal(
validators.isMinimumInclusive(mock),
true,
)
});
test("MinimumExclusive", () => {
const mock = mocks.mockMinimumExclusive();
assert.equal(
validators.isMinimumExclusive(mock),
true,
)
});
test("MaximumInclusive", () => {
const mock = mocks.mockMaximumInclusive();
assert.equal(
validators.isMaximumInclusive(mock),
true,
)
});
test("MaximumExclusive", () => {
const mock = mocks.mockMaximumExclusive();
assert.equal(
validators.isMaximumExclusive(mock),
true,
)
});
test("MultipleOf", () => {
const mock = mocks.mockMultipleOf();
assert.equal(
validators.isMultipleOf(mock),
true,
)
});
test("MinimumLength", () => {
const mock = mocks.mockMinimumLength();
assert.equal(
validators.isMinimumLength(mock),
true,
)
});
test("MaximumLength", () => {
const mock = mocks.mockMaximumLength();
assert.equal(
validators.isMaximumLength(mock),
true,
)
});
test("ValuePattern", () => {
const mock = mocks.mockValuePattern();
assert.equal(
validators.isValuePattern(mock),
true,
)
});
test("ValueFormat", () => {
const mock = mocks.mockValueFormat();
assert.equal(
validators.isValueFormat(mock),
true,
)
});
test("MinimumItems", () => {
const mock = mocks.mockMinimumItems();
assert.equal(
validators.isMinimumItems(mock),
true,
)
});
test("MaximumItems", () => {
const mock = mocks.mockMaximumItems();
assert.equal(
validators.isMaximumItems(mock),
true,
)
});
test("UniqueItems", () => {
const mock = mocks.mockUniqueItems();
assert.equal(
validators.isUniqueItems(mock),
true,
)
});
test("Required", () => {
const mock = mocks.mockRequired();
assert.equal(
validators.isRequired(mock),
true,
)
});
test("MinimumProperties", () => {
const mock = mocks.mockMinimumProperties();
assert.equal(
validators.isMinimumProperties(mock),
true,
)
});
test("MaximumProperties", () => {
const mock = mocks.mockMaximumProperties();
assert.equal(
validators.isMaximumProperties(mock),
true,
)
});
test("SchemasAdditionalProperties", () => {
const mock = mocks.mockSchemasAdditionalProperties();
assert.equal(
validators.isSchemasAdditionalProperties(mock),
true,
)
});
test("ExamplesItems", () => {
const mock = mocks.mockExamplesItems();
assert.equal(
validators.isExamplesItems(mock),
true,
)
});
test("TypesItems", () => {
const mock = mocks.mockTypesItems();
assert.equal(
validators.isTypesItems(mock),
true,
)
});
test("OneOfItems", () => {
const mock = mocks.mockOneOfItems();
assert.equal(
validators.isOneOfItems(mock),
true,
)
});
test("AnyOfItems", () => {
const mock = mocks.mockAnyOfItems();
assert.equal(
validators.isAnyOfItems(mock),
true,
)
});
test("AllOfItems", () => {
const mock = mocks.mockAllOfItems();
assert.equal(
validators.isAllOfItems(mock),
true,
)
});
test("DependentSchemasAdditionalProperties", () => {
const mock = mocks.mockDependentSchemasAdditionalProperties();
assert.equal(
validators.isDependentSchemasAdditionalProperties(mock),
true,
)
});
test("ObjectPropertiesAdditionalProperties", () => {
const mock = mocks.mockObjectPropertiesAdditionalProperties();
assert.equal(
validators.isObjectPropertiesAdditionalProperties(mock),
true,
)
});
test("PatternPropertiesAdditionalProperties", () => {
const mock = mocks.mockPatternPropertiesAdditionalProperties();
assert.equal(
validators.isPatternPropertiesAdditionalProperties(mock),
true,
)
});
test("TupleItemsItems", () => {
const mock = mocks.mockTupleItemsItems();
assert.equal(
validators.isTupleItemsItems(mock),
true,
)
});
test("OptionsItems", () => {
const mock = mocks.mockOptionsItems();
assert.equal(
validators.isOptionsItems(mock),
true,
)
});
test("RequiredItems", () => {
const mock = mocks.mockRequiredItems();
assert.equal(
validators.isRequiredItems(mock),
true,
)
});
