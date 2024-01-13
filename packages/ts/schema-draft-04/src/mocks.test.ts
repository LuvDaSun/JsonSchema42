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
const errors = new Array<validators.ValidationError>();
const valid = validators.isSchemaDocument(mock, errors);
assert.equal(valid, true);
});
test("SchemaArray", () => {
const mock = mocks.mockSchemaArray();
const errors = new Array<validators.ValidationError>();
const valid = validators.isSchemaArray(mock, errors);
assert.equal(valid, true);
});
test("PositiveInteger", () => {
const mock = mocks.mockPositiveInteger();
const errors = new Array<validators.ValidationError>();
const valid = validators.isPositiveInteger(mock, errors);
assert.equal(valid, true);
});
test("PositiveIntegerDefault0", () => {
const mock = mocks.mockPositiveIntegerDefault0();
const errors = new Array<validators.ValidationError>();
const valid = validators.isPositiveIntegerDefault0(mock, errors);
assert.equal(valid, true);
});
test("SimpleTypes", () => {
const mock = mocks.mockSimpleTypes();
const errors = new Array<validators.ValidationError>();
const valid = validators.isSimpleTypes(mock, errors);
assert.equal(valid, true);
});
test("StringArray", () => {
const mock = mocks.mockStringArray();
const errors = new Array<validators.ValidationError>();
const valid = validators.isStringArray(mock, errors);
assert.equal(valid, true);
});
test("Id", () => {
const mock = mocks.mockId();
const errors = new Array<validators.ValidationError>();
const valid = validators.isId(mock, errors);
assert.equal(valid, true);
});
test("Schema", () => {
const mock = mocks.mockSchema();
const errors = new Array<validators.ValidationError>();
const valid = validators.isSchema(mock, errors);
assert.equal(valid, true);
});
test("Title", () => {
const mock = mocks.mockTitle();
const errors = new Array<validators.ValidationError>();
const valid = validators.isTitle(mock, errors);
assert.equal(valid, true);
});
test("Description", () => {
const mock = mocks.mockDescription();
const errors = new Array<validators.ValidationError>();
const valid = validators.isDescription(mock, errors);
assert.equal(valid, true);
});
test("Default", () => {
const mock = mocks.mockDefault();
const errors = new Array<validators.ValidationError>();
const valid = validators.isDefault(mock, errors);
assert.equal(valid, true);
});
test("MultipleOf", () => {
const mock = mocks.mockMultipleOf();
const errors = new Array<validators.ValidationError>();
const valid = validators.isMultipleOf(mock, errors);
assert.equal(valid, true);
});
test("Maximum", () => {
const mock = mocks.mockMaximum();
const errors = new Array<validators.ValidationError>();
const valid = validators.isMaximum(mock, errors);
assert.equal(valid, true);
});
test("ExclusiveMaximum", () => {
const mock = mocks.mockExclusiveMaximum();
const errors = new Array<validators.ValidationError>();
const valid = validators.isExclusiveMaximum(mock, errors);
assert.equal(valid, true);
});
test("Minimum", () => {
const mock = mocks.mockMinimum();
const errors = new Array<validators.ValidationError>();
const valid = validators.isMinimum(mock, errors);
assert.equal(valid, true);
});
test("ExclusiveMinimum", () => {
const mock = mocks.mockExclusiveMinimum();
const errors = new Array<validators.ValidationError>();
const valid = validators.isExclusiveMinimum(mock, errors);
assert.equal(valid, true);
});
test("MaxLength", () => {
const mock = mocks.mockMaxLength();
const errors = new Array<validators.ValidationError>();
const valid = validators.isMaxLength(mock, errors);
assert.equal(valid, true);
});
test("MinLength", () => {
const mock = mocks.mockMinLength();
const errors = new Array<validators.ValidationError>();
const valid = validators.isMinLength(mock, errors);
assert.equal(valid, true);
});
test("Pattern", () => {
const mock = mocks.mockPattern();
const errors = new Array<validators.ValidationError>();
const valid = validators.isPattern(mock, errors);
assert.equal(valid, true);
});
test("AdditionalItems", () => {
const mock = mocks.mockAdditionalItems();
const errors = new Array<validators.ValidationError>();
const valid = validators.isAdditionalItems(mock, errors);
assert.equal(valid, true);
});
test("PropertiesItems", () => {
const mock = mocks.mockPropertiesItems();
const errors = new Array<validators.ValidationError>();
const valid = validators.isPropertiesItems(mock, errors);
assert.equal(valid, true);
});
test("MaxItems", () => {
const mock = mocks.mockMaxItems();
const errors = new Array<validators.ValidationError>();
const valid = validators.isMaxItems(mock, errors);
assert.equal(valid, true);
});
test("MinItems", () => {
const mock = mocks.mockMinItems();
const errors = new Array<validators.ValidationError>();
const valid = validators.isMinItems(mock, errors);
assert.equal(valid, true);
});
test("UniqueItems", () => {
const mock = mocks.mockUniqueItems();
const errors = new Array<validators.ValidationError>();
const valid = validators.isUniqueItems(mock, errors);
assert.equal(valid, true);
});
test("MaxProperties", () => {
const mock = mocks.mockMaxProperties();
const errors = new Array<validators.ValidationError>();
const valid = validators.isMaxProperties(mock, errors);
assert.equal(valid, true);
});
test("MinProperties", () => {
const mock = mocks.mockMinProperties();
const errors = new Array<validators.ValidationError>();
const valid = validators.isMinProperties(mock, errors);
assert.equal(valid, true);
});
test("Required", () => {
const mock = mocks.mockRequired();
const errors = new Array<validators.ValidationError>();
const valid = validators.isRequired(mock, errors);
assert.equal(valid, true);
});
test("PropertiesAdditionalProperties", () => {
const mock = mocks.mockPropertiesAdditionalProperties();
const errors = new Array<validators.ValidationError>();
const valid = validators.isPropertiesAdditionalProperties(mock, errors);
assert.equal(valid, true);
});
test("Definitions", () => {
const mock = mocks.mockDefinitions();
const errors = new Array<validators.ValidationError>();
const valid = validators.isDefinitions(mock, errors);
assert.equal(valid, true);
});
test("Properties", () => {
const mock = mocks.mockProperties();
const errors = new Array<validators.ValidationError>();
const valid = validators.isProperties(mock, errors);
assert.equal(valid, true);
});
test("PatternProperties", () => {
const mock = mocks.mockPatternProperties();
const errors = new Array<validators.ValidationError>();
const valid = validators.isPatternProperties(mock, errors);
assert.equal(valid, true);
});
test("Dependencies", () => {
const mock = mocks.mockDependencies();
const errors = new Array<validators.ValidationError>();
const valid = validators.isDependencies(mock, errors);
assert.equal(valid, true);
});
test("Enum", () => {
const mock = mocks.mockEnum();
const errors = new Array<validators.ValidationError>();
const valid = validators.isEnum(mock, errors);
assert.equal(valid, true);
});
test("Type", () => {
const mock = mocks.mockType();
const errors = new Array<validators.ValidationError>();
const valid = validators.isType(mock, errors);
assert.equal(valid, true);
});
test("Format", () => {
const mock = mocks.mockFormat();
const errors = new Array<validators.ValidationError>();
const valid = validators.isFormat(mock, errors);
assert.equal(valid, true);
});
test("AllOf", () => {
const mock = mocks.mockAllOf();
const errors = new Array<validators.ValidationError>();
const valid = validators.isAllOf(mock, errors);
assert.equal(valid, true);
});
test("AnyOf", () => {
const mock = mocks.mockAnyOf();
const errors = new Array<validators.ValidationError>();
const valid = validators.isAnyOf(mock, errors);
assert.equal(valid, true);
});
test("OneOf", () => {
const mock = mocks.mockOneOf();
const errors = new Array<validators.ValidationError>();
const valid = validators.isOneOf(mock, errors);
assert.equal(valid, true);
});
test("Not", () => {
const mock = mocks.mockNot();
const errors = new Array<validators.ValidationError>();
const valid = validators.isNot(mock, errors);
assert.equal(valid, true);
});
test("SchemaArrayItems", () => {
const mock = mocks.mockSchemaArrayItems();
const errors = new Array<validators.ValidationError>();
const valid = validators.isSchemaArrayItems(mock, errors);
assert.equal(valid, true);
});
test("PositiveIntegerDefault00", () => {
const mock = mocks.mockPositiveIntegerDefault00();
const errors = new Array<validators.ValidationError>();
const valid = validators.isPositiveIntegerDefault00(mock, errors);
assert.equal(valid, true);
});
test("PositiveIntegerDefault01", () => {
const mock = mocks.mockPositiveIntegerDefault01();
const errors = new Array<validators.ValidationError>();
const valid = validators.isPositiveIntegerDefault01(mock, errors);
assert.equal(valid, true);
});
test("StringArrayItems", () => {
const mock = mocks.mockStringArrayItems();
const errors = new Array<validators.ValidationError>();
const valid = validators.isStringArrayItems(mock, errors);
assert.equal(valid, true);
});
test("AdditionalItems0", () => {
const mock = mocks.mockAdditionalItems0();
const errors = new Array<validators.ValidationError>();
const valid = validators.isAdditionalItems0(mock, errors);
assert.equal(valid, true);
});
test("AdditionalItems1", () => {
const mock = mocks.mockAdditionalItems1();
const errors = new Array<validators.ValidationError>();
const valid = validators.isAdditionalItems1(mock, errors);
assert.equal(valid, true);
});
test("Items0", () => {
const mock = mocks.mockItems0();
const errors = new Array<validators.ValidationError>();
const valid = validators.isItems0(mock, errors);
assert.equal(valid, true);
});
test("Items1", () => {
const mock = mocks.mockItems1();
const errors = new Array<validators.ValidationError>();
const valid = validators.isItems1(mock, errors);
assert.equal(valid, true);
});
test("AdditionalProperties0", () => {
const mock = mocks.mockAdditionalProperties0();
const errors = new Array<validators.ValidationError>();
const valid = validators.isAdditionalProperties0(mock, errors);
assert.equal(valid, true);
});
test("AdditionalProperties1", () => {
const mock = mocks.mockAdditionalProperties1();
const errors = new Array<validators.ValidationError>();
const valid = validators.isAdditionalProperties1(mock, errors);
assert.equal(valid, true);
});
test("DefinitionsAdditionalProperties", () => {
const mock = mocks.mockDefinitionsAdditionalProperties();
const errors = new Array<validators.ValidationError>();
const valid = validators.isDefinitionsAdditionalProperties(mock, errors);
assert.equal(valid, true);
});
test("PropertiesPropertiesAdditionalProperties", () => {
const mock = mocks.mockPropertiesPropertiesAdditionalProperties();
const errors = new Array<validators.ValidationError>();
const valid = validators.isPropertiesPropertiesAdditionalProperties(mock, errors);
assert.equal(valid, true);
});
test("PatternPropertiesAdditionalProperties", () => {
const mock = mocks.mockPatternPropertiesAdditionalProperties();
const errors = new Array<validators.ValidationError>();
const valid = validators.isPatternPropertiesAdditionalProperties(mock, errors);
assert.equal(valid, true);
});
test("DependenciesAdditionalProperties", () => {
const mock = mocks.mockDependenciesAdditionalProperties();
const errors = new Array<validators.ValidationError>();
const valid = validators.isDependenciesAdditionalProperties(mock, errors);
assert.equal(valid, true);
});
test("Type0", () => {
const mock = mocks.mockType0();
const errors = new Array<validators.ValidationError>();
const valid = validators.isType0(mock, errors);
assert.equal(valid, true);
});
test("Type1", () => {
const mock = mocks.mockType1();
const errors = new Array<validators.ValidationError>();
const valid = validators.isType1(mock, errors);
assert.equal(valid, true);
});
test("Dependencies0", () => {
const mock = mocks.mockDependencies0();
const errors = new Array<validators.ValidationError>();
const valid = validators.isDependencies0(mock, errors);
assert.equal(valid, true);
});
test("Dependencies1", () => {
const mock = mocks.mockDependencies1();
const errors = new Array<validators.ValidationError>();
const valid = validators.isDependencies1(mock, errors);
assert.equal(valid, true);
});
test("TypeItems", () => {
const mock = mocks.mockTypeItems();
const errors = new Array<validators.ValidationError>();
const valid = validators.isTypeItems(mock, errors);
assert.equal(valid, true);
});
