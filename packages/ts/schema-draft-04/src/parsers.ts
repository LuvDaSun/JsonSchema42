// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.12.3                         -- www.JsonSchema42.org
//
import * as types from "./types.js";
export interface ParserGeneratorOptions {
trueStringValues?: string[];
falseStringValues?: string[];
}
const defaultParserGeneratorOptions = {
trueStringValues: ["", "true", "yes", "on", "1"],
falseStringValues: ["false", "no", "off", "0"],
}
/**
* @description Core schema meta-schema
* @see {@link http://json-schema.org/draft-04/schema#}
*/
export function parseSchemaDocument(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
(typeof value === "object" && value !== null && !Array.isArray(value)) ?
Object.fromEntries(
Object.entries(value).map(([name, value]) => {
switch(name) {
case "id":
return [
name,
parseId(value, configuration),
]
case "$schema":
return [
name,
parseSchema(value, configuration),
]
case "title":
return [
name,
parseTitle(value, configuration),
]
case "description":
return [
name,
parseDescription(value, configuration),
]
case "default":
return [
name,
parseDefault(value, configuration),
]
case "multipleOf":
return [
name,
parseMultipleOf(value, configuration),
]
case "maximum":
return [
name,
parseMaximum(value, configuration),
]
case "exclusiveMaximum":
return [
name,
parseExclusiveMaximum(value, configuration),
]
case "minimum":
return [
name,
parseMinimum(value, configuration),
]
case "exclusiveMinimum":
return [
name,
parseExclusiveMinimum(value, configuration),
]
case "maxLength":
return [
name,
parseMaxLength(value, configuration),
]
case "minLength":
return [
name,
parseMinLength(value, configuration),
]
case "pattern":
return [
name,
parsePattern(value, configuration),
]
case "additionalItems":
return [
name,
parseAdditionalItems(value, configuration),
]
case "items":
return [
name,
parsePropertiesItems(value, configuration),
]
case "maxItems":
return [
name,
parseMaxItems(value, configuration),
]
case "minItems":
return [
name,
parseMinItems(value, configuration),
]
case "uniqueItems":
return [
name,
parseUniqueItems(value, configuration),
]
case "maxProperties":
return [
name,
parseMaxProperties(value, configuration),
]
case "minProperties":
return [
name,
parseMinProperties(value, configuration),
]
case "required":
return [
name,
parseRequired(value, configuration),
]
case "additionalProperties":
return [
name,
parsePropertiesAdditionalProperties(value, configuration),
]
case "definitions":
return [
name,
parseDefinitions(value, configuration),
]
case "properties":
return [
name,
parseProperties(value, configuration),
]
case "patternProperties":
return [
name,
parsePatternProperties(value, configuration),
]
case "dependencies":
return [
name,
parseDependencies(value, configuration),
]
case "enum":
return [
name,
parseEnum(value, configuration),
]
case "type":
return [
name,
parseType(value, configuration),
]
case "format":
return [
name,
parseFormat(value, configuration),
]
case "allOf":
return [
name,
parseAllOf(value, configuration),
]
case "anyOf":
return [
name,
parseAnyOf(value, configuration),
]
case "oneOf":
return [
name,
parseOneOf(value, configuration),
]
case "not":
return [
name,
parseNot(value, configuration),
]
default:
return value;
}
})
) :
undefined
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/schemaArray}
*/
export function parseSchemaArray(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
Array.isArray(value) ?
value.map((value, index) => {
switch(index) {
default:
return parseSchemaArrayItems(value, configuration)
}
}) :
undefined
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/positiveInteger}
*/
export function parsePositiveInteger(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return Number(value);
case "number":
return value;
case "boolean":
return value ? 1 : 0;
}
return undefined;
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0}
*/
export function parsePositiveIntegerDefault0(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return Number(value);
case "number":
return value;
case "boolean":
return value ? 1 : 0;
}
return undefined;
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/simpleTypes}
*/
export function parseSimpleTypes(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/stringArray}
*/
export function parseStringArray(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
Array.isArray(value) ?
value.map((value, index) => {
switch(index) {
default:
return parseStringArrayItems(value, configuration)
}
}) :
undefined
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/id}
*/
export function parseId(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/$schema}
*/
export function parseSchema(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/title}
*/
export function parseTitle(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/description}
*/
export function parseDescription(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/default}
*/
export function parseDefault(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (value);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/multipleOf}
*/
export function parseMultipleOf(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return Number(value);
case "number":
return value;
case "boolean":
return value ? 1 : 0;
}
return undefined;
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/maximum}
*/
export function parseMaximum(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return Number(value);
case "number":
return value;
case "boolean":
return value ? 1 : 0;
}
return undefined;
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/exclusiveMaximum}
*/
export function parseExclusiveMaximum(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(value == null) {
return false;
}
if(Array.isArray(value)) {
switch(value.length) {
case 0:
return false;
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
value = value.trim();
for(const trueStringValue of configuration.trueStringValues) {
if(value === trueStringValue) {
return true;
}
}
for(const falseStringValue of configuration.falseStringValues) {
if(value === falseStringValue) {
return false;
}
}
return undefined;
case "number":
return Boolean(value);
case "boolean":
return value;
}
return undefined;
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/minimum}
*/
export function parseMinimum(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return Number(value);
case "number":
return value;
case "boolean":
return value ? 1 : 0;
}
return undefined;
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/exclusiveMinimum}
*/
export function parseExclusiveMinimum(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(value == null) {
return false;
}
if(Array.isArray(value)) {
switch(value.length) {
case 0:
return false;
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
value = value.trim();
for(const trueStringValue of configuration.trueStringValues) {
if(value === trueStringValue) {
return true;
}
}
for(const falseStringValue of configuration.falseStringValues) {
if(value === falseStringValue) {
return false;
}
}
return undefined;
case "number":
return Boolean(value);
case "boolean":
return value;
}
return undefined;
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/maxLength}
*/
export function parseMaxLength(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parsePositiveInteger(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/minLength}
*/
export function parseMinLength(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parsePositiveIntegerDefault0(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/pattern}
*/
export function parsePattern(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalItems}
*/
export function parseAdditionalItems(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
parseAdditionalItems0(value, configuration)
??
parseAdditionalItems1(value, configuration)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/items}
*/
export function parsePropertiesItems(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
parseItems0(value, configuration)
??
parseItems1(value, configuration)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/maxItems}
*/
export function parseMaxItems(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parsePositiveInteger(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/minItems}
*/
export function parseMinItems(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parsePositiveIntegerDefault0(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/uniqueItems}
*/
export function parseUniqueItems(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(value == null) {
return false;
}
if(Array.isArray(value)) {
switch(value.length) {
case 0:
return false;
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
value = value.trim();
for(const trueStringValue of configuration.trueStringValues) {
if(value === trueStringValue) {
return true;
}
}
for(const falseStringValue of configuration.falseStringValues) {
if(value === falseStringValue) {
return false;
}
}
return undefined;
case "number":
return Boolean(value);
case "boolean":
return value;
}
return undefined;
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/maxProperties}
*/
export function parseMaxProperties(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parsePositiveInteger(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/minProperties}
*/
export function parseMinProperties(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parsePositiveIntegerDefault0(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/required}
*/
export function parseRequired(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseStringArray(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalProperties}
*/
export function parsePropertiesAdditionalProperties(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
parseAdditionalProperties0(value, configuration)
??
parseAdditionalProperties1(value, configuration)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/definitions}
*/
export function parseDefinitions(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
(typeof value === "object" && value !== null && !Array.isArray(value)) ?
Object.fromEntries(
Object.entries(value).map(([name, value]) => {
switch(name) {
default:
return [
name,
(parseDefinitionsAdditionalProperties(value, configuration)),
]
}
})
) :
undefined
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/properties}
*/
export function parseProperties(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
(typeof value === "object" && value !== null && !Array.isArray(value)) ?
Object.fromEntries(
Object.entries(value).map(([name, value]) => {
switch(name) {
default:
return [
name,
(parsePropertiesPropertiesAdditionalProperties(value, configuration)),
]
}
})
) :
undefined
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/patternProperties}
*/
export function parsePatternProperties(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
(typeof value === "object" && value !== null && !Array.isArray(value)) ?
Object.fromEntries(
Object.entries(value).map(([name, value]) => {
switch(name) {
default:
return [
name,
(parsePatternPropertiesAdditionalProperties(value, configuration)),
]
}
})
) :
undefined
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/dependencies}
*/
export function parseDependencies(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
(typeof value === "object" && value !== null && !Array.isArray(value)) ?
Object.fromEntries(
Object.entries(value).map(([name, value]) => {
switch(name) {
default:
return [
name,
(parseDependenciesAdditionalProperties(value, configuration)),
]
}
})
) :
undefined
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/enum}
*/
export function parseEnum(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
Array.isArray(value) ?
value.map((value, index) => {
switch(index) {
default:
return value;
}
}) :
undefined
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/type}
*/
export function parseType(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
parseType0(value, configuration)
??
parseType1(value, configuration)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/format}
*/
export function parseFormat(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/allOf}
*/
export function parseAllOf(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaArray(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/anyOf}
*/
export function parseAnyOf(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaArray(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/oneOf}
*/
export function parseOneOf(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaArray(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/not}
*/
export function parseNot(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaDocument(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/schemaArray/items}
*/
export function parseSchemaArrayItems(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaDocument(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0/allOf/0}
*/
export function parsePositiveIntegerDefault00(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parsePositiveInteger(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0/allOf/1}
*/
export function parsePositiveIntegerDefault01(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (value);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/stringArray/items}
*/
export function parseStringArrayItems(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(Array.isArray(value)) {
switch(value.length) {
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalItems/anyOf/0}
*/
export function parseAdditionalItems0(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(value == null) {
return false;
}
if(Array.isArray(value)) {
switch(value.length) {
case 0:
return false;
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
value = value.trim();
for(const trueStringValue of configuration.trueStringValues) {
if(value === trueStringValue) {
return true;
}
}
for(const falseStringValue of configuration.falseStringValues) {
if(value === falseStringValue) {
return false;
}
}
return undefined;
case "number":
return Boolean(value);
case "boolean":
return value;
}
return undefined;
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalItems/anyOf/1}
*/
export function parseAdditionalItems1(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaDocument(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/items/anyOf/0}
*/
export function parseItems0(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaDocument(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/items/anyOf/1}
*/
export function parseItems1(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaArray(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalProperties/anyOf/0}
*/
export function parseAdditionalProperties0(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
((value: unknown) => {
if(value == null) {
return false;
}
if(Array.isArray(value)) {
switch(value.length) {
case 0:
return false;
case 1:
[value] = value
break;
default:
return undefined;
}
}
switch(typeof value) {
case "string":
value = value.trim();
for(const trueStringValue of configuration.trueStringValues) {
if(value === trueStringValue) {
return true;
}
}
for(const falseStringValue of configuration.falseStringValues) {
if(value === falseStringValue) {
return false;
}
}
return undefined;
case "number":
return Boolean(value);
case "boolean":
return value;
}
return undefined;
})(value)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalProperties/anyOf/1}
*/
export function parseAdditionalProperties1(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaDocument(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/definitions/additionalProperties}
*/
export function parseDefinitionsAdditionalProperties(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaDocument(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/properties/additionalProperties}
*/
export function parsePropertiesPropertiesAdditionalProperties(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaDocument(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/patternProperties/additionalProperties}
*/
export function parsePatternPropertiesAdditionalProperties(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaDocument(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/dependencies/additionalProperties}
*/
export function parseDependenciesAdditionalProperties(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
parseDependencies0(value, configuration)
??
parseDependencies1(value, configuration)
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/type/anyOf/0}
*/
export function parseType0(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSimpleTypes(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/type/anyOf/1}
*/
export function parseType1(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (
Array.isArray(value) ?
value.map((value, index) => {
switch(index) {
default:
return parseTypeItems(value, configuration)
}
}) :
undefined
);
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/dependencies/additionalProperties/anyOf/0}
*/
export function parseDependencies0(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSchemaDocument(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/dependencies/additionalProperties/anyOf/1}
*/
export function parseDependencies1(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseStringArray(value, configuration));
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/type/anyOf/1/items}
*/
export function parseTypeItems(value: unknown, options: ParserGeneratorOptions = {}): unknown {
const configuration = {
...defaultParserGeneratorOptions,
...options,
};
return (parseSimpleTypes(value, configuration));
}
