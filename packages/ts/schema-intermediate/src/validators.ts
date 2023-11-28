// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.8.12                         -- www.JsonSchema42.org
import * as types from "./types.js";
export function isSchemaJson(value: unknown): value is types.SchemaJson {
if(!_isMapSchemaJson(value)) {
return false;
}
return true;
}
function _isMapSchemaJson(value: unknown): value is unknown {
if(typeof value !== "object" || value === null || Array.isArray(value)) {
return false;
}
if(!("$schema" in value)) {
return false;
}
if(!("schemas" in value)) {
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
switch(propertyName) {
case "$schema":
if(!isSchema(propertyValue)) {
return false;
}
continue;
case "schemas":
if(!isSchemas(propertyValue)) {
return false;
}
continue;
}
}
return true;
}
export function isNode(value: unknown): value is types.Node {
if(!_isMapNode(value)) {
return false;
}
return true;
}
function _isMapNode(value: unknown): value is unknown {
if(typeof value !== "object" || value === null || Array.isArray(value)) {
return false;
}
if(!("deprecated" in value)) {
return false;
}
if(!("types" in value)) {
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
switch(propertyName) {
case "title":
if(!isTitle(propertyValue)) {
return false;
}
continue;
case "description":
if(!isDescription(propertyValue)) {
return false;
}
continue;
case "examples":
if(!isExamples(propertyValue)) {
return false;
}
continue;
case "deprecated":
if(!isDeprecated(propertyValue)) {
return false;
}
continue;
case "types":
if(!isTypes(propertyValue)) {
return false;
}
continue;
case "reference":
if(!isReference(propertyValue)) {
return false;
}
continue;
case "oneOf":
if(!isOneOf(propertyValue)) {
return false;
}
continue;
case "anyOf":
if(!isAnyOf(propertyValue)) {
return false;
}
continue;
case "allOf":
if(!isAllOf(propertyValue)) {
return false;
}
continue;
case "if":
if(!isIf(propertyValue)) {
return false;
}
continue;
case "then":
if(!isThen(propertyValue)) {
return false;
}
continue;
case "else":
if(!isElse(propertyValue)) {
return false;
}
continue;
case "not":
if(!isNot(propertyValue)) {
return false;
}
continue;
case "dependentSchemas":
if(!isDependentSchemas(propertyValue)) {
return false;
}
continue;
case "objectProperties":
if(!isObjectProperties(propertyValue)) {
return false;
}
continue;
case "mapProperties":
if(!isMapProperties(propertyValue)) {
return false;
}
continue;
case "patternProperties":
if(!isPatternProperties(propertyValue)) {
return false;
}
continue;
case "propertyNames":
if(!isPropertyNames(propertyValue)) {
return false;
}
continue;
case "tupleItems":
if(!isTupleItems(propertyValue)) {
return false;
}
continue;
case "arrayItems":
if(!isArrayItems(propertyValue)) {
return false;
}
continue;
case "contains":
if(!isContains(propertyValue)) {
return false;
}
continue;
case "options":
if(!isOptions(propertyValue)) {
return false;
}
continue;
case "minimumInclusive":
if(!isMinimumInclusive(propertyValue)) {
return false;
}
continue;
case "minimumExclusive":
if(!isMinimumExclusive(propertyValue)) {
return false;
}
continue;
case "maximumInclusive":
if(!isMaximumInclusive(propertyValue)) {
return false;
}
continue;
case "maximumExclusive":
if(!isMaximumExclusive(propertyValue)) {
return false;
}
continue;
case "multipleOf":
if(!isMultipleOf(propertyValue)) {
return false;
}
continue;
case "minimumLength":
if(!isMinimumLength(propertyValue)) {
return false;
}
continue;
case "maximumLength":
if(!isMaximumLength(propertyValue)) {
return false;
}
continue;
case "valuePattern":
if(!isValuePattern(propertyValue)) {
return false;
}
continue;
case "valueFormat":
if(!isValueFormat(propertyValue)) {
return false;
}
continue;
case "minimumItems":
if(!isMinimumItems(propertyValue)) {
return false;
}
continue;
case "maximumItems":
if(!isMaximumItems(propertyValue)) {
return false;
}
continue;
case "uniqueItems":
if(!isUniqueItems(propertyValue)) {
return false;
}
continue;
case "required":
if(!isRequired(propertyValue)) {
return false;
}
continue;
case "minimumProperties":
if(!isMinimumProperties(propertyValue)) {
return false;
}
continue;
case "maximumProperties":
if(!isMaximumProperties(propertyValue)) {
return false;
}
continue;
}
}
return true;
}
export function isNodeReference(value: unknown): value is types.NodeReference {
if(!_isStringNodeReference(value)) {
return false;
}
return true;
}
function _isStringNodeReference(value: unknown): value is unknown {
if(typeof value !== "string") {
return false;
}
return true;
}
export function isIntegerValue(value: unknown): value is types.IntegerValue {
if(!_isIntegerIntegerValue(value)) {
return false;
}
return true;
}
function _isIntegerIntegerValue(value: unknown): value is unknown {
if(typeof value !== "number" || isNaN(value)) {
return false;
}
return true;
}
export function isNumberValue(value: unknown): value is types.NumberValue {
if(!_isNumberNumberValue(value)) {
return false;
}
return true;
}
function _isNumberNumberValue(value: unknown): value is unknown {
if(typeof value !== "number" || isNaN(value) || value % 1 !== 0) {
return false;
}
return true;
}
export function isBooleanValue(value: unknown): value is types.BooleanValue {
if(!_isBooleanBooleanValue(value)) {
return false;
}
return true;
}
function _isBooleanBooleanValue(value: unknown): value is unknown {
if(typeof value !== "boolean") {
return false;
}
return true;
}
export function isStringValue(value: unknown): value is types.StringValue {
if(!_isStringStringValue(value)) {
return false;
}
return true;
}
function _isStringStringValue(value: unknown): value is unknown {
if(typeof value !== "string") {
return false;
}
return true;
}
export function isNonEmptyStringValue(value: unknown): value is types.NonEmptyStringValue {
if(!_isStringNonEmptyStringValue(value)) {
return false;
}
return true;
}
function _isStringNonEmptyStringValue(value: unknown): value is unknown {
if(typeof value !== "string") {
return false;
}
return true;
}
export function isAmount(value: unknown): value is types.Amount {
if(!_isIntegerAmount(value)) {
return false;
}
return true;
}
function _isIntegerAmount(value: unknown): value is unknown {
if(typeof value !== "number" || isNaN(value)) {
return false;
}
return true;
}
export function isSchema(value: unknown): value is types.Schema {
if(!_isStringSchema(value)) {
return false;
}
return true;
}
function _isStringSchema(value: unknown): value is unknown {
if(typeof value !== "string") {
return false;
}
if(value !== "https://schema.JsonSchema42.org/jns42-intermediate/schema.json") {
return false;
}
return true;
}
export function isSchemas(value: unknown): value is types.Schemas {
if(!_isMapSchemas(value)) {
return false;
}
return true;
}
function _isMapSchemas(value: unknown): value is unknown {
if(typeof value !== "object" || value === null || Array.isArray(value)) {
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(!isSchemasAdditionalProperties(propertyValue)) {
return false;
}
continue;
}
return true;
}
export function isTitle(value: unknown): value is types.Title {
if(!_isReferenceTitle(value)) {
return false;
}
return true;
}
function _isReferenceTitle(value: unknown): value is unknown {
if(!isNonEmptyStringValue(value)) {
return false;
}
return true;
}
export function isDescription(value: unknown): value is types.Description {
if(!_isReferenceDescription(value)) {
return false;
}
return true;
}
function _isReferenceDescription(value: unknown): value is unknown {
if(!isNonEmptyStringValue(value)) {
return false;
}
return true;
}
export function isExamples(value: unknown): value is types.Examples {
if(!_isArrayExamples(value)) {
return false;
}
return true;
}
function _isArrayExamples(value: unknown): value is unknown {
if(!Array.isArray(value)) {
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isExamplesItems(elementValue)) {
return false;
}
}
return true;
}
export function isDeprecated(value: unknown): value is types.Deprecated {
if(!_isReferenceDeprecated(value)) {
return false;
}
return true;
}
function _isReferenceDeprecated(value: unknown): value is unknown {
if(!isBooleanValue(value)) {
return false;
}
return true;
}
export function isTypes(value: unknown): value is types.Types {
if(!_isArrayTypes(value)) {
return false;
}
return true;
}
function _isArrayTypes(value: unknown): value is unknown {
if(!Array.isArray(value)) {
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isTypesItems(elementValue)) {
return false;
}
}
return true;
}
export function isReference(value: unknown): value is types.Reference {
if(!_isReferenceReference(value)) {
return false;
}
return true;
}
function _isReferenceReference(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isOneOf(value: unknown): value is types.OneOf {
if(!_isArrayOneOf(value)) {
return false;
}
return true;
}
function _isArrayOneOf(value: unknown): value is unknown {
if(!Array.isArray(value)) {
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isOneOfItems(elementValue)) {
return false;
}
}
return true;
}
export function isAnyOf(value: unknown): value is types.AnyOf {
if(!_isArrayAnyOf(value)) {
return false;
}
return true;
}
function _isArrayAnyOf(value: unknown): value is unknown {
if(!Array.isArray(value)) {
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isAnyOfItems(elementValue)) {
return false;
}
}
return true;
}
export function isAllOf(value: unknown): value is types.AllOf {
if(!_isArrayAllOf(value)) {
return false;
}
return true;
}
function _isArrayAllOf(value: unknown): value is unknown {
if(!Array.isArray(value)) {
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isAllOfItems(elementValue)) {
return false;
}
}
return true;
}
export function isIf(value: unknown): value is types.If {
if(!_isReferenceIf(value)) {
return false;
}
return true;
}
function _isReferenceIf(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isThen(value: unknown): value is types.Then {
if(!_isReferenceThen(value)) {
return false;
}
return true;
}
function _isReferenceThen(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isElse(value: unknown): value is types.Else {
if(!_isReferenceElse(value)) {
return false;
}
return true;
}
function _isReferenceElse(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isNot(value: unknown): value is types.Not {
if(!_isReferenceNot(value)) {
return false;
}
return true;
}
function _isReferenceNot(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isDependentSchemas(value: unknown): value is types.DependentSchemas {
if(!_isMapDependentSchemas(value)) {
return false;
}
return true;
}
function _isMapDependentSchemas(value: unknown): value is unknown {
if(typeof value !== "object" || value === null || Array.isArray(value)) {
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(!isDependentSchemasAdditionalProperties(propertyValue)) {
return false;
}
continue;
}
return true;
}
export function isObjectProperties(value: unknown): value is types.ObjectProperties {
if(!_isMapObjectProperties(value)) {
return false;
}
return true;
}
function _isMapObjectProperties(value: unknown): value is unknown {
if(typeof value !== "object" || value === null || Array.isArray(value)) {
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(!isObjectPropertiesAdditionalProperties(propertyValue)) {
return false;
}
continue;
}
return true;
}
export function isMapProperties(value: unknown): value is types.MapProperties {
if(!_isReferenceMapProperties(value)) {
return false;
}
return true;
}
function _isReferenceMapProperties(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isPatternProperties(value: unknown): value is types.PatternProperties {
if(!_isMapPatternProperties(value)) {
return false;
}
return true;
}
function _isMapPatternProperties(value: unknown): value is unknown {
if(typeof value !== "object" || value === null || Array.isArray(value)) {
return false;
}
for(const propertyName in value) {
const propertyValue = value[propertyName as keyof typeof value];
if(!isPatternPropertiesAdditionalProperties(propertyValue)) {
return false;
}
continue;
}
return true;
}
export function isPropertyNames(value: unknown): value is types.PropertyNames {
if(!_isReferencePropertyNames(value)) {
return false;
}
return true;
}
function _isReferencePropertyNames(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isTupleItems(value: unknown): value is types.TupleItems {
if(!_isArrayTupleItems(value)) {
return false;
}
return true;
}
function _isArrayTupleItems(value: unknown): value is unknown {
if(!Array.isArray(value)) {
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isTupleItemsItems(elementValue)) {
return false;
}
}
return true;
}
export function isArrayItems(value: unknown): value is types.ArrayItems {
if(!_isReferenceArrayItems(value)) {
return false;
}
return true;
}
function _isReferenceArrayItems(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isContains(value: unknown): value is types.Contains {
if(!_isReferenceContains(value)) {
return false;
}
return true;
}
function _isReferenceContains(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isOptions(value: unknown): value is types.Options {
if(!_isArrayOptions(value)) {
return false;
}
return true;
}
function _isArrayOptions(value: unknown): value is unknown {
if(!Array.isArray(value)) {
return false;
}
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(!isOptionsItems(elementValue)) {
return false;
}
}
return true;
}
export function isMinimumInclusive(value: unknown): value is types.MinimumInclusive {
if(!_isReferenceMinimumInclusive(value)) {
return false;
}
return true;
}
function _isReferenceMinimumInclusive(value: unknown): value is unknown {
if(!isNumberValue(value)) {
return false;
}
return true;
}
export function isMinimumExclusive(value: unknown): value is types.MinimumExclusive {
if(!_isReferenceMinimumExclusive(value)) {
return false;
}
return true;
}
function _isReferenceMinimumExclusive(value: unknown): value is unknown {
if(!isNumberValue(value)) {
return false;
}
return true;
}
export function isMaximumInclusive(value: unknown): value is types.MaximumInclusive {
if(!_isReferenceMaximumInclusive(value)) {
return false;
}
return true;
}
function _isReferenceMaximumInclusive(value: unknown): value is unknown {
if(!isNumberValue(value)) {
return false;
}
return true;
}
export function isMaximumExclusive(value: unknown): value is types.MaximumExclusive {
if(!_isReferenceMaximumExclusive(value)) {
return false;
}
return true;
}
function _isReferenceMaximumExclusive(value: unknown): value is unknown {
if(!isNumberValue(value)) {
return false;
}
return true;
}
export function isMultipleOf(value: unknown): value is types.MultipleOf {
if(!_isReferenceMultipleOf(value)) {
return false;
}
return true;
}
function _isReferenceMultipleOf(value: unknown): value is unknown {
if(!isNumberValue(value)) {
return false;
}
return true;
}
export function isMinimumLength(value: unknown): value is types.MinimumLength {
if(!_isReferenceMinimumLength(value)) {
return false;
}
return true;
}
function _isReferenceMinimumLength(value: unknown): value is unknown {
if(!isAmount(value)) {
return false;
}
return true;
}
export function isMaximumLength(value: unknown): value is types.MaximumLength {
if(!_isReferenceMaximumLength(value)) {
return false;
}
return true;
}
function _isReferenceMaximumLength(value: unknown): value is unknown {
if(!isAmount(value)) {
return false;
}
return true;
}
export function isValuePattern(value: unknown): value is types.ValuePattern {
if(!_isReferenceValuePattern(value)) {
return false;
}
return true;
}
function _isReferenceValuePattern(value: unknown): value is unknown {
if(!isNonEmptyStringValue(value)) {
return false;
}
return true;
}
export function isValueFormat(value: unknown): value is types.ValueFormat {
if(!_isReferenceValueFormat(value)) {
return false;
}
return true;
}
function _isReferenceValueFormat(value: unknown): value is unknown {
if(!isNonEmptyStringValue(value)) {
return false;
}
return true;
}
export function isMinimumItems(value: unknown): value is types.MinimumItems {
if(!_isReferenceMinimumItems(value)) {
return false;
}
return true;
}
function _isReferenceMinimumItems(value: unknown): value is unknown {
if(!isAmount(value)) {
return false;
}
return true;
}
export function isMaximumItems(value: unknown): value is types.MaximumItems {
if(!_isReferenceMaximumItems(value)) {
return false;
}
return true;
}
function _isReferenceMaximumItems(value: unknown): value is unknown {
if(!isAmount(value)) {
return false;
}
return true;
}
export function isUniqueItems(value: unknown): value is types.UniqueItems {
if(!_isBooleanUniqueItems(value)) {
return false;
}
return true;
}
function _isBooleanUniqueItems(value: unknown): value is unknown {
if(typeof value !== "boolean") {
return false;
}
return true;
}
export function isRequired(value: unknown): value is types.Required {
if(!_isArrayRequired(value)) {
return false;
}
return true;
}
function _isArrayRequired(value: unknown): value is unknown {
if(!Array.isArray(value)) {
return false;
}
const elementValueSeen = new Set<unknown>();
for(let elementIndex = 0; elementIndex < value.length; elementIndex ++) {
const elementValue = value[elementIndex];
if(elementValueSeen.has(elementValue)) {
return false;
}
elementValueSeen.add(elementValue);
if(!isRequiredItems(elementValue)) {
return false;
}
}
return true;
}
export function isMinimumProperties(value: unknown): value is types.MinimumProperties {
if(!_isReferenceMinimumProperties(value)) {
return false;
}
return true;
}
function _isReferenceMinimumProperties(value: unknown): value is unknown {
if(!isAmount(value)) {
return false;
}
return true;
}
export function isMaximumProperties(value: unknown): value is types.MaximumProperties {
if(!_isReferenceMaximumProperties(value)) {
return false;
}
return true;
}
function _isReferenceMaximumProperties(value: unknown): value is unknown {
if(!isAmount(value)) {
return false;
}
return true;
}
export function isSchemasAdditionalProperties(value: unknown): value is types.SchemasAdditionalProperties {
if(!_isReferenceSchemasAdditionalProperties(value)) {
return false;
}
return true;
}
function _isReferenceSchemasAdditionalProperties(value: unknown): value is unknown {
if(!isNode(value)) {
return false;
}
return true;
}
export function isExamplesItems(value: unknown): value is types.ExamplesItems {
if(!_isAnyExamplesItems(value)) {
return false;
}
return true;
}
function _isAnyExamplesItems(value: unknown): value is unknown {
return true;
}
export function isTypesItems(value: unknown): value is types.TypesItems {
if(!_isStringTypesItems(value)) {
return false;
}
return true;
}
function _isStringTypesItems(value: unknown): value is unknown {
if(typeof value !== "string") {
return false;
}
if(value !== "never" && value !== "any" && value !== "null" && value !== "boolean" && value !== "integer" && value !== "number" && value !== "string" && value !== "array" && value !== "map") {
return false;
}
return true;
}
export function isOneOfItems(value: unknown): value is types.OneOfItems {
if(!_isReferenceOneOfItems(value)) {
return false;
}
return true;
}
function _isReferenceOneOfItems(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isAnyOfItems(value: unknown): value is types.AnyOfItems {
if(!_isReferenceAnyOfItems(value)) {
return false;
}
return true;
}
function _isReferenceAnyOfItems(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isAllOfItems(value: unknown): value is types.AllOfItems {
if(!_isReferenceAllOfItems(value)) {
return false;
}
return true;
}
function _isReferenceAllOfItems(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isDependentSchemasAdditionalProperties(value: unknown): value is types.DependentSchemasAdditionalProperties {
if(!_isReferenceDependentSchemasAdditionalProperties(value)) {
return false;
}
return true;
}
function _isReferenceDependentSchemasAdditionalProperties(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isObjectPropertiesAdditionalProperties(value: unknown): value is types.ObjectPropertiesAdditionalProperties {
if(!_isReferenceObjectPropertiesAdditionalProperties(value)) {
return false;
}
return true;
}
function _isReferenceObjectPropertiesAdditionalProperties(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isPatternPropertiesAdditionalProperties(value: unknown): value is types.PatternPropertiesAdditionalProperties {
if(!_isReferencePatternPropertiesAdditionalProperties(value)) {
return false;
}
return true;
}
function _isReferencePatternPropertiesAdditionalProperties(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isTupleItemsItems(value: unknown): value is types.TupleItemsItems {
if(!_isReferenceTupleItemsItems(value)) {
return false;
}
return true;
}
function _isReferenceTupleItemsItems(value: unknown): value is unknown {
if(!isNodeReference(value)) {
return false;
}
return true;
}
export function isOptionsItems(value: unknown): value is types.OptionsItems {
if(!_isAnyOptionsItems(value)) {
return false;
}
return true;
}
function _isAnyOptionsItems(value: unknown): value is unknown {
return true;
}
export function isRequiredItems(value: unknown): value is types.RequiredItems {
if(!_isReferenceRequiredItems(value)) {
return false;
}
return true;
}
function _isReferenceRequiredItems(value: unknown): value is unknown {
if(!isStringValue(value)) {
return false;
}
return true;
}
