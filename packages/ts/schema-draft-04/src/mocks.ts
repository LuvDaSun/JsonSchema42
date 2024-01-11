// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.9.6                          -- www.JsonSchema42.org
import * as types from "./types.js";
// http://json-schema.org/draft-04/schema#
export function mockSchemaDocument(): types.SchemaDocument {
return (
{
"id": Boolean(nextSeed() % 2) ? mockId() : undefined,
"$schema": Boolean(nextSeed() % 2) ? mockSchema() : undefined,
"title": Boolean(nextSeed() % 2) ? mockTitle() : undefined,
"description": Boolean(nextSeed() % 2) ? mockDescription() : undefined,
"default": Boolean(nextSeed() % 2) ? mockDefault() : undefined,
"multipleOf": Boolean(nextSeed() % 2) ? mockMultipleOf() : undefined,
"maximum": Boolean(nextSeed() % 2) ? mockMaximum() : undefined,
"exclusiveMaximum": Boolean(nextSeed() % 2) ? mockExclusiveMaximum() : undefined,
"minimum": Boolean(nextSeed() % 2) ? mockMinimum() : undefined,
"exclusiveMinimum": Boolean(nextSeed() % 2) ? mockExclusiveMinimum() : undefined,
"maxLength": Boolean(nextSeed() % 2) ? mockPositiveInteger() : undefined,
"minLength": Boolean(nextSeed() % 2) ? mockPositiveIntegerDefault0() : undefined,
"pattern": Boolean(nextSeed() % 2) ? mockPattern() : undefined,
"additionalItems": Boolean(nextSeed() % 2) ? mockAdditionalItems() : undefined,
"items": Boolean(nextSeed() % 2) ? mockPropertiesItems() : undefined,
"maxItems": Boolean(nextSeed() % 2) ? mockPositiveInteger() : undefined,
"minItems": Boolean(nextSeed() % 2) ? mockPositiveIntegerDefault0() : undefined,
"uniqueItems": Boolean(nextSeed() % 2) ? mockUniqueItems() : undefined,
"maxProperties": Boolean(nextSeed() % 2) ? mockPositiveInteger() : undefined,
"minProperties": Boolean(nextSeed() % 2) ? mockPositiveIntegerDefault0() : undefined,
"required": Boolean(nextSeed() % 2) ? mockStringArray() : undefined,
"additionalProperties": Boolean(nextSeed() % 2) ? mockPropertiesAdditionalProperties() : undefined,
"definitions": Boolean(nextSeed() % 2) ? mockDefinitions() : undefined,
"properties": Boolean(nextSeed() % 2) ? mockProperties() : undefined,
"patternProperties": Boolean(nextSeed() % 2) ? mockPatternProperties() : undefined,
"dependencies": Boolean(nextSeed() % 2) ? mockDependencies() : undefined,
"enum": Boolean(nextSeed() % 2) ? mockEnum() : undefined,
"type": Boolean(nextSeed() % 2) ? mockType() : undefined,
"format": Boolean(nextSeed() % 2) ? mockFormat() : undefined,
"allOf": Boolean(nextSeed() % 2) ? mockSchemaArray() : undefined,
"anyOf": Boolean(nextSeed() % 2) ? mockSchemaArray() : undefined,
"oneOf": Boolean(nextSeed() % 2) ? mockSchemaArray() : undefined,
"not": Boolean(nextSeed() % 2) ? mockSchemaDocument() : undefined,
}
);
}
// http://json-schema.org/draft-04/schema#/definitions/schemaArray
export function mockSchemaArray(): types.SchemaArray {
return (
[
mockSchemaDocument(),
mockSchemaDocument(),
mockSchemaDocument(),
mockSchemaDocument(),
mockSchemaDocument(),
]
);
}
// http://json-schema.org/draft-04/schema#/definitions/positiveInteger
export function mockPositiveInteger(): types.PositiveInteger {
return (Number(nextSeed() % 1000));
}
// http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0
export function mockPositiveIntegerDefault0(): types.PositiveIntegerDefault0 {
return (Number(nextSeed() % 1000));
}
// http://json-schema.org/draft-04/schema#/definitions/simpleTypes
export function mockSimpleTypes(): types.SimpleTypes {
return ((["array", "boolean", "integer", "null", "number", "object", "string"] as const)[nextSeed() % 7]);
}
// http://json-schema.org/draft-04/schema#/definitions/stringArray
export function mockStringArray(): types.StringArray {
return (
[
mockStringArrayItems(),
mockStringArrayItems(),
mockStringArrayItems(),
mockStringArrayItems(),
mockStringArrayItems(),
]
);
}
// http://json-schema.org/draft-04/schema#/properties/id
export function mockId(): types.Id {
return (randomString(10));
}
// http://json-schema.org/draft-04/schema#/properties/$schema
export function mockSchema(): types.Schema {
return (randomString(10));
}
// http://json-schema.org/draft-04/schema#/properties/title
export function mockTitle(): types.Title {
return (randomString(10));
}
// http://json-schema.org/draft-04/schema#/properties/description
export function mockDescription(): types.Description {
return (randomString(10));
}
// http://json-schema.org/draft-04/schema#/properties/default
export function mockDefault(): types.Default {
return (
// unknown
{}
);
}
// http://json-schema.org/draft-04/schema#/properties/multipleOf
export function mockMultipleOf(): types.MultipleOf {
return (Number(nextSeed() % 1000 * 10) / 10);
}
// http://json-schema.org/draft-04/schema#/properties/maximum
export function mockMaximum(): types.Maximum {
return (Number(nextSeed() % 1000 * 10) / 10);
}
// http://json-schema.org/draft-04/schema#/properties/exclusiveMaximum
export function mockExclusiveMaximum(): types.ExclusiveMaximum {
return (Boolean(nextSeed() % 2));
}
// http://json-schema.org/draft-04/schema#/properties/minimum
export function mockMinimum(): types.Minimum {
return (Number(nextSeed() % 1000 * 10) / 10);
}
// http://json-schema.org/draft-04/schema#/properties/exclusiveMinimum
export function mockExclusiveMinimum(): types.ExclusiveMinimum {
return (Boolean(nextSeed() % 2));
}
// http://json-schema.org/draft-04/schema#/properties/maxLength
export function mockMaxLength(): types.MaxLength {
return (mockPositiveInteger());
}
// http://json-schema.org/draft-04/schema#/properties/minLength
export function mockMinLength(): types.MinLength {
return (mockPositiveIntegerDefault0());
}
// http://json-schema.org/draft-04/schema#/properties/pattern
export function mockPattern(): types.Pattern {
return (randomString(10));
}
// http://json-schema.org/draft-04/schema#/properties/additionalItems
export function mockAdditionalItems(): types.AdditionalItems {
return (
(() => {
switch (
(
nextSeed() % 2
) as 0 | 1
) {
case 0:
return (mockAdditionalItems0());
case 1:
return (mockSchemaDocument());
}
})()
);
}
// http://json-schema.org/draft-04/schema#/properties/items
export function mockPropertiesItems(): types.PropertiesItems {
return (
(() => {
switch (
(
nextSeed() % 2
) as 0 | 1
) {
case 0:
return (mockSchemaDocument());
case 1:
return (mockSchemaArray());
}
})()
);
}
// http://json-schema.org/draft-04/schema#/properties/maxItems
export function mockMaxItems(): types.MaxItems {
return (mockPositiveInteger());
}
// http://json-schema.org/draft-04/schema#/properties/minItems
export function mockMinItems(): types.MinItems {
return (mockPositiveIntegerDefault0());
}
// http://json-schema.org/draft-04/schema#/properties/uniqueItems
export function mockUniqueItems(): types.UniqueItems {
return (Boolean(nextSeed() % 2));
}
// http://json-schema.org/draft-04/schema#/properties/maxProperties
export function mockMaxProperties(): types.MaxProperties {
return (mockPositiveInteger());
}
// http://json-schema.org/draft-04/schema#/properties/minProperties
export function mockMinProperties(): types.MinProperties {
return (mockPositiveIntegerDefault0());
}
// http://json-schema.org/draft-04/schema#/properties/required
export function mockRequired(): types.Required {
return (mockStringArray());
}
// http://json-schema.org/draft-04/schema#/properties/additionalProperties
export function mockPropertiesAdditionalProperties(): types.PropertiesAdditionalProperties {
return (
(() => {
switch (
(
nextSeed() % 2
) as 0 | 1
) {
case 0:
return (mockAdditionalProperties0());
case 1:
return (mockSchemaDocument());
}
})()
);
}
// http://json-schema.org/draft-04/schema#/properties/definitions
export function mockDefinitions(): types.Definitions {
return (
{
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
}
);
}
// http://json-schema.org/draft-04/schema#/properties/properties
export function mockProperties(): types.Properties {
return (
{
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
}
);
}
// http://json-schema.org/draft-04/schema#/properties/patternProperties
export function mockPatternProperties(): types.PatternProperties {
return (
{
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
[(randomString(10))]: mockSchemaDocument(),
}
);
}
// http://json-schema.org/draft-04/schema#/properties/dependencies
export function mockDependencies(): types.Dependencies {
return (
{
[(randomString(10))]: mockDependenciesAdditionalProperties(),
[(randomString(10))]: mockDependenciesAdditionalProperties(),
[(randomString(10))]: mockDependenciesAdditionalProperties(),
[(randomString(10))]: mockDependenciesAdditionalProperties(),
[(randomString(10))]: mockDependenciesAdditionalProperties(),
}
);
}
// http://json-schema.org/draft-04/schema#/properties/enum
export function mockEnum(): types.Enum {
return (
[
(
// unknown
{}
),
(
// unknown
{}
),
(
// unknown
{}
),
(
// unknown
{}
),
(
// unknown
{}
),
]
);
}
// http://json-schema.org/draft-04/schema#/properties/type
export function mockType(): types.Type {
return (
(() => {
switch (
(
nextSeed() % 2
) as 0 | 1
) {
case 0:
return (mockSimpleTypes());
case 1:
return (mockType1());
}
})()
);
}
// http://json-schema.org/draft-04/schema#/properties/format
export function mockFormat(): types.Format {
return (randomString(10));
}
// http://json-schema.org/draft-04/schema#/properties/allOf
export function mockAllOf(): types.AllOf {
return (mockSchemaArray());
}
// http://json-schema.org/draft-04/schema#/properties/anyOf
export function mockAnyOf(): types.AnyOf {
return (mockSchemaArray());
}
// http://json-schema.org/draft-04/schema#/properties/oneOf
export function mockOneOf(): types.OneOf {
return (mockSchemaArray());
}
// http://json-schema.org/draft-04/schema#/properties/not
export function mockNot(): types.Not {
return (mockSchemaDocument());
}
// http://json-schema.org/draft-04/schema#/definitions/schemaArray/items
export function mockSchemaArrayItems(): types.SchemaArrayItems {
return (mockSchemaDocument());
}
// http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0/allOf/0
export function mockPositiveIntegerDefault00(): types.PositiveIntegerDefault00 {
return (mockPositiveInteger());
}
// http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0/allOf/1
export function mockPositiveIntegerDefault01(): types.PositiveIntegerDefault01 {
return (
// unknown
{}
);
}
// http://json-schema.org/draft-04/schema#/definitions/stringArray/items
export function mockStringArrayItems(): types.StringArrayItems {
return (randomString(10));
}
// http://json-schema.org/draft-04/schema#/properties/additionalItems/anyOf/0
export function mockAdditionalItems0(): types.AdditionalItems0 {
return (Boolean(nextSeed() % 2));
}
// http://json-schema.org/draft-04/schema#/properties/additionalItems/anyOf/1
export function mockAdditionalItems1(): types.AdditionalItems1 {
return (mockSchemaDocument());
}
// http://json-schema.org/draft-04/schema#/properties/items/anyOf/0
export function mockItems0(): types.Items0 {
return (mockSchemaDocument());
}
// http://json-schema.org/draft-04/schema#/properties/items/anyOf/1
export function mockItems1(): types.Items1 {
return (mockSchemaArray());
}
// http://json-schema.org/draft-04/schema#/properties/additionalProperties/anyOf/0
export function mockAdditionalProperties0(): types.AdditionalProperties0 {
return (Boolean(nextSeed() % 2));
}
// http://json-schema.org/draft-04/schema#/properties/additionalProperties/anyOf/1
export function mockAdditionalProperties1(): types.AdditionalProperties1 {
return (mockSchemaDocument());
}
// http://json-schema.org/draft-04/schema#/properties/definitions/additionalProperties
export function mockDefinitionsAdditionalProperties(): types.DefinitionsAdditionalProperties {
return (mockSchemaDocument());
}
// http://json-schema.org/draft-04/schema#/properties/properties/additionalProperties
export function mockPropertiesPropertiesAdditionalProperties(): types.PropertiesPropertiesAdditionalProperties {
return (mockSchemaDocument());
}
// http://json-schema.org/draft-04/schema#/properties/patternProperties/additionalProperties
export function mockPatternPropertiesAdditionalProperties(): types.PatternPropertiesAdditionalProperties {
return (mockSchemaDocument());
}
// http://json-schema.org/draft-04/schema#/properties/dependencies/additionalProperties
export function mockDependenciesAdditionalProperties(): types.DependenciesAdditionalProperties {
return (
(() => {
switch (
(
nextSeed() % 2
) as 0 | 1
) {
case 0:
return (mockSchemaDocument());
case 1:
return (mockStringArray());
}
})()
);
}
// http://json-schema.org/draft-04/schema#/properties/type/anyOf/0
export function mockType0(): types.Type0 {
return (mockSimpleTypes());
}
// http://json-schema.org/draft-04/schema#/properties/type/anyOf/1
export function mockType1(): types.Type1 {
return (
[
mockSimpleTypes(),
mockSimpleTypes(),
mockSimpleTypes(),
mockSimpleTypes(),
mockSimpleTypes(),
]
);
}
// http://json-schema.org/draft-04/schema#/properties/dependencies/additionalProperties/anyOf/0
export function mockDependencies0(): types.Dependencies0 {
return (mockSchemaDocument());
}
// http://json-schema.org/draft-04/schema#/properties/dependencies/additionalProperties/anyOf/1
export function mockDependencies1(): types.Dependencies1 {
return (mockStringArray());
}
// http://json-schema.org/draft-04/schema#/properties/type/anyOf/1/items
export function mockTypeItems(): types.TypeItems {
return (mockSimpleTypes());
}
let seed = 1;
function nextSeed() {
// https://en.wikipedia.org/wiki/Linear_congruential_generator
// https://statmath.wu.ac.at/software/src/prng-3.0.2/doc/prng.html/Table_LCG.html
const p = Math.pow(2, 31) - 1;
const a = 950706376;
const b = 0;
seed = (a * seed + b) % p;
return seed;
}
const chars = "abcdefghijklmnopqrstuvwxyz";
function randomString(length: number) {
let str = ""
while(str.length < length) {
str += chars[nextSeed() % chars.length];
}
return str;
}
