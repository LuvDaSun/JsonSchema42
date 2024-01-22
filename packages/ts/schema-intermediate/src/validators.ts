// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.12.0                         -- www.JsonSchema42.org
//
import * as types from "./types.js";
export interface ValidationError {
path: string;
rule: string;
typeName?: string;
}
const pathPartStack = new Array<string>();
const typeNameStack = new Array<string>();
let errors = new Array<ValidationError>();
let depth = 0;
export function getValidationErrors() {
return errors;
}
export function getLastValidationError() {
if(errors.length === 0) {
throw new TypeError("no validation errors");
}
return errors[errors.length - 1];
}
function withPath<T>(pathPart: string, job: () => T): T {
pathPartStack.push(pathPart);
try {
return job();
}
finally {
pathPartStack.pop();
}
}
function withType<T>(typeName: string, job: () => T): T {
if(typeNameStack.length === 0) {
resetErrors();
}
typeNameStack.push(typeName);
try {
return job();
}
finally {
typeNameStack.pop();
}
}
function resetErrors() {
errors = [];
}
function recordError(rule: string) {
errors.push({
path: pathPartStack.join("/"),
typeName: typeNameStack[typeNameStack.length - 1],
rule,
})
}
/**
* @summary JsonSchema42 intermediate schema
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json}
*/
export function isSchemaDocument(value: unknown): value is types.SchemaDocument {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("SchemaDocument", () => {
if(
value === null ||
typeof value !== "object" ||
Array.isArray(value)
) {
recordError("object");
return false;
}
if(
!("$schema" in value) ||
value["$schema"] === undefined
) {
recordError("required");
return false;
}
if(
!("schemas" in value) ||
value["schemas"] === undefined
) {
recordError("required");
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
case "$schema":
if(!withPath(propertyName, () => {
if(!isSchema(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "schemas":
if(!withPath(propertyName, () => {
if(!isSchemas(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
default:
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node}
*/
export function isNode(value: unknown): value is types.Node {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Node", () => {
if(
value === null ||
typeof value !== "object" ||
Array.isArray(value)
) {
recordError("object");
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
case "title":
if(!withPath(propertyName, () => {
if(!isTitle(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "description":
if(!withPath(propertyName, () => {
if(!isDescription(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "examples":
if(!withPath(propertyName, () => {
if(!isExamples(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "deprecated":
if(!withPath(propertyName, () => {
if(!isDeprecated(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "types":
if(!withPath(propertyName, () => {
if(!isTypes(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "reference":
if(!withPath(propertyName, () => {
if(!isReference(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "oneOf":
if(!withPath(propertyName, () => {
if(!isOneOf(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "anyOf":
if(!withPath(propertyName, () => {
if(!isAnyOf(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "allOf":
if(!withPath(propertyName, () => {
if(!isAllOf(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "if":
if(!withPath(propertyName, () => {
if(!isIf(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "then":
if(!withPath(propertyName, () => {
if(!isThen(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "else":
if(!withPath(propertyName, () => {
if(!isElse(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "not":
if(!withPath(propertyName, () => {
if(!isNot(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "dependentSchemas":
if(!withPath(propertyName, () => {
if(!isDependentSchemas(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "objectProperties":
if(!withPath(propertyName, () => {
if(!isObjectProperties(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "mapProperties":
if(!withPath(propertyName, () => {
if(!isMapProperties(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "patternProperties":
if(!withPath(propertyName, () => {
if(!isPatternProperties(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "propertyNames":
if(!withPath(propertyName, () => {
if(!isPropertyNames(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "tupleItems":
if(!withPath(propertyName, () => {
if(!isTupleItems(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "arrayItems":
if(!withPath(propertyName, () => {
if(!isArrayItems(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "contains":
if(!withPath(propertyName, () => {
if(!isContains(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "options":
if(!withPath(propertyName, () => {
if(!isOptions(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "minimumInclusive":
if(!withPath(propertyName, () => {
if(!isMinimumInclusive(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "minimumExclusive":
if(!withPath(propertyName, () => {
if(!isMinimumExclusive(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "maximumInclusive":
if(!withPath(propertyName, () => {
if(!isMaximumInclusive(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "maximumExclusive":
if(!withPath(propertyName, () => {
if(!isMaximumExclusive(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "multipleOf":
if(!withPath(propertyName, () => {
if(!isMultipleOf(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "minimumLength":
if(!withPath(propertyName, () => {
if(!isMinimumLength(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "maximumLength":
if(!withPath(propertyName, () => {
if(!isMaximumLength(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "valuePattern":
if(!withPath(propertyName, () => {
if(!isValuePattern(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "valueFormat":
if(!withPath(propertyName, () => {
if(!isValueFormat(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "minimumItems":
if(!withPath(propertyName, () => {
if(!isMinimumItems(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "maximumItems":
if(!withPath(propertyName, () => {
if(!isMaximumItems(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "uniqueItems":
if(!withPath(propertyName, () => {
if(!isUniqueItems(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "required":
if(!withPath(propertyName, () => {
if(!isRequired(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "minimumProperties":
if(!withPath(propertyName, () => {
if(!isMinimumProperties(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "maximumProperties":
if(!withPath(propertyName, () => {
if(!isMaximumProperties(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
default:
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node-reference}
*/
export function isNodeReference(value: unknown): value is types.NodeReference {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("NodeReference", () => {
if(
typeof value !== "string"
) {
recordError("string");
return false;
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/integer-value}
*/
export function isIntegerValue(value: unknown): value is types.IntegerValue {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("IntegerValue", () => {
if(
typeof value !== "number" ||
isNaN(value) ||
value % 1 !== 0
) {
recordError("integer");
return false;
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/number-value}
*/
export function isNumberValue(value: unknown): value is types.NumberValue {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("NumberValue", () => {
if(
typeof value !== "number" ||
isNaN(value)
) {
recordError("number");
return false;
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/boolean-value}
*/
export function isBooleanValue(value: unknown): value is types.BooleanValue {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("BooleanValue", () => {
if(typeof value !== "boolean") {
recordError("boolean");
return false;
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/string-value}
*/
export function isStringValue(value: unknown): value is types.StringValue {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("StringValue", () => {
if(
typeof value !== "string"
) {
recordError("string");
return false;
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/non-empty-string-value}
*/
export function isNonEmptyStringValue(value: unknown): value is types.NonEmptyStringValue {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("NonEmptyStringValue", () => {
if(
typeof value !== "string"
) {
recordError("string");
return false;
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/amount}
*/
export function isAmount(value: unknown): value is types.Amount {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Amount", () => {
if(
typeof value !== "number" ||
isNaN(value) ||
value % 1 !== 0
) {
recordError("integer");
return false;
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/$schema}
*/
export function isSchema(value: unknown): value is types.Schema {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Schema", () => {
if(
value !== "https://schema.JsonSchema42.org/jns42-intermediate/schema.json"
) {
recordError("options");
return false;
}
if(
typeof value !== "string"
) {
recordError("string");
return false;
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/schemas}
*/
export function isSchemas(value: unknown): value is types.Schemas {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Schemas", () => {
if(
value === null ||
typeof value !== "object" ||
Array.isArray(value)
) {
recordError("object");
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
default:
if(!withPath(propertyName, () => {
if(
!isSchemasAdditionalProperties(propertyValue)
) {
return false;
}
return true;
})) {
return false
}
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/title}
*/
export function isTitle(value: unknown): value is types.Title {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Title", () => {
if(!isNonEmptyStringValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/description}
*/
export function isDescription(value: unknown): value is types.Description {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Description", () => {
if(!isNonEmptyStringValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/examples}
*/
export function isExamples(value: unknown): value is types.Examples {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Examples", () => {
if(!Array.isArray(value)) {
recordError("array");
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
switch(elementIndex) {
default:
if(!withPath(String(elementIndex), () => {
if(!isExamplesItems(elementValue)) {
recordError("elementValue");
return false;
}
return true;
})) {
return false;
}
break;
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/deprecated}
*/
export function isDeprecated(value: unknown): value is types.Deprecated {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Deprecated", () => {
if(!isBooleanValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @description What types does this schema describe<br />
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/types}
*/
export function isTypes(value: unknown): value is types.Types {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Types", () => {
if(!Array.isArray(value)) {
recordError("array");
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
switch(elementIndex) {
default:
if(!withPath(String(elementIndex), () => {
if(!isTypesItems(elementValue)) {
recordError("elementValue");
return false;
}
return true;
})) {
return false;
}
break;
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/reference}
*/
export function isReference(value: unknown): value is types.Reference {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Reference", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/oneOf}
*/
export function isOneOf(value: unknown): value is types.OneOf {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("OneOf", () => {
if(!Array.isArray(value)) {
recordError("array");
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
switch(elementIndex) {
default:
if(!withPath(String(elementIndex), () => {
if(!isOneOfItems(elementValue)) {
recordError("elementValue");
return false;
}
return true;
})) {
return false;
}
break;
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/anyOf}
*/
export function isAnyOf(value: unknown): value is types.AnyOf {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AnyOf", () => {
if(!Array.isArray(value)) {
recordError("array");
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
switch(elementIndex) {
default:
if(!withPath(String(elementIndex), () => {
if(!isAnyOfItems(elementValue)) {
recordError("elementValue");
return false;
}
return true;
})) {
return false;
}
break;
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/allOf}
*/
export function isAllOf(value: unknown): value is types.AllOf {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AllOf", () => {
if(!Array.isArray(value)) {
recordError("array");
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
switch(elementIndex) {
default:
if(!withPath(String(elementIndex), () => {
if(!isAllOfItems(elementValue)) {
recordError("elementValue");
return false;
}
return true;
})) {
return false;
}
break;
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/if}
*/
export function isIf(value: unknown): value is types.If {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("If", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/then}
*/
export function isThen(value: unknown): value is types.Then {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Then", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/else}
*/
export function isElse(value: unknown): value is types.Else {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Else", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/not}
*/
export function isNot(value: unknown): value is types.Not {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Not", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/dependentSchemas}
*/
export function isDependentSchemas(value: unknown): value is types.DependentSchemas {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("DependentSchemas", () => {
if(
value === null ||
typeof value !== "object" ||
Array.isArray(value)
) {
recordError("object");
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
default:
if(!withPath(propertyName, () => {
if(
!isDependentSchemasAdditionalProperties(propertyValue)
) {
return false;
}
return true;
})) {
return false
}
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/objectProperties}
*/
export function isObjectProperties(value: unknown): value is types.ObjectProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("ObjectProperties", () => {
if(
value === null ||
typeof value !== "object" ||
Array.isArray(value)
) {
recordError("object");
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
default:
if(!withPath(propertyName, () => {
if(
!isObjectPropertiesAdditionalProperties(propertyValue)
) {
return false;
}
return true;
})) {
return false
}
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/mapProperties}
*/
export function isMapProperties(value: unknown): value is types.MapProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MapProperties", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/patternProperties}
*/
export function isPatternProperties(value: unknown): value is types.PatternProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PatternProperties", () => {
if(
value === null ||
typeof value !== "object" ||
Array.isArray(value)
) {
recordError("object");
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
default:
if(!withPath(propertyName, () => {
if(
!isPatternPropertiesAdditionalProperties(propertyValue)
) {
return false;
}
return true;
})) {
return false
}
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/propertyNames}
*/
export function isPropertyNames(value: unknown): value is types.PropertyNames {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PropertyNames", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/tupleItems}
*/
export function isTupleItems(value: unknown): value is types.TupleItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("TupleItems", () => {
if(!Array.isArray(value)) {
recordError("array");
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
switch(elementIndex) {
default:
if(!withPath(String(elementIndex), () => {
if(!isTupleItemsItems(elementValue)) {
recordError("elementValue");
return false;
}
return true;
})) {
return false;
}
break;
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/arrayItems}
*/
export function isArrayItems(value: unknown): value is types.ArrayItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("ArrayItems", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/contains}
*/
export function isContains(value: unknown): value is types.Contains {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Contains", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/options}
*/
export function isOptions(value: unknown): value is types.Options {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Options", () => {
if(!Array.isArray(value)) {
recordError("array");
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
switch(elementIndex) {
default:
if(!withPath(String(elementIndex), () => {
if(!isOptionsItems(elementValue)) {
recordError("elementValue");
return false;
}
return true;
})) {
return false;
}
break;
break;
}
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumInclusive}
*/
export function isMinimumInclusive(value: unknown): value is types.MinimumInclusive {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MinimumInclusive", () => {
if(!isNumberValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumExclusive}
*/
export function isMinimumExclusive(value: unknown): value is types.MinimumExclusive {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MinimumExclusive", () => {
if(!isNumberValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumInclusive}
*/
export function isMaximumInclusive(value: unknown): value is types.MaximumInclusive {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MaximumInclusive", () => {
if(!isNumberValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumExclusive}
*/
export function isMaximumExclusive(value: unknown): value is types.MaximumExclusive {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MaximumExclusive", () => {
if(!isNumberValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/multipleOf}
*/
export function isMultipleOf(value: unknown): value is types.MultipleOf {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MultipleOf", () => {
if(!isNumberValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumLength}
*/
export function isMinimumLength(value: unknown): value is types.MinimumLength {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MinimumLength", () => {
if(!isAmount(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumLength}
*/
export function isMaximumLength(value: unknown): value is types.MaximumLength {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MaximumLength", () => {
if(!isAmount(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/valuePattern}
*/
export function isValuePattern(value: unknown): value is types.ValuePattern {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("ValuePattern", () => {
if(!isNonEmptyStringValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/valueFormat}
*/
export function isValueFormat(value: unknown): value is types.ValueFormat {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("ValueFormat", () => {
if(!isNonEmptyStringValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumItems}
*/
export function isMinimumItems(value: unknown): value is types.MinimumItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MinimumItems", () => {
if(!isAmount(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumItems}
*/
export function isMaximumItems(value: unknown): value is types.MaximumItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MaximumItems", () => {
if(!isAmount(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/uniqueItems}
*/
export function isUniqueItems(value: unknown): value is types.UniqueItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("UniqueItems", () => {
if(typeof value !== "boolean") {
recordError("boolean");
return false;
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/required}
*/
export function isRequired(value: unknown): value is types.Required {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Required", () => {
if(!Array.isArray(value)) {
recordError("array");
return false;
}
const elementValueSeen = new Set<unknown>();
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(elementValueSeen.has(elementValue)) {
recordError("uniqueItems");
return false;
}
switch(elementIndex) {
default:
if(!withPath(String(elementIndex), () => {
if(!isRequiredItems(elementValue)) {
recordError("elementValue");
return false;
}
return true;
})) {
return false;
}
break;
break;
}
elementValueSeen.add(elementValue);
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumProperties}
*/
export function isMinimumProperties(value: unknown): value is types.MinimumProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MinimumProperties", () => {
if(!isAmount(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumProperties}
*/
export function isMaximumProperties(value: unknown): value is types.MaximumProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MaximumProperties", () => {
if(!isAmount(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/schemas/additionalProperties}
*/
export function isSchemasAdditionalProperties(value: unknown): value is types.SchemasAdditionalProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("SchemasAdditionalProperties", () => {
if(!isNode(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/examples/items}
*/
export function isExamplesItems(value: unknown): value is types.ExamplesItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("ExamplesItems", () => {
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/types/items}
*/
export function isTypesItems(value: unknown): value is types.TypesItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("TypesItems", () => {
if(
value !== "never" &&
value !== "any" &&
value !== "null" &&
value !== "boolean" &&
value !== "integer" &&
value !== "number" &&
value !== "string" &&
value !== "array" &&
value !== "map"
) {
recordError("options");
return false;
}
if(
typeof value !== "string"
) {
recordError("string");
return false;
}
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/oneOf/items}
*/
export function isOneOfItems(value: unknown): value is types.OneOfItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("OneOfItems", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/anyOf/items}
*/
export function isAnyOfItems(value: unknown): value is types.AnyOfItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AnyOfItems", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/allOf/items}
*/
export function isAllOfItems(value: unknown): value is types.AllOfItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AllOfItems", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/dependentSchemas/additionalProperties}
*/
export function isDependentSchemasAdditionalProperties(value: unknown): value is types.DependentSchemasAdditionalProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("DependentSchemasAdditionalProperties", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/objectProperties/additionalProperties}
*/
export function isObjectPropertiesAdditionalProperties(value: unknown): value is types.ObjectPropertiesAdditionalProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("ObjectPropertiesAdditionalProperties", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/patternProperties/additionalProperties}
*/
export function isPatternPropertiesAdditionalProperties(value: unknown): value is types.PatternPropertiesAdditionalProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PatternPropertiesAdditionalProperties", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/tupleItems/items}
*/
export function isTupleItemsItems(value: unknown): value is types.TupleItemsItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("TupleItemsItems", () => {
if(!isNodeReference(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/options/items}
*/
export function isOptionsItems(value: unknown): value is types.OptionsItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("OptionsItems", () => {
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/required/items}
*/
export function isRequiredItems(value: unknown): value is types.RequiredItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("RequiredItems", () => {
if(!isStringValue(value)) {
return false;
};
return true;
;
});
}
finally {
depth -= 1;
}
}
