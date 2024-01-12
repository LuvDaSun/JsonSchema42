// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.9.6                          -- www.JsonSchema42.org
//
import * as types from "./types.js";
const depthCounters: Record<string, number> = {};
const maximumDepth = 2;
/**
* @summary JsonSchema42 intermediate schema
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json}
*/
export function mockSchemaDocument(): types.SchemaDocument {
depthCounters["0"] ??= 0;
try {
depthCounters["0"]++;
return (
{
"$schema": mockSchema(),
"schemas": mockSchemas(),
}
);
}
finally {
depthCounters["0"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node}
*/
export function mockNode(): types.Node {
depthCounters["1"] ??= 0;
try {
depthCounters["1"]++;
return (
{
"title": (depthCounters["7"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockTitle() : undefined,
"description": (depthCounters["7"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockDescription() : undefined,
"examples": (depthCounters["13"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockExamples() : undefined,
"deprecated": (depthCounters["5"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockDeprecated() : undefined,
"types": (depthCounters["15"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockTypes() : undefined,
"reference": (depthCounters["2"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockReference() : undefined,
"oneOf": (depthCounters["17"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockOneOf() : undefined,
"anyOf": (depthCounters["18"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockAnyOf() : undefined,
"allOf": (depthCounters["19"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockAllOf() : undefined,
"if": (depthCounters["2"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockIf() : undefined,
"then": (depthCounters["2"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockThen() : undefined,
"else": (depthCounters["2"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockElse() : undefined,
"not": (depthCounters["2"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockNot() : undefined,
"dependentSchemas": (depthCounters["24"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockDependentSchemas() : undefined,
"objectProperties": (depthCounters["25"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockObjectProperties() : undefined,
"mapProperties": (depthCounters["2"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMapProperties() : undefined,
"patternProperties": (depthCounters["27"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockPatternProperties() : undefined,
"propertyNames": (depthCounters["2"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockPropertyNames() : undefined,
"tupleItems": (depthCounters["29"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockTupleItems() : undefined,
"arrayItems": (depthCounters["2"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockArrayItems() : undefined,
"contains": (depthCounters["2"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockContains() : undefined,
"options": (depthCounters["32"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockOptions() : undefined,
"minimumInclusive": (depthCounters["4"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMinimumInclusive() : undefined,
"minimumExclusive": (depthCounters["4"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMinimumExclusive() : undefined,
"maximumInclusive": (depthCounters["4"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMaximumInclusive() : undefined,
"maximumExclusive": (depthCounters["4"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMaximumExclusive() : undefined,
"multipleOf": (depthCounters["4"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMultipleOf() : undefined,
"minimumLength": (depthCounters["8"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMinimumLength() : undefined,
"maximumLength": (depthCounters["8"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMaximumLength() : undefined,
"valuePattern": (depthCounters["7"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockValuePattern() : undefined,
"valueFormat": (depthCounters["7"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockValueFormat() : undefined,
"minimumItems": (depthCounters["8"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMinimumItems() : undefined,
"maximumItems": (depthCounters["8"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMaximumItems() : undefined,
"uniqueItems": (depthCounters["44"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockUniqueItems() : undefined,
"required": (depthCounters["45"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockRequired() : undefined,
"minimumProperties": (depthCounters["8"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMinimumProperties() : undefined,
"maximumProperties": (depthCounters["8"] ?? 0) < maximumDepth && Boolean(nextSeed() % 2) ? mockMaximumProperties() : undefined,
}
);
}
finally {
depthCounters["1"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node-reference}
*/
export function mockNodeReference(): types.NodeReference {
depthCounters["2"] ??= 0;
try {
depthCounters["2"]++;
return (randomString(10));
}
finally {
depthCounters["2"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/integer-value}
*/
export function mockIntegerValue(): types.IntegerValue {
depthCounters["3"] ??= 0;
try {
depthCounters["3"]++;
return (Number(nextSeed() % 1000));
}
finally {
depthCounters["3"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/number-value}
*/
export function mockNumberValue(): types.NumberValue {
depthCounters["4"] ??= 0;
try {
depthCounters["4"]++;
return (Number(nextSeed() % 1000 * 10) / 10);
}
finally {
depthCounters["4"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/boolean-value}
*/
export function mockBooleanValue(): types.BooleanValue {
depthCounters["5"] ??= 0;
try {
depthCounters["5"]++;
return (Boolean(nextSeed() % 2));
}
finally {
depthCounters["5"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/string-value}
*/
export function mockStringValue(): types.StringValue {
depthCounters["6"] ??= 0;
try {
depthCounters["6"]++;
return (randomString(10));
}
finally {
depthCounters["6"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/non-empty-string-value}
*/
export function mockNonEmptyStringValue(): types.NonEmptyStringValue {
depthCounters["7"] ??= 0;
try {
depthCounters["7"]++;
return (randomString(10));
}
finally {
depthCounters["7"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/amount}
*/
export function mockAmount(): types.Amount {
depthCounters["8"] ??= 0;
try {
depthCounters["8"]++;
return (Number(nextSeed() % 1000));
}
finally {
depthCounters["8"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/$schema}
*/
export function mockSchema(): types.Schema {
depthCounters["9"] ??= 0;
try {
depthCounters["9"]++;
return ((["https://schema.JsonSchema42.org/jns42-intermediate/schema.json"] as const)[nextSeed() % 1]);
}
finally {
depthCounters["9"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/schemas}
*/
export function mockSchemas(): types.Schemas {
depthCounters["10"] ??= 0;
try {
depthCounters["10"]++;
return (
(depthCounters["1"] ?? 0) < maximumDepth ? {
[(randomString(10))]: mockSchemasAdditionalProperties(),
[(randomString(10))]: mockSchemasAdditionalProperties(),
[(randomString(10))]: mockSchemasAdditionalProperties(),
[(randomString(10))]: mockSchemasAdditionalProperties(),
[(randomString(10))]: mockSchemasAdditionalProperties(),
} : {}
);
}
finally {
depthCounters["10"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/title}
*/
export function mockTitle(): types.Title {
depthCounters["11"] ??= 0;
try {
depthCounters["11"]++;
return (mockNonEmptyStringValue());
}
finally {
depthCounters["11"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/description}
*/
export function mockDescription(): types.Description {
depthCounters["12"] ??= 0;
try {
depthCounters["12"]++;
return (mockNonEmptyStringValue());
}
finally {
depthCounters["12"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/examples}
*/
export function mockExamples(): types.Examples {
depthCounters["13"] ??= 0;
try {
depthCounters["13"]++;
return (
(depthCounters["49"] ?? 0) < maximumDepth ? [
mockExamplesItems(),
mockExamplesItems(),
mockExamplesItems(),
mockExamplesItems(),
mockExamplesItems(),
] : []
);
}
finally {
depthCounters["13"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/deprecated}
*/
export function mockDeprecated(): types.Deprecated {
depthCounters["14"] ??= 0;
try {
depthCounters["14"]++;
return (mockBooleanValue());
}
finally {
depthCounters["14"]--;
}
}
/**
* @description What types does this schema describe<br />
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/types}
*/
export function mockTypes(): types.Types {
depthCounters["15"] ??= 0;
try {
depthCounters["15"]++;
return (
(depthCounters["50"] ?? 0) < maximumDepth ? [
mockTypesItems(),
mockTypesItems(),
mockTypesItems(),
mockTypesItems(),
mockTypesItems(),
] : []
);
}
finally {
depthCounters["15"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/reference}
*/
export function mockReference(): types.Reference {
depthCounters["16"] ??= 0;
try {
depthCounters["16"]++;
return (mockNodeReference());
}
finally {
depthCounters["16"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/oneOf}
*/
export function mockOneOf(): types.OneOf {
depthCounters["17"] ??= 0;
try {
depthCounters["17"]++;
return (
(depthCounters["2"] ?? 0) < maximumDepth ? [
mockOneOfItems(),
mockOneOfItems(),
mockOneOfItems(),
mockOneOfItems(),
mockOneOfItems(),
] : []
);
}
finally {
depthCounters["17"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/anyOf}
*/
export function mockAnyOf(): types.AnyOf {
depthCounters["18"] ??= 0;
try {
depthCounters["18"]++;
return (
(depthCounters["2"] ?? 0) < maximumDepth ? [
mockAnyOfItems(),
mockAnyOfItems(),
mockAnyOfItems(),
mockAnyOfItems(),
mockAnyOfItems(),
] : []
);
}
finally {
depthCounters["18"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/allOf}
*/
export function mockAllOf(): types.AllOf {
depthCounters["19"] ??= 0;
try {
depthCounters["19"]++;
return (
(depthCounters["2"] ?? 0) < maximumDepth ? [
mockAllOfItems(),
mockAllOfItems(),
mockAllOfItems(),
mockAllOfItems(),
mockAllOfItems(),
] : []
);
}
finally {
depthCounters["19"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/if}
*/
export function mockIf(): types.If {
depthCounters["20"] ??= 0;
try {
depthCounters["20"]++;
return (mockNodeReference());
}
finally {
depthCounters["20"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/then}
*/
export function mockThen(): types.Then {
depthCounters["21"] ??= 0;
try {
depthCounters["21"]++;
return (mockNodeReference());
}
finally {
depthCounters["21"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/else}
*/
export function mockElse(): types.Else {
depthCounters["22"] ??= 0;
try {
depthCounters["22"]++;
return (mockNodeReference());
}
finally {
depthCounters["22"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/not}
*/
export function mockNot(): types.Not {
depthCounters["23"] ??= 0;
try {
depthCounters["23"]++;
return (mockNodeReference());
}
finally {
depthCounters["23"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/dependentSchemas}
*/
export function mockDependentSchemas(): types.DependentSchemas {
depthCounters["24"] ??= 0;
try {
depthCounters["24"]++;
return (
(depthCounters["2"] ?? 0) < maximumDepth ? {
[(randomString(10))]: mockDependentSchemasAdditionalProperties(),
[(randomString(10))]: mockDependentSchemasAdditionalProperties(),
[(randomString(10))]: mockDependentSchemasAdditionalProperties(),
[(randomString(10))]: mockDependentSchemasAdditionalProperties(),
[(randomString(10))]: mockDependentSchemasAdditionalProperties(),
} : {}
);
}
finally {
depthCounters["24"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/objectProperties}
*/
export function mockObjectProperties(): types.ObjectProperties {
depthCounters["25"] ??= 0;
try {
depthCounters["25"]++;
return (
(depthCounters["2"] ?? 0) < maximumDepth ? {
[(randomString(10))]: mockObjectPropertiesAdditionalProperties(),
[(randomString(10))]: mockObjectPropertiesAdditionalProperties(),
[(randomString(10))]: mockObjectPropertiesAdditionalProperties(),
[(randomString(10))]: mockObjectPropertiesAdditionalProperties(),
[(randomString(10))]: mockObjectPropertiesAdditionalProperties(),
} : {}
);
}
finally {
depthCounters["25"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/mapProperties}
*/
export function mockMapProperties(): types.MapProperties {
depthCounters["26"] ??= 0;
try {
depthCounters["26"]++;
return (mockNodeReference());
}
finally {
depthCounters["26"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/patternProperties}
*/
export function mockPatternProperties(): types.PatternProperties {
depthCounters["27"] ??= 0;
try {
depthCounters["27"]++;
return (
(depthCounters["2"] ?? 0) < maximumDepth ? {
[(randomString(10))]: mockPatternPropertiesAdditionalProperties(),
[(randomString(10))]: mockPatternPropertiesAdditionalProperties(),
[(randomString(10))]: mockPatternPropertiesAdditionalProperties(),
[(randomString(10))]: mockPatternPropertiesAdditionalProperties(),
[(randomString(10))]: mockPatternPropertiesAdditionalProperties(),
} : {}
);
}
finally {
depthCounters["27"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/propertyNames}
*/
export function mockPropertyNames(): types.PropertyNames {
depthCounters["28"] ??= 0;
try {
depthCounters["28"]++;
return (mockNodeReference());
}
finally {
depthCounters["28"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/tupleItems}
*/
export function mockTupleItems(): types.TupleItems {
depthCounters["29"] ??= 0;
try {
depthCounters["29"]++;
return (
(depthCounters["2"] ?? 0) < maximumDepth ? [
mockTupleItemsItems(),
mockTupleItemsItems(),
mockTupleItemsItems(),
mockTupleItemsItems(),
mockTupleItemsItems(),
] : []
);
}
finally {
depthCounters["29"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/arrayItems}
*/
export function mockArrayItems(): types.ArrayItems {
depthCounters["30"] ??= 0;
try {
depthCounters["30"]++;
return (mockNodeReference());
}
finally {
depthCounters["30"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/contains}
*/
export function mockContains(): types.Contains {
depthCounters["31"] ??= 0;
try {
depthCounters["31"]++;
return (mockNodeReference());
}
finally {
depthCounters["31"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/options}
*/
export function mockOptions(): types.Options {
depthCounters["32"] ??= 0;
try {
depthCounters["32"]++;
return (
(depthCounters["58"] ?? 0) < maximumDepth ? [
mockOptionsItems(),
mockOptionsItems(),
mockOptionsItems(),
mockOptionsItems(),
mockOptionsItems(),
] : []
);
}
finally {
depthCounters["32"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumInclusive}
*/
export function mockMinimumInclusive(): types.MinimumInclusive {
depthCounters["33"] ??= 0;
try {
depthCounters["33"]++;
return (mockNumberValue());
}
finally {
depthCounters["33"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumExclusive}
*/
export function mockMinimumExclusive(): types.MinimumExclusive {
depthCounters["34"] ??= 0;
try {
depthCounters["34"]++;
return (mockNumberValue());
}
finally {
depthCounters["34"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumInclusive}
*/
export function mockMaximumInclusive(): types.MaximumInclusive {
depthCounters["35"] ??= 0;
try {
depthCounters["35"]++;
return (mockNumberValue());
}
finally {
depthCounters["35"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumExclusive}
*/
export function mockMaximumExclusive(): types.MaximumExclusive {
depthCounters["36"] ??= 0;
try {
depthCounters["36"]++;
return (mockNumberValue());
}
finally {
depthCounters["36"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/multipleOf}
*/
export function mockMultipleOf(): types.MultipleOf {
depthCounters["37"] ??= 0;
try {
depthCounters["37"]++;
return (mockNumberValue());
}
finally {
depthCounters["37"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumLength}
*/
export function mockMinimumLength(): types.MinimumLength {
depthCounters["38"] ??= 0;
try {
depthCounters["38"]++;
return (mockAmount());
}
finally {
depthCounters["38"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumLength}
*/
export function mockMaximumLength(): types.MaximumLength {
depthCounters["39"] ??= 0;
try {
depthCounters["39"]++;
return (mockAmount());
}
finally {
depthCounters["39"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/valuePattern}
*/
export function mockValuePattern(): types.ValuePattern {
depthCounters["40"] ??= 0;
try {
depthCounters["40"]++;
return (mockNonEmptyStringValue());
}
finally {
depthCounters["40"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/valueFormat}
*/
export function mockValueFormat(): types.ValueFormat {
depthCounters["41"] ??= 0;
try {
depthCounters["41"]++;
return (mockNonEmptyStringValue());
}
finally {
depthCounters["41"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumItems}
*/
export function mockMinimumItems(): types.MinimumItems {
depthCounters["42"] ??= 0;
try {
depthCounters["42"]++;
return (mockAmount());
}
finally {
depthCounters["42"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumItems}
*/
export function mockMaximumItems(): types.MaximumItems {
depthCounters["43"] ??= 0;
try {
depthCounters["43"]++;
return (mockAmount());
}
finally {
depthCounters["43"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/uniqueItems}
*/
export function mockUniqueItems(): types.UniqueItems {
depthCounters["44"] ??= 0;
try {
depthCounters["44"]++;
return (Boolean(nextSeed() % 2));
}
finally {
depthCounters["44"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/required}
*/
export function mockRequired(): types.Required {
depthCounters["45"] ??= 0;
try {
depthCounters["45"]++;
return (
(depthCounters["6"] ?? 0) < maximumDepth ? [
mockRequiredItems(),
mockRequiredItems(),
mockRequiredItems(),
mockRequiredItems(),
mockRequiredItems(),
] : []
);
}
finally {
depthCounters["45"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumProperties}
*/
export function mockMinimumProperties(): types.MinimumProperties {
depthCounters["46"] ??= 0;
try {
depthCounters["46"]++;
return (mockAmount());
}
finally {
depthCounters["46"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumProperties}
*/
export function mockMaximumProperties(): types.MaximumProperties {
depthCounters["47"] ??= 0;
try {
depthCounters["47"]++;
return (mockAmount());
}
finally {
depthCounters["47"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/schemas/additionalProperties}
*/
export function mockSchemasAdditionalProperties(): types.SchemasAdditionalProperties {
depthCounters["48"] ??= 0;
try {
depthCounters["48"]++;
return (mockNode());
}
finally {
depthCounters["48"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/examples/items}
*/
export function mockExamplesItems(): types.ExamplesItems {
depthCounters["49"] ??= 0;
try {
depthCounters["49"]++;
return (
// any
{}
);
}
finally {
depthCounters["49"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/types/items}
*/
export function mockTypesItems(): types.TypesItems {
depthCounters["50"] ??= 0;
try {
depthCounters["50"]++;
return ((["never", "any", "null", "boolean", "integer", "number", "string", "array", "map"] as const)[nextSeed() % 9]);
}
finally {
depthCounters["50"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/oneOf/items}
*/
export function mockOneOfItems(): types.OneOfItems {
depthCounters["51"] ??= 0;
try {
depthCounters["51"]++;
return (mockNodeReference());
}
finally {
depthCounters["51"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/anyOf/items}
*/
export function mockAnyOfItems(): types.AnyOfItems {
depthCounters["52"] ??= 0;
try {
depthCounters["52"]++;
return (mockNodeReference());
}
finally {
depthCounters["52"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/allOf/items}
*/
export function mockAllOfItems(): types.AllOfItems {
depthCounters["53"] ??= 0;
try {
depthCounters["53"]++;
return (mockNodeReference());
}
finally {
depthCounters["53"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/dependentSchemas/additionalProperties}
*/
export function mockDependentSchemasAdditionalProperties(): types.DependentSchemasAdditionalProperties {
depthCounters["54"] ??= 0;
try {
depthCounters["54"]++;
return (mockNodeReference());
}
finally {
depthCounters["54"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/objectProperties/additionalProperties}
*/
export function mockObjectPropertiesAdditionalProperties(): types.ObjectPropertiesAdditionalProperties {
depthCounters["55"] ??= 0;
try {
depthCounters["55"]++;
return (mockNodeReference());
}
finally {
depthCounters["55"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/patternProperties/additionalProperties}
*/
export function mockPatternPropertiesAdditionalProperties(): types.PatternPropertiesAdditionalProperties {
depthCounters["56"] ??= 0;
try {
depthCounters["56"]++;
return (mockNodeReference());
}
finally {
depthCounters["56"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/tupleItems/items}
*/
export function mockTupleItemsItems(): types.TupleItemsItems {
depthCounters["57"] ??= 0;
try {
depthCounters["57"]++;
return (mockNodeReference());
}
finally {
depthCounters["57"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/options/items}
*/
export function mockOptionsItems(): types.OptionsItems {
depthCounters["58"] ??= 0;
try {
depthCounters["58"]++;
return (
// any
{}
);
}
finally {
depthCounters["58"]--;
}
}
/**
* @see {@link https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/required/items}
*/
export function mockRequiredItems(): types.RequiredItems {
depthCounters["59"] ??= 0;
try {
depthCounters["59"]++;
return (mockStringValue());
}
finally {
depthCounters["59"]--;
}
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
