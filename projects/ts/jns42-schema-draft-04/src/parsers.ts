// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.8.6                          -- www.JsonSchema42.org
export function parseDraft04Schema(value: unknown): unknown {
return _parseMapDraft04Schema(value);
}
function _parseMapDraft04Schema(value: unknown): unknown {
if(typeof value === "object" && value !== null && !Array.isArray(value)) {
const result = {} as Record<string, unknown>;
for(const propertyName in value) {
switch(propertyName) {
case "id": {
const propertyValue = parseId(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "$schema": {
const propertyValue = parsePropertiesSchema(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "title": {
const propertyValue = parseTitle(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "description": {
const propertyValue = parseDescription(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "default": {
const propertyValue = parseDefault(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "multipleOf": {
const propertyValue = parseMultipleOf(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "maximum": {
const propertyValue = parseMaximum(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "exclusiveMaximum": {
const propertyValue = parseExclusiveMaximum(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "minimum": {
const propertyValue = parseMinimum(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "exclusiveMinimum": {
const propertyValue = parseExclusiveMinimum(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "maxLength": {
const propertyValue = parseMaxLength(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "minLength": {
const propertyValue = parseMinLength(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "pattern": {
const propertyValue = parsePattern(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "additionalItems": {
const propertyValue = parseAdditionalItems(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "items": {
const propertyValue = parsePropertiesItems(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "maxItems": {
const propertyValue = parseMaxItems(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "minItems": {
const propertyValue = parseMinItems(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "uniqueItems": {
const propertyValue = parseUniqueItems(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "maxProperties": {
const propertyValue = parseMaxProperties(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "minProperties": {
const propertyValue = parseMinProperties(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "required": {
const propertyValue = parseRequired(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "additionalProperties": {
const propertyValue = parseSchemaPropertiesAdditionalProperties(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "definitions": {
const propertyValue = parseDefinitions(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "properties": {
const propertyValue = parseProperties(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "patternProperties": {
const propertyValue = parsePatternProperties(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "dependencies": {
const propertyValue = parseDependencies(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "enum": {
const propertyValue = parseEnum(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "type": {
const propertyValue = parseType(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "format": {
const propertyValue = parseFormat(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "allOf": {
const propertyValue = parseAllOf(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "anyOf": {
const propertyValue = parseAnyOf(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "oneOf": {
const propertyValue = parseOneOf(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
case "not": {
const propertyValue = parseNot(value[propertyName as keyof typeof value]);
result[propertyName] = propertyValue;
break;
}
}
}
return result;
}
return undefined;
}
export function parseSchemaArray(value: unknown): unknown {
return _parseArraySchemaArray(value);
}
function _parseArraySchemaArray(value: unknown): unknown {
if(Array.isArray(value)) {
const result = new Array<unknown>(value.length);
for(let elementIndex = 0; elementIndex < value.length; elementIndex++) {
result[elementIndex] = parseSchemaArrayItems(value[elementIndex]);
}
return result;
}
return undefined;
}
export function parsePositiveInteger(value: unknown): unknown {
return _parseIntegerPositiveInteger(value);
}
function _parseIntegerPositiveInteger(value: unknown): unknown {
switch(typeof value) {
case "string":
return Number(value);
case "number":
return value;
case "boolean":
return value ? 1 : 0;
}
return undefined;
}
export function parsePositiveIntegerDefault0(value: unknown): unknown {
return _parseAllOfPositiveIntegerDefault0(value);
}
function _parseAllOfPositiveIntegerDefault0(value: unknown): unknown {
return parseAllOf0(value) ?? parseAllOf1(value);
}
export function parseSimpleTypes(value: unknown): unknown {
return _parseStringSimpleTypes(value);
}
function _parseStringSimpleTypes(value: unknown): unknown {
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
}
export function parseStringArray(value: unknown): unknown {
return _parseArrayStringArray(value);
}
function _parseArrayStringArray(value: unknown): unknown {
if(Array.isArray(value)) {
const result = new Array<unknown>(value.length);
for(let elementIndex = 0; elementIndex < value.length; elementIndex++) {
result[elementIndex] = parseStringArrayItems(value[elementIndex]);
}
return result;
}
return undefined;
}
export function parseId(value: unknown): unknown {
return _parseStringId(value);
}
function _parseStringId(value: unknown): unknown {
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
}
export function parsePropertiesSchema(value: unknown): unknown {
return _parseStringPropertiesSchema(value);
}
function _parseStringPropertiesSchema(value: unknown): unknown {
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
}
export function parseTitle(value: unknown): unknown {
return _parseStringTitle(value);
}
function _parseStringTitle(value: unknown): unknown {
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
}
export function parseDescription(value: unknown): unknown {
return _parseStringDescription(value);
}
function _parseStringDescription(value: unknown): unknown {
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
}
export function parseDefault(value: unknown): unknown {
return ;
}
export function parseMultipleOf(value: unknown): unknown {
return _parseNumberMultipleOf(value);
}
function _parseNumberMultipleOf(value: unknown): unknown {
switch(typeof value) {
case "string":
return Number(value);
case "number":
return value;
case "boolean":
return value ? 1 : 0;
}
return undefined;
}
export function parseMaximum(value: unknown): unknown {
return _parseNumberMaximum(value);
}
function _parseNumberMaximum(value: unknown): unknown {
switch(typeof value) {
case "string":
return Number(value);
case "number":
return value;
case "boolean":
return value ? 1 : 0;
}
return undefined;
}
export function parseExclusiveMaximum(value: unknown): unknown {
return _parseBooleanExclusiveMaximum(value);
}
function _parseBooleanExclusiveMaximum(value: unknown): unknown {
if(value == null) {
return false;
}
switch(typeof value) {
case "string":
switch(value.trim()) {
case "":
case "no":
case "off":
case "false":
case "0":
return false;
default:
return true;
}
case "number":
return Boolean(value);
case "boolean":
return value;
}
return undefined;
}
export function parseMinimum(value: unknown): unknown {
return _parseNumberMinimum(value);
}
function _parseNumberMinimum(value: unknown): unknown {
switch(typeof value) {
case "string":
return Number(value);
case "number":
return value;
case "boolean":
return value ? 1 : 0;
}
return undefined;
}
export function parseExclusiveMinimum(value: unknown): unknown {
return _parseBooleanExclusiveMinimum(value);
}
function _parseBooleanExclusiveMinimum(value: unknown): unknown {
if(value == null) {
return false;
}
switch(typeof value) {
case "string":
switch(value.trim()) {
case "":
case "no":
case "off":
case "false":
case "0":
return false;
default:
return true;
}
case "number":
return Boolean(value);
case "boolean":
return value;
}
return undefined;
}
export function parseMaxLength(value: unknown): unknown {
return _parseReferenceMaxLength(value);
}
function _parseReferenceMaxLength(value: unknown): unknown {
return parsePositiveInteger(value);
}
export function parseMinLength(value: unknown): unknown {
return _parseReferenceMinLength(value);
}
function _parseReferenceMinLength(value: unknown): unknown {
return parsePositiveIntegerDefault0(value);
}
export function parsePattern(value: unknown): unknown {
return _parseStringPattern(value);
}
function _parseStringPattern(value: unknown): unknown {
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
}
export function parseAdditionalItems(value: unknown): unknown {
return _parseAnyOfAdditionalItems(value);
}
function _parseAnyOfAdditionalItems(value: unknown): unknown {
return parseAdditionalItemsAnyOf0(value) ?? parseAdditionalItemsAnyOf1(value);
}
export function parsePropertiesItems(value: unknown): unknown {
return _parseAnyOfPropertiesItems(value);
}
function _parseAnyOfPropertiesItems(value: unknown): unknown {
return parseItemsAnyOf0(value) ?? parseItemsAnyOf1(value);
}
export function parseMaxItems(value: unknown): unknown {
return _parseReferenceMaxItems(value);
}
function _parseReferenceMaxItems(value: unknown): unknown {
return parsePositiveInteger(value);
}
export function parseMinItems(value: unknown): unknown {
return _parseReferenceMinItems(value);
}
function _parseReferenceMinItems(value: unknown): unknown {
return parsePositiveIntegerDefault0(value);
}
export function parseUniqueItems(value: unknown): unknown {
return _parseBooleanUniqueItems(value);
}
function _parseBooleanUniqueItems(value: unknown): unknown {
if(value == null) {
return false;
}
switch(typeof value) {
case "string":
switch(value.trim()) {
case "":
case "no":
case "off":
case "false":
case "0":
return false;
default:
return true;
}
case "number":
return Boolean(value);
case "boolean":
return value;
}
return undefined;
}
export function parseMaxProperties(value: unknown): unknown {
return _parseReferenceMaxProperties(value);
}
function _parseReferenceMaxProperties(value: unknown): unknown {
return parsePositiveInteger(value);
}
export function parseMinProperties(value: unknown): unknown {
return _parseReferenceMinProperties(value);
}
function _parseReferenceMinProperties(value: unknown): unknown {
return parsePositiveIntegerDefault0(value);
}
export function parseRequired(value: unknown): unknown {
return _parseReferenceRequired(value);
}
function _parseReferenceRequired(value: unknown): unknown {
return parseStringArray(value);
}
export function parseSchemaPropertiesAdditionalProperties(value: unknown): unknown {
return _parseAnyOfSchemaPropertiesAdditionalProperties(value);
}
function _parseAnyOfSchemaPropertiesAdditionalProperties(value: unknown): unknown {
return parsePropertiesAdditionalPropertiesAnyOf0(value) ?? parsePropertiesAdditionalPropertiesAnyOf1(value);
}
export function parseDefinitions(value: unknown): unknown {
return _parseMapDefinitions(value);
}
function _parseMapDefinitions(value: unknown): unknown {
if(typeof value === "object" && value !== null && !Array.isArray(value)) {
const result = {} as Record<string, unknown>;
for(const propertyName in value) {
result[propertyName] ??= parseDefinitionsAdditionalProperties(value[propertyName as keyof typeof value]);
}
return result;
}
return undefined;
}
export function parseProperties(value: unknown): unknown {
return _parseMapProperties(value);
}
function _parseMapProperties(value: unknown): unknown {
if(typeof value === "object" && value !== null && !Array.isArray(value)) {
const result = {} as Record<string, unknown>;
for(const propertyName in value) {
result[propertyName] ??= parsePropertiesPropertiesAdditionalProperties(value[propertyName as keyof typeof value]);
}
return result;
}
return undefined;
}
export function parsePatternProperties(value: unknown): unknown {
return _parseMapPatternProperties(value);
}
function _parseMapPatternProperties(value: unknown): unknown {
if(typeof value === "object" && value !== null && !Array.isArray(value)) {
const result = {} as Record<string, unknown>;
for(const propertyName in value) {
result[propertyName] ??= parsePatternPropertiesAdditionalProperties(value[propertyName as keyof typeof value]);
}
return result;
}
return undefined;
}
export function parseDependencies(value: unknown): unknown {
return _parseMapDependencies(value);
}
function _parseMapDependencies(value: unknown): unknown {
if(typeof value === "object" && value !== null && !Array.isArray(value)) {
const result = {} as Record<string, unknown>;
for(const propertyName in value) {
result[propertyName] ??= parseDependenciesAdditionalProperties(value[propertyName as keyof typeof value]);
}
return result;
}
return undefined;
}
export function parseEnum(value: unknown): unknown {
return _parseArrayEnum(value);
}
function _parseArrayEnum(value: unknown): unknown {
if(Array.isArray(value)) {
const result = new Array<unknown>(value.length);
for(let elementIndex = 0; elementIndex < value.length; elementIndex++) {
result[elementIndex] = value[elementIndex];
}
return result;
}
return undefined;
}
export function parseType(value: unknown): unknown {
return _parseAnyOfType(value);
}
function _parseAnyOfType(value: unknown): unknown {
return parseTypeAnyOf0(value) ?? parseTypeAnyOf1(value);
}
export function parseFormat(value: unknown): unknown {
return _parseStringFormat(value);
}
function _parseStringFormat(value: unknown): unknown {
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
}
export function parseAllOf(value: unknown): unknown {
return _parseReferenceAllOf(value);
}
function _parseReferenceAllOf(value: unknown): unknown {
return parseSchemaArray(value);
}
export function parseAnyOf(value: unknown): unknown {
return _parseReferenceAnyOf(value);
}
function _parseReferenceAnyOf(value: unknown): unknown {
return parseSchemaArray(value);
}
export function parseOneOf(value: unknown): unknown {
return _parseReferenceOneOf(value);
}
function _parseReferenceOneOf(value: unknown): unknown {
return parseSchemaArray(value);
}
export function parseNot(value: unknown): unknown {
return _parseReferenceNot(value);
}
function _parseReferenceNot(value: unknown): unknown {
return parseDraft04Schema(value);
}
export function parseSchemaArrayItems(value: unknown): unknown {
return _parseReferenceSchemaArrayItems(value);
}
function _parseReferenceSchemaArrayItems(value: unknown): unknown {
return parseDraft04Schema(value);
}
export function parseAllOf0(value: unknown): unknown {
return _parseReferenceAllOf0(value);
}
function _parseReferenceAllOf0(value: unknown): unknown {
return parsePositiveInteger(value);
}
export function parseAllOf1(value: unknown): unknown {
return ;
}
export function parseStringArrayItems(value: unknown): unknown {
return _parseStringStringArrayItems(value);
}
function _parseStringStringArrayItems(value: unknown): unknown {
switch(typeof value) {
case "string":
return value;
case "number":
case "boolean":
return String(value);
default:
return undefined;
}
}
export function parseAdditionalItemsAnyOf0(value: unknown): unknown {
return _parseBooleanAdditionalItemsAnyOf0(value);
}
function _parseBooleanAdditionalItemsAnyOf0(value: unknown): unknown {
if(value == null) {
return false;
}
switch(typeof value) {
case "string":
switch(value.trim()) {
case "":
case "no":
case "off":
case "false":
case "0":
return false;
default:
return true;
}
case "number":
return Boolean(value);
case "boolean":
return value;
}
return undefined;
}
export function parseAdditionalItemsAnyOf1(value: unknown): unknown {
return _parseReferenceAdditionalItemsAnyOf1(value);
}
function _parseReferenceAdditionalItemsAnyOf1(value: unknown): unknown {
return parseDraft04Schema(value);
}
export function parseItemsAnyOf0(value: unknown): unknown {
return _parseReferenceItemsAnyOf0(value);
}
function _parseReferenceItemsAnyOf0(value: unknown): unknown {
return parseDraft04Schema(value);
}
export function parseItemsAnyOf1(value: unknown): unknown {
return _parseReferenceItemsAnyOf1(value);
}
function _parseReferenceItemsAnyOf1(value: unknown): unknown {
return parseSchemaArray(value);
}
export function parsePropertiesAdditionalPropertiesAnyOf0(value: unknown): unknown {
return _parseBooleanPropertiesAdditionalPropertiesAnyOf0(value);
}
function _parseBooleanPropertiesAdditionalPropertiesAnyOf0(value: unknown): unknown {
if(value == null) {
return false;
}
switch(typeof value) {
case "string":
switch(value.trim()) {
case "":
case "no":
case "off":
case "false":
case "0":
return false;
default:
return true;
}
case "number":
return Boolean(value);
case "boolean":
return value;
}
return undefined;
}
export function parsePropertiesAdditionalPropertiesAnyOf1(value: unknown): unknown {
return _parseReferencePropertiesAdditionalPropertiesAnyOf1(value);
}
function _parseReferencePropertiesAdditionalPropertiesAnyOf1(value: unknown): unknown {
return parseDraft04Schema(value);
}
export function parseDefinitionsAdditionalProperties(value: unknown): unknown {
return _parseReferenceDefinitionsAdditionalProperties(value);
}
function _parseReferenceDefinitionsAdditionalProperties(value: unknown): unknown {
return parseDraft04Schema(value);
}
export function parsePropertiesPropertiesAdditionalProperties(value: unknown): unknown {
return _parseReferencePropertiesPropertiesAdditionalProperties(value);
}
function _parseReferencePropertiesPropertiesAdditionalProperties(value: unknown): unknown {
return parseDraft04Schema(value);
}
export function parsePatternPropertiesAdditionalProperties(value: unknown): unknown {
return _parseReferencePatternPropertiesAdditionalProperties(value);
}
function _parseReferencePatternPropertiesAdditionalProperties(value: unknown): unknown {
return parseDraft04Schema(value);
}
export function parseDependenciesAdditionalProperties(value: unknown): unknown {
return _parseAnyOfDependenciesAdditionalProperties(value);
}
function _parseAnyOfDependenciesAdditionalProperties(value: unknown): unknown {
return parseDependenciesAdditionalPropertiesAnyOf0(value) ?? parseDependenciesAdditionalPropertiesAnyOf1(value);
}
export function parseTypeAnyOf0(value: unknown): unknown {
return _parseReferenceTypeAnyOf0(value);
}
function _parseReferenceTypeAnyOf0(value: unknown): unknown {
return parseSimpleTypes(value);
}
export function parseTypeAnyOf1(value: unknown): unknown {
return _parseArrayTypeAnyOf1(value);
}
function _parseArrayTypeAnyOf1(value: unknown): unknown {
if(Array.isArray(value)) {
const result = new Array<unknown>(value.length);
for(let elementIndex = 0; elementIndex < value.length; elementIndex++) {
result[elementIndex] = parseAnyOf1Items(value[elementIndex]);
}
return result;
}
return undefined;
}
export function parseDependenciesAdditionalPropertiesAnyOf0(value: unknown): unknown {
return _parseReferenceDependenciesAdditionalPropertiesAnyOf0(value);
}
function _parseReferenceDependenciesAdditionalPropertiesAnyOf0(value: unknown): unknown {
return parseDraft04Schema(value);
}
export function parseDependenciesAdditionalPropertiesAnyOf1(value: unknown): unknown {
return _parseReferenceDependenciesAdditionalPropertiesAnyOf1(value);
}
function _parseReferenceDependenciesAdditionalPropertiesAnyOf1(value: unknown): unknown {
return parseStringArray(value);
}
export function parseAnyOf1Items(value: unknown): unknown {
return _parseReferenceAnyOf1Items(value);
}
function _parseReferenceAnyOf1Items(value: unknown): unknown {
return parseSimpleTypes(value);
}
