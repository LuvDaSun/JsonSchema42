// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.12.7                         -- www.JsonSchema42.org
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
* @description Core schema meta-schema
* @see {@link http://json-schema.org/draft-04/schema#}
*/
export function isSchemaDocument(value: unknown): value is types.SchemaDocument {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("SchemaDocument", () => {
if(!((
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
))) {
recordError("types");
return false;
}
if(
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
) {
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
case "id":
if(!withPath(propertyName, () => {
if(!isId(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
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
case "default":
if(!withPath(propertyName, () => {
if(!isDefault(propertyValue)) {
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
case "maximum":
if(!withPath(propertyName, () => {
if(!isMaximum(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "exclusiveMaximum":
if(!withPath(propertyName, () => {
if(!isExclusiveMaximum(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "minimum":
if(!withPath(propertyName, () => {
if(!isMinimum(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "exclusiveMinimum":
if(!withPath(propertyName, () => {
if(!isExclusiveMinimum(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "maxLength":
if(!withPath(propertyName, () => {
if(!isMaxLength(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "minLength":
if(!withPath(propertyName, () => {
if(!isMinLength(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "pattern":
if(!withPath(propertyName, () => {
if(!isPattern(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "additionalItems":
if(!withPath(propertyName, () => {
if(!isAdditionalItems(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "items":
if(!withPath(propertyName, () => {
if(!isPropertiesItems(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "maxItems":
if(!withPath(propertyName, () => {
if(!isMaxItems(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "minItems":
if(!withPath(propertyName, () => {
if(!isMinItems(propertyValue)) {
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
case "maxProperties":
if(!withPath(propertyName, () => {
if(!isMaxProperties(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "minProperties":
if(!withPath(propertyName, () => {
if(!isMinProperties(propertyValue)) {
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
case "additionalProperties":
if(!withPath(propertyName, () => {
if(!isPropertiesAdditionalProperties(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "definitions":
if(!withPath(propertyName, () => {
if(!isDefinitions(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "properties":
if(!withPath(propertyName, () => {
if(!isProperties(propertyValue)) {
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
case "dependencies":
if(!withPath(propertyName, () => {
if(!isDependencies(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "enum":
if(!withPath(propertyName, () => {
if(!isEnum(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "type":
if(!withPath(propertyName, () => {
if(!isType(propertyValue)) {
recordError("objectProperties");
return false;
}
return true;
})) {
return false
}
break;
case "format":
if(!withPath(propertyName, () => {
if(!isFormat(propertyValue)) {
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
default:
break;
}
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
* @see {@link http://json-schema.org/draft-04/schema#/definitions/schemaArray}
*/
export function isSchemaArray(value: unknown): value is types.SchemaArray {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("SchemaArray", () => {
if(!((Array.isArray(value)))) {
recordError("types");
return false;
}
if(
Array.isArray(value)
) {
if(value.length < 1) {
recordError("minimumItems");
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
switch(elementIndex) {
default:
if(!withPath(String(elementIndex), () => {
if(!isSchemaArrayItems(elementValue)) {
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
* @see {@link http://json-schema.org/draft-04/schema#/definitions/positiveInteger}
*/
export function isPositiveInteger(value: unknown): value is types.PositiveInteger {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PositiveInteger", () => {
if(!((
typeof value === "number" &&
!isNaN(value) &&
value % 1 === 0
))) {
recordError("types");
return false;
}
if(
typeof value === "number" &&
!isNaN(value)
) {
if(
value < 0
) {
recordError("minimumInclusive");
return false;
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
* @see {@link http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0}
*/
export function isPositiveIntegerDefault0(value: unknown): value is types.PositiveIntegerDefault0 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PositiveIntegerDefault0", () => {
{
let counter = 0;
if(counter === 0 && isPositiveIntegerDefault00(value)) {
counter += 1;
}
if(counter === 1 && isPositiveIntegerDefault01(value)) {
counter += 1;
}
if(counter < 2) {
recordError("allOf");
return false;
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
* @see {@link http://json-schema.org/draft-04/schema#/definitions/simpleTypes}
*/
export function isSimpleTypes(value: unknown): value is types.SimpleTypes {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("SimpleTypes", () => {
if(
value !== "array" &&
value !== "boolean" &&
value !== "integer" &&
value !== "null" &&
value !== "number" &&
value !== "object" &&
value !== "string"
) {
recordError("options");
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
* @see {@link http://json-schema.org/draft-04/schema#/definitions/stringArray}
*/
export function isStringArray(value: unknown): value is types.StringArray {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("StringArray", () => {
if(!((Array.isArray(value)))) {
recordError("types");
return false;
}
if(
Array.isArray(value)
) {
if(value.length < 1) {
recordError("minimumItems");
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
if(!isStringArrayItems(elementValue)) {
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/id}
*/
export function isId(value: unknown): value is types.Id {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Id", () => {
if(!((typeof value === "string"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/$schema}
*/
export function isSchema(value: unknown): value is types.Schema {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Schema", () => {
if(!((typeof value === "string"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/title}
*/
export function isTitle(value: unknown): value is types.Title {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Title", () => {
if(!((typeof value === "string"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/description}
*/
export function isDescription(value: unknown): value is types.Description {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Description", () => {
if(!((typeof value === "string"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/default}
*/
export function isDefault(value: unknown): value is types.Default {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Default", () => {
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/multipleOf}
*/
export function isMultipleOf(value: unknown): value is types.MultipleOf {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MultipleOf", () => {
if(!((
typeof value === "number" &&
!isNaN(value)
))) {
recordError("types");
return false;
}
if(
typeof value === "number" &&
!isNaN(value)
) {
if(
value <= 0
) {
recordError("minimumExclusive");
return false;
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/maximum}
*/
export function isMaximum(value: unknown): value is types.Maximum {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Maximum", () => {
if(!((
typeof value === "number" &&
!isNaN(value)
))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/exclusiveMaximum}
*/
export function isExclusiveMaximum(value: unknown): value is types.ExclusiveMaximum {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("ExclusiveMaximum", () => {
if(!((typeof value === "boolean"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/minimum}
*/
export function isMinimum(value: unknown): value is types.Minimum {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Minimum", () => {
if(!((
typeof value === "number" &&
!isNaN(value)
))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/exclusiveMinimum}
*/
export function isExclusiveMinimum(value: unknown): value is types.ExclusiveMinimum {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("ExclusiveMinimum", () => {
if(!((typeof value === "boolean"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/maxLength}
*/
export function isMaxLength(value: unknown): value is types.MaxLength {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MaxLength", () => {
if(!isPositiveInteger(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/minLength}
*/
export function isMinLength(value: unknown): value is types.MinLength {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MinLength", () => {
if(!isPositiveIntegerDefault0(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/pattern}
*/
export function isPattern(value: unknown): value is types.Pattern {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Pattern", () => {
if(!((typeof value === "string"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalItems}
*/
export function isAdditionalItems(value: unknown): value is types.AdditionalItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AdditionalItems", () => {
{
let counter = 0;
if(counter < 1 && isAdditionalItems0(value)) {
counter += 1;
}
if(counter < 1 && isAdditionalItems1(value)) {
counter += 1;
}
if(counter < 1) {
recordError("anyOf");
return false;
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/items}
*/
export function isPropertiesItems(value: unknown): value is types.PropertiesItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PropertiesItems", () => {
{
let counter = 0;
if(counter < 1 && isItems0(value)) {
counter += 1;
}
if(counter < 1 && isItems1(value)) {
counter += 1;
}
if(counter < 1) {
recordError("anyOf");
return false;
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/maxItems}
*/
export function isMaxItems(value: unknown): value is types.MaxItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MaxItems", () => {
if(!isPositiveInteger(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/minItems}
*/
export function isMinItems(value: unknown): value is types.MinItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MinItems", () => {
if(!isPositiveIntegerDefault0(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/uniqueItems}
*/
export function isUniqueItems(value: unknown): value is types.UniqueItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("UniqueItems", () => {
if(!((typeof value === "boolean"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/maxProperties}
*/
export function isMaxProperties(value: unknown): value is types.MaxProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MaxProperties", () => {
if(!isPositiveInteger(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/minProperties}
*/
export function isMinProperties(value: unknown): value is types.MinProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("MinProperties", () => {
if(!isPositiveIntegerDefault0(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/required}
*/
export function isRequired(value: unknown): value is types.Required {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Required", () => {
if(!isStringArray(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalProperties}
*/
export function isPropertiesAdditionalProperties(value: unknown): value is types.PropertiesAdditionalProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PropertiesAdditionalProperties", () => {
{
let counter = 0;
if(counter < 1 && isAdditionalProperties0(value)) {
counter += 1;
}
if(counter < 1 && isAdditionalProperties1(value)) {
counter += 1;
}
if(counter < 1) {
recordError("anyOf");
return false;
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/definitions}
*/
export function isDefinitions(value: unknown): value is types.Definitions {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Definitions", () => {
if(!((
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
))) {
recordError("types");
return false;
}
if(
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
) {
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
default:
if(!withPath(propertyName, () => {
if(
!isDefinitionsAdditionalProperties(propertyValue)
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/properties}
*/
export function isProperties(value: unknown): value is types.Properties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Properties", () => {
if(!((
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
))) {
recordError("types");
return false;
}
if(
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
) {
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
default:
if(!withPath(propertyName, () => {
if(
!isPropertiesPropertiesAdditionalProperties(propertyValue)
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/patternProperties}
*/
export function isPatternProperties(value: unknown): value is types.PatternProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PatternProperties", () => {
if(!((
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
))) {
recordError("types");
return false;
}
if(
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
) {
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/dependencies}
*/
export function isDependencies(value: unknown): value is types.Dependencies {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Dependencies", () => {
if(!((
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
))) {
recordError("types");
return false;
}
if(
value !== null &&
typeof value === "object" &&
!Array.isArray(value)
) {
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
default:
if(!withPath(propertyName, () => {
if(
!isDependenciesAdditionalProperties(propertyValue)
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/enum}
*/
export function isEnum(value: unknown): value is types.Enum {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Enum", () => {
if(!((Array.isArray(value)))) {
recordError("types");
return false;
}
if(
Array.isArray(value)
) {
if(value.length < 1) {
recordError("minimumItems");
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
break;
}
elementValueSeen.add(elementValue);
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/type}
*/
export function isType(value: unknown): value is types.Type {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Type", () => {
{
let counter = 0;
if(counter < 1 && isType0(value)) {
counter += 1;
}
if(counter < 1 && isType1(value)) {
counter += 1;
}
if(counter < 1) {
recordError("anyOf");
return false;
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/format}
*/
export function isFormat(value: unknown): value is types.Format {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Format", () => {
if(!((typeof value === "string"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/allOf}
*/
export function isAllOf(value: unknown): value is types.AllOf {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AllOf", () => {
if(!isSchemaArray(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/anyOf}
*/
export function isAnyOf(value: unknown): value is types.AnyOf {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AnyOf", () => {
if(!isSchemaArray(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/oneOf}
*/
export function isOneOf(value: unknown): value is types.OneOf {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("OneOf", () => {
if(!isSchemaArray(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/not}
*/
export function isNot(value: unknown): value is types.Not {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Not", () => {
if(!isSchemaDocument(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/definitions/schemaArray/items}
*/
export function isSchemaArrayItems(value: unknown): value is types.SchemaArrayItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("SchemaArrayItems", () => {
if(!isSchemaDocument(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0/allOf/0}
*/
export function isPositiveIntegerDefault00(value: unknown): value is types.PositiveIntegerDefault00 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PositiveIntegerDefault00", () => {
if(!isPositiveInteger(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0/allOf/1}
*/
export function isPositiveIntegerDefault01(value: unknown): value is types.PositiveIntegerDefault01 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PositiveIntegerDefault01", () => {
return true;
;
});
}
finally {
depth -= 1;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/stringArray/items}
*/
export function isStringArrayItems(value: unknown): value is types.StringArrayItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("StringArrayItems", () => {
if(!((typeof value === "string"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalItems/anyOf/0}
*/
export function isAdditionalItems0(value: unknown): value is types.AdditionalItems0 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AdditionalItems0", () => {
if(!((typeof value === "boolean"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalItems/anyOf/1}
*/
export function isAdditionalItems1(value: unknown): value is types.AdditionalItems1 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AdditionalItems1", () => {
if(!isSchemaDocument(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/items/anyOf/0}
*/
export function isItems0(value: unknown): value is types.Items0 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Items0", () => {
if(!isSchemaDocument(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/items/anyOf/1}
*/
export function isItems1(value: unknown): value is types.Items1 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Items1", () => {
if(!isSchemaArray(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalProperties/anyOf/0}
*/
export function isAdditionalProperties0(value: unknown): value is types.AdditionalProperties0 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AdditionalProperties0", () => {
if(!((typeof value === "boolean"))) {
recordError("types");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/additionalProperties/anyOf/1}
*/
export function isAdditionalProperties1(value: unknown): value is types.AdditionalProperties1 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("AdditionalProperties1", () => {
if(!isSchemaDocument(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/definitions/additionalProperties}
*/
export function isDefinitionsAdditionalProperties(value: unknown): value is types.DefinitionsAdditionalProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("DefinitionsAdditionalProperties", () => {
if(!isSchemaDocument(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/properties/additionalProperties}
*/
export function isPropertiesPropertiesAdditionalProperties(value: unknown): value is types.PropertiesPropertiesAdditionalProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PropertiesPropertiesAdditionalProperties", () => {
if(!isSchemaDocument(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/patternProperties/additionalProperties}
*/
export function isPatternPropertiesAdditionalProperties(value: unknown): value is types.PatternPropertiesAdditionalProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("PatternPropertiesAdditionalProperties", () => {
if(!isSchemaDocument(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/dependencies/additionalProperties}
*/
export function isDependenciesAdditionalProperties(value: unknown): value is types.DependenciesAdditionalProperties {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("DependenciesAdditionalProperties", () => {
{
let counter = 0;
if(counter < 1 && isDependencies0(value)) {
counter += 1;
}
if(counter < 1 && isDependencies1(value)) {
counter += 1;
}
if(counter < 1) {
recordError("anyOf");
return false;
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/type/anyOf/0}
*/
export function isType0(value: unknown): value is types.Type0 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Type0", () => {
if(!isSimpleTypes(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/type/anyOf/1}
*/
export function isType1(value: unknown): value is types.Type1 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Type1", () => {
if(!((Array.isArray(value)))) {
recordError("types");
return false;
}
if(
Array.isArray(value)
) {
if(value.length < 1) {
recordError("minimumItems");
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
if(!isTypeItems(elementValue)) {
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/dependencies/additionalProperties/anyOf/0}
*/
export function isDependencies0(value: unknown): value is types.Dependencies0 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Dependencies0", () => {
if(!isSchemaDocument(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/dependencies/additionalProperties/anyOf/1}
*/
export function isDependencies1(value: unknown): value is types.Dependencies1 {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("Dependencies1", () => {
if(!isStringArray(value)) {
recordError("reference");
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
* @see {@link http://json-schema.org/draft-04/schema#/properties/type/anyOf/1/items}
*/
export function isTypeItems(value: unknown): value is types.TypeItems {
if(depth === 0) {
resetErrors();
}
depth += 1;
try{
return withType("TypeItems", () => {
if(!isSimpleTypes(value)) {
recordError("reference");
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
