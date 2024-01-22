// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.12.1                         -- www.JsonSchema42.org
//
import assert from "node:assert/strict";
import test from "node:test";
import * as validators from "./validators.js";
import * as mocks from "./mocks.js";
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/core#/properties/$comment}
*/
test("Comment", () => {
const mock = mocks.mockComment();
const valid = validators.isComment(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/core#/properties/$vocabulary/additionalProperties}
*/
test("VocabularyAdditionalProperties", () => {
const mock = mocks.mockVocabularyAdditionalProperties();
const valid = validators.isVocabularyAdditionalProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/$defs/nonNegativeInteger}
*/
test("NonNegativeInteger", () => {
const mock = mocks.mockNonNegativeInteger();
const valid = validators.isNonNegativeInteger(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/$defs/nonNegativeIntegerDefault0}
*/
test("NonNegativeIntegerDefault0", () => {
const mock = mocks.mockNonNegativeIntegerDefault0();
const valid = validators.isNonNegativeIntegerDefault0(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/$defs/simpleTypes}
*/
test("SimpleTypes", () => {
const mock = mocks.mockSimpleTypes();
const valid = validators.isSimpleTypes(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/multipleOf}
*/
test("MultipleOf", () => {
const mock = mocks.mockMultipleOf();
const valid = validators.isMultipleOf(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/maximum}
*/
test("Maximum", () => {
const mock = mocks.mockMaximum();
const valid = validators.isMaximum(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/exclusiveMaximum}
*/
test("ExclusiveMaximum", () => {
const mock = mocks.mockExclusiveMaximum();
const valid = validators.isExclusiveMaximum(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/minimum}
*/
test("Minimum", () => {
const mock = mocks.mockMinimum();
const valid = validators.isMinimum(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/exclusiveMinimum}
*/
test("ExclusiveMinimum", () => {
const mock = mocks.mockExclusiveMinimum();
const valid = validators.isExclusiveMinimum(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/maxLength}
*/
test("MaxLength", () => {
const mock = mocks.mockMaxLength();
const valid = validators.isMaxLength(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/minLength}
*/
test("MinLength", () => {
const mock = mocks.mockMinLength();
const valid = validators.isMinLength(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/maxItems}
*/
test("MaxItems", () => {
const mock = mocks.mockMaxItems();
const valid = validators.isMaxItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/minItems}
*/
test("MinItems", () => {
const mock = mocks.mockMinItems();
const valid = validators.isMinItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/uniqueItems}
*/
test("UniqueItems", () => {
const mock = mocks.mockUniqueItems();
const valid = validators.isUniqueItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/maxContains}
*/
test("MaxContains", () => {
const mock = mocks.mockMaxContains();
const valid = validators.isMaxContains(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/minContains}
*/
test("MinContains", () => {
const mock = mocks.mockMinContains();
const valid = validators.isMinContains(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/maxProperties}
*/
test("MaxProperties", () => {
const mock = mocks.mockMaxProperties();
const valid = validators.isMaxProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/minProperties}
*/
test("MinProperties", () => {
const mock = mocks.mockMinProperties();
const valid = validators.isMinProperties(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/$defs/stringArray/items}
*/
test("StringArrayItems", () => {
const mock = mocks.mockStringArrayItems();
const valid = validators.isStringArrayItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/type/anyOf/1/items}
*/
test("TypeItems", () => {
const mock = mocks.mockTypeItems();
const valid = validators.isTypeItems(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/meta-data#/properties/title}
*/
test("Title", () => {
const mock = mocks.mockTitle();
const valid = validators.isTitle(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/meta-data#/properties/description}
*/
test("Description", () => {
const mock = mocks.mockDescription();
const valid = validators.isDescription(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/meta-data#/properties/deprecated}
*/
test("Deprecated", () => {
const mock = mocks.mockDeprecated();
const valid = validators.isDeprecated(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/meta-data#/properties/readOnly}
*/
test("ReadOnly", () => {
const mock = mocks.mockReadOnly();
const valid = validators.isReadOnly(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/meta-data#/properties/writeOnly}
*/
test("WriteOnly", () => {
const mock = mocks.mockWriteOnly();
const valid = validators.isWriteOnly(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/format-annotation#/properties/format}
*/
test("Format", () => {
const mock = mocks.mockFormat();
const valid = validators.isFormat(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/content#/properties/contentEncoding}
*/
test("ContentEncoding", () => {
const mock = mocks.mockContentEncoding();
const valid = validators.isContentEncoding(mock);
assert.equal(valid, true);
});
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/content#/properties/contentMediaType}
*/
test("ContentMediaType", () => {
const mock = mocks.mockContentMediaType();
const valid = validators.isContentMediaType(mock);
assert.equal(valid, true);
});
