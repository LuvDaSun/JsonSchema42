// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.9.6                          -- www.JsonSchema42.org
//
import * as types from "./types.js";
export interface ValidationError {
typeName: string,
}
/**
* @summary JsonSchema42 intermediate schema
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json}
*/
export function isSchemaDocument(value: unknown, errors = new Array<ValidationError>()): value is types.SchemaDocument {
if (!((value !== null) &&
(typeof value === "object") &&
(!Array.isArray(value)) &&
("$schema" in value) &&
(value["$schema"] !== undefined) &&
("schemas" in value) &&
(value["schemas"] !== undefined) &&
(
(()=>{
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
case "$schema":
if(!isSchema(propertyValue, errors)) {
return false;
}
break;
case "schemas":
if(!isSchemas(propertyValue, errors)) {
return false;
}
break;
}
}
return true;
})()
))) {
errors.push({"typeName":"SchemaDocument"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node}
*/
export function isNode(value: unknown, errors = new Array<ValidationError>()): value is types.Node {
if (!((value !== null) &&
(typeof value === "object") &&
(!Array.isArray(value)) &&
(
(()=>{
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
switch(propertyName) {
case "title":
if(!isTitle(propertyValue, errors)) {
return false;
}
break;
case "description":
if(!isDescription(propertyValue, errors)) {
return false;
}
break;
case "examples":
if(!isExamples(propertyValue, errors)) {
return false;
}
break;
case "deprecated":
if(!isDeprecated(propertyValue, errors)) {
return false;
}
break;
case "types":
if(!isTypes(propertyValue, errors)) {
return false;
}
break;
case "reference":
if(!isReference(propertyValue, errors)) {
return false;
}
break;
case "oneOf":
if(!isOneOf(propertyValue, errors)) {
return false;
}
break;
case "anyOf":
if(!isAnyOf(propertyValue, errors)) {
return false;
}
break;
case "allOf":
if(!isAllOf(propertyValue, errors)) {
return false;
}
break;
case "if":
if(!isIf(propertyValue, errors)) {
return false;
}
break;
case "then":
if(!isThen(propertyValue, errors)) {
return false;
}
break;
case "else":
if(!isElse(propertyValue, errors)) {
return false;
}
break;
case "not":
if(!isNot(propertyValue, errors)) {
return false;
}
break;
case "dependentSchemas":
if(!isDependentSchemas(propertyValue, errors)) {
return false;
}
break;
case "objectProperties":
if(!isObjectProperties(propertyValue, errors)) {
return false;
}
break;
case "mapProperties":
if(!isMapProperties(propertyValue, errors)) {
return false;
}
break;
case "patternProperties":
if(!isPatternProperties(propertyValue, errors)) {
return false;
}
break;
case "propertyNames":
if(!isPropertyNames(propertyValue, errors)) {
return false;
}
break;
case "tupleItems":
if(!isTupleItems(propertyValue, errors)) {
return false;
}
break;
case "arrayItems":
if(!isArrayItems(propertyValue, errors)) {
return false;
}
break;
case "contains":
if(!isContains(propertyValue, errors)) {
return false;
}
break;
case "options":
if(!isOptions(propertyValue, errors)) {
return false;
}
break;
case "minimumInclusive":
if(!isMinimumInclusive(propertyValue, errors)) {
return false;
}
break;
case "minimumExclusive":
if(!isMinimumExclusive(propertyValue, errors)) {
return false;
}
break;
case "maximumInclusive":
if(!isMaximumInclusive(propertyValue, errors)) {
return false;
}
break;
case "maximumExclusive":
if(!isMaximumExclusive(propertyValue, errors)) {
return false;
}
break;
case "multipleOf":
if(!isMultipleOf(propertyValue, errors)) {
return false;
}
break;
case "minimumLength":
if(!isMinimumLength(propertyValue, errors)) {
return false;
}
break;
case "maximumLength":
if(!isMaximumLength(propertyValue, errors)) {
return false;
}
break;
case "valuePattern":
if(!isValuePattern(propertyValue, errors)) {
return false;
}
break;
case "valueFormat":
if(!isValueFormat(propertyValue, errors)) {
return false;
}
break;
case "minimumItems":
if(!isMinimumItems(propertyValue, errors)) {
return false;
}
break;
case "maximumItems":
if(!isMaximumItems(propertyValue, errors)) {
return false;
}
break;
case "uniqueItems":
if(!isUniqueItems(propertyValue, errors)) {
return false;
}
break;
case "required":
if(!isRequired(propertyValue, errors)) {
return false;
}
break;
case "minimumProperties":
if(!isMinimumProperties(propertyValue, errors)) {
return false;
}
break;
case "maximumProperties":
if(!isMaximumProperties(propertyValue, errors)) {
return false;
}
break;
}
}
return true;
})()
))) {
errors.push({"typeName":"Node"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node-reference}
*/
export function isNodeReference(value: unknown, errors = new Array<ValidationError>()): value is types.NodeReference {
if (!((typeof value === "string"))) {
errors.push({"typeName":"NodeReference"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/integer-value}
*/
export function isIntegerValue(value: unknown, errors = new Array<ValidationError>()): value is types.IntegerValue {
if (!((typeof value === "number") &&
(!isNaN(value)) &&
(value % 1 === 0))) {
errors.push({"typeName":"IntegerValue"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/number-value}
*/
export function isNumberValue(value: unknown, errors = new Array<ValidationError>()): value is types.NumberValue {
if (!((typeof value === "number") &&
(!isNaN(value)))) {
errors.push({"typeName":"NumberValue"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/boolean-value}
*/
export function isBooleanValue(value: unknown, errors = new Array<ValidationError>()): value is types.BooleanValue {
if (!((typeof value === "boolean"))) {
errors.push({"typeName":"BooleanValue"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/string-value}
*/
export function isStringValue(value: unknown, errors = new Array<ValidationError>()): value is types.StringValue {
if (!((typeof value === "string"))) {
errors.push({"typeName":"StringValue"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/non-empty-string-value}
*/
export function isNonEmptyStringValue(value: unknown, errors = new Array<ValidationError>()): value is types.NonEmptyStringValue {
if (!((typeof value === "string"))) {
errors.push({"typeName":"NonEmptyStringValue"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/amount}
*/
export function isAmount(value: unknown, errors = new Array<ValidationError>()): value is types.Amount {
if (!((typeof value === "number") &&
(!isNaN(value)) &&
(value % 1 === 0))) {
errors.push({"typeName":"Amount"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/$schema}
*/
export function isSchema(value: unknown, errors = new Array<ValidationError>()): value is types.Schema {
if (!((typeof value === "string") &&
(value === "https://schema.JsonSchema42.org/jns42-intermediate/schema.json"))) {
errors.push({"typeName":"Schema"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/schemas}
*/
export function isSchemas(value: unknown, errors = new Array<ValidationError>()): value is types.Schemas {
if (!((value !== null) &&
(typeof value === "object") &&
(!Array.isArray(value)) &&
(
(()=>{
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
if(!(typeof propertyName === "string")) {
return false;
}
if(!isSchemasAdditionalProperties(propertyValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"Schemas"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/title}
*/
export function isTitle(value: unknown, errors = new Array<ValidationError>()): value is types.Title {
if (!((isNonEmptyStringValue(value, errors)))) {
errors.push({"typeName":"Title"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/description}
*/
export function isDescription(value: unknown, errors = new Array<ValidationError>()): value is types.Description {
if (!((isNonEmptyStringValue(value, errors)))) {
errors.push({"typeName":"Description"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/examples}
*/
export function isExamples(value: unknown, errors = new Array<ValidationError>()): value is types.Examples {
if (!((Array.isArray(value)) &&
(
(()=>{
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isExamplesItems(elementValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"Examples"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/deprecated}
*/
export function isDeprecated(value: unknown, errors = new Array<ValidationError>()): value is types.Deprecated {
if (!((isBooleanValue(value, errors)))) {
errors.push({"typeName":"Deprecated"})
return false;
}
return true;
}
/**
* @description What types does this schema describe<br />
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/types}
*/
export function isTypes(value: unknown, errors = new Array<ValidationError>()): value is types.Types {
if (!((Array.isArray(value)) &&
(
(()=>{
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isTypesItems(elementValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"Types"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/reference}
*/
export function isReference(value: unknown, errors = new Array<ValidationError>()): value is types.Reference {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"Reference"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/oneOf}
*/
export function isOneOf(value: unknown, errors = new Array<ValidationError>()): value is types.OneOf {
if (!((Array.isArray(value)) &&
(
(()=>{
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isOneOfItems(elementValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"OneOf"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/anyOf}
*/
export function isAnyOf(value: unknown, errors = new Array<ValidationError>()): value is types.AnyOf {
if (!((Array.isArray(value)) &&
(
(()=>{
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isAnyOfItems(elementValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"AnyOf"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/allOf}
*/
export function isAllOf(value: unknown, errors = new Array<ValidationError>()): value is types.AllOf {
if (!((Array.isArray(value)) &&
(
(()=>{
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isAllOfItems(elementValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"AllOf"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/if}
*/
export function isIf(value: unknown, errors = new Array<ValidationError>()): value is types.If {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"If"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/then}
*/
export function isThen(value: unknown, errors = new Array<ValidationError>()): value is types.Then {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"Then"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/else}
*/
export function isElse(value: unknown, errors = new Array<ValidationError>()): value is types.Else {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"Else"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/not}
*/
export function isNot(value: unknown, errors = new Array<ValidationError>()): value is types.Not {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"Not"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/dependentSchemas}
*/
export function isDependentSchemas(value: unknown, errors = new Array<ValidationError>()): value is types.DependentSchemas {
if (!((value !== null) &&
(typeof value === "object") &&
(!Array.isArray(value)) &&
(
(()=>{
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
if(!(typeof propertyName === "string")) {
return false;
}
if(!isDependentSchemasAdditionalProperties(propertyValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"DependentSchemas"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/objectProperties}
*/
export function isObjectProperties(value: unknown, errors = new Array<ValidationError>()): value is types.ObjectProperties {
if (!((value !== null) &&
(typeof value === "object") &&
(!Array.isArray(value)) &&
(
(()=>{
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
if(!(typeof propertyName === "string")) {
return false;
}
if(!isObjectPropertiesAdditionalProperties(propertyValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"ObjectProperties"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/mapProperties}
*/
export function isMapProperties(value: unknown, errors = new Array<ValidationError>()): value is types.MapProperties {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"MapProperties"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/patternProperties}
*/
export function isPatternProperties(value: unknown, errors = new Array<ValidationError>()): value is types.PatternProperties {
if (!((value !== null) &&
(typeof value === "object") &&
(!Array.isArray(value)) &&
(
(()=>{
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(propertyValue === undefined) {
continue;
}
if(!(typeof propertyName === "string")) {
return false;
}
if(!isPatternPropertiesAdditionalProperties(propertyValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"PatternProperties"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/propertyNames}
*/
export function isPropertyNames(value: unknown, errors = new Array<ValidationError>()): value is types.PropertyNames {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"PropertyNames"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/tupleItems}
*/
export function isTupleItems(value: unknown, errors = new Array<ValidationError>()): value is types.TupleItems {
if (!((Array.isArray(value)) &&
(
(()=>{
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isTupleItemsItems(elementValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"TupleItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/arrayItems}
*/
export function isArrayItems(value: unknown, errors = new Array<ValidationError>()): value is types.ArrayItems {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"ArrayItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/contains}
*/
export function isContains(value: unknown, errors = new Array<ValidationError>()): value is types.Contains {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"Contains"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/options}
*/
export function isOptions(value: unknown, errors = new Array<ValidationError>()): value is types.Options {
if (!((Array.isArray(value)) &&
(
(()=>{
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isOptionsItems(elementValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"Options"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumInclusive}
*/
export function isMinimumInclusive(value: unknown, errors = new Array<ValidationError>()): value is types.MinimumInclusive {
if (!((isNumberValue(value, errors)))) {
errors.push({"typeName":"MinimumInclusive"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumExclusive}
*/
export function isMinimumExclusive(value: unknown, errors = new Array<ValidationError>()): value is types.MinimumExclusive {
if (!((isNumberValue(value, errors)))) {
errors.push({"typeName":"MinimumExclusive"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumInclusive}
*/
export function isMaximumInclusive(value: unknown, errors = new Array<ValidationError>()): value is types.MaximumInclusive {
if (!((isNumberValue(value, errors)))) {
errors.push({"typeName":"MaximumInclusive"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumExclusive}
*/
export function isMaximumExclusive(value: unknown, errors = new Array<ValidationError>()): value is types.MaximumExclusive {
if (!((isNumberValue(value, errors)))) {
errors.push({"typeName":"MaximumExclusive"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/multipleOf}
*/
export function isMultipleOf(value: unknown, errors = new Array<ValidationError>()): value is types.MultipleOf {
if (!((isNumberValue(value, errors)))) {
errors.push({"typeName":"MultipleOf"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumLength}
*/
export function isMinimumLength(value: unknown, errors = new Array<ValidationError>()): value is types.MinimumLength {
if (!((isAmount(value, errors)))) {
errors.push({"typeName":"MinimumLength"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumLength}
*/
export function isMaximumLength(value: unknown, errors = new Array<ValidationError>()): value is types.MaximumLength {
if (!((isAmount(value, errors)))) {
errors.push({"typeName":"MaximumLength"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/valuePattern}
*/
export function isValuePattern(value: unknown, errors = new Array<ValidationError>()): value is types.ValuePattern {
if (!((isNonEmptyStringValue(value, errors)))) {
errors.push({"typeName":"ValuePattern"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/valueFormat}
*/
export function isValueFormat(value: unknown, errors = new Array<ValidationError>()): value is types.ValueFormat {
if (!((isNonEmptyStringValue(value, errors)))) {
errors.push({"typeName":"ValueFormat"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumItems}
*/
export function isMinimumItems(value: unknown, errors = new Array<ValidationError>()): value is types.MinimumItems {
if (!((isAmount(value, errors)))) {
errors.push({"typeName":"MinimumItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumItems}
*/
export function isMaximumItems(value: unknown, errors = new Array<ValidationError>()): value is types.MaximumItems {
if (!((isAmount(value, errors)))) {
errors.push({"typeName":"MaximumItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/uniqueItems}
*/
export function isUniqueItems(value: unknown, errors = new Array<ValidationError>()): value is types.UniqueItems {
if (!((typeof value === "boolean"))) {
errors.push({"typeName":"UniqueItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/required}
*/
export function isRequired(value: unknown, errors = new Array<ValidationError>()): value is types.Required {
if (!((Array.isArray(value)) &&
(
(()=>{
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isRequiredItems(elementValue, errors)) {
return false;
}
}
return true;
})()
))) {
errors.push({"typeName":"Required"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumProperties}
*/
export function isMinimumProperties(value: unknown, errors = new Array<ValidationError>()): value is types.MinimumProperties {
if (!((isAmount(value, errors)))) {
errors.push({"typeName":"MinimumProperties"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumProperties}
*/
export function isMaximumProperties(value: unknown, errors = new Array<ValidationError>()): value is types.MaximumProperties {
if (!((isAmount(value, errors)))) {
errors.push({"typeName":"MaximumProperties"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/schemas/additionalProperties}
*/
export function isSchemasAdditionalProperties(value: unknown, errors = new Array<ValidationError>()): value is types.SchemasAdditionalProperties {
if (!((isNode(value, errors)))) {
errors.push({"typeName":"SchemasAdditionalProperties"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/examples/items}
*/
export function isExamplesItems(value: unknown, errors = new Array<ValidationError>()): value is types.ExamplesItems {
if (!((
// any
true
))) {
errors.push({"typeName":"ExamplesItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/types/items}
*/
export function isTypesItems(value: unknown, errors = new Array<ValidationError>()): value is types.TypesItems {
if (!((typeof value === "string") &&
(value === "never" ||
value === "any" ||
value === "null" ||
value === "boolean" ||
value === "integer" ||
value === "number" ||
value === "string" ||
value === "array" ||
value === "map"))) {
errors.push({"typeName":"TypesItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/oneOf/items}
*/
export function isOneOfItems(value: unknown, errors = new Array<ValidationError>()): value is types.OneOfItems {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"OneOfItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/anyOf/items}
*/
export function isAnyOfItems(value: unknown, errors = new Array<ValidationError>()): value is types.AnyOfItems {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"AnyOfItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/allOf/items}
*/
export function isAllOfItems(value: unknown, errors = new Array<ValidationError>()): value is types.AllOfItems {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"AllOfItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/dependentSchemas/additionalProperties}
*/
export function isDependentSchemasAdditionalProperties(value: unknown, errors = new Array<ValidationError>()): value is types.DependentSchemasAdditionalProperties {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"DependentSchemasAdditionalProperties"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/objectProperties/additionalProperties}
*/
export function isObjectPropertiesAdditionalProperties(value: unknown, errors = new Array<ValidationError>()): value is types.ObjectPropertiesAdditionalProperties {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"ObjectPropertiesAdditionalProperties"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/patternProperties/additionalProperties}
*/
export function isPatternPropertiesAdditionalProperties(value: unknown, errors = new Array<ValidationError>()): value is types.PatternPropertiesAdditionalProperties {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"PatternPropertiesAdditionalProperties"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/tupleItems/items}
*/
export function isTupleItemsItems(value: unknown, errors = new Array<ValidationError>()): value is types.TupleItemsItems {
if (!((isNodeReference(value, errors)))) {
errors.push({"typeName":"TupleItemsItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/options/items}
*/
export function isOptionsItems(value: unknown, errors = new Array<ValidationError>()): value is types.OptionsItems {
if (!((
// any
true
))) {
errors.push({"typeName":"OptionsItems"})
return false;
}
return true;
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/required/items}
*/
export function isRequiredItems(value: unknown, errors = new Array<ValidationError>()): value is types.RequiredItems {
if (!((isStringValue(value, errors)))) {
errors.push({"typeName":"RequiredItems"})
return false;
}
return true;
}
