// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.12.3                         -- www.JsonSchema42.org
//
import * as types from "./types.js";
const depthCounters: Record<string, number> = {};
export const unknownValue: any = {};
export const anyValue: any = {};
export const neverValue: any = {};
export interface MockGeneratorOptions {
maximumDepth?: number;
numberPrecision?: number;
stringCharacters?: string;
defaultMinimumValue?: number;
defaultMaximumValue?: number;
defaultMinimumItems?: number;
defaultMaximumItems?: number;
defaultMinimumProperties?: number;
defaultMaximumProperties?: number;
defaultMinimumStringLength?: number;
defaultMaximumStringLength?: number;
}
const defaultMockGeneratorOptions = {
maximumDepth: 1,
numberPrecision: 1000,
stringCharacters: "abcdefghijklmnopqrstuvwxyz",
defaultMinimumValue: -1000,
defaultMaximumValue: 1000,
defaultMinimumItems: 1,
defaultMaximumItems: 5,
defaultMinimumProperties: 1,
defaultMaximumProperties: 5,
defaultMinimumStringLength: 5,
defaultMaximumStringLength: 20,
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/core#/properties/$comment}
*/
export function mockComment(options: MockGeneratorOptions = {}): types.Comment {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[27] ??= 0;
try {
depthCounters[27]++;
return (
new Array(
configuration.defaultMinimumStringLength +
nextSeed() % (
configuration.defaultMaximumStringLength - configuration.defaultMinimumStringLength + 1
)
).
fill(undefined).
map(() => configuration.stringCharacters[nextSeed() % configuration.stringCharacters.length]).
join("")
);
}
finally {
depthCounters[27]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/core#/properties/$vocabulary/additionalProperties}
*/
export function mockVocabularyAdditionalProperties(options: MockGeneratorOptions = {}): types.VocabularyAdditionalProperties {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[29] ??= 0;
try {
depthCounters[29]++;
return (Boolean(nextSeed() % 2));
}
finally {
depthCounters[29]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/$defs/nonNegativeInteger}
*/
export function mockNonNegativeInteger(options: MockGeneratorOptions = {}): types.NonNegativeInteger {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[58] ??= 0;
try {
depthCounters[58]++;
return (
(Math.ceil(0 / 1) + nextSeed() % (Math.floor(configuration.defaultMaximumValue / 1) - Math.ceil(0 / 1) + 1)) * 1
);
}
finally {
depthCounters[58]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/$defs/nonNegativeIntegerDefault0}
*/
export function mockNonNegativeIntegerDefault0(options: MockGeneratorOptions = {}): types.NonNegativeIntegerDefault0 {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[59] ??= 0;
try {
depthCounters[59]++;
return (mockNonNegativeInteger());
}
finally {
depthCounters[59]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/$defs/simpleTypes}
*/
export function mockSimpleTypes(options: MockGeneratorOptions = {}): types.SimpleTypes {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[60] ??= 0;
try {
depthCounters[60]++;
return (
(
[
"array", "boolean", "integer", "null", "number", "object", "string"
] as const
)[
nextSeed() % 7
]
);
}
finally {
depthCounters[60]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/multipleOf}
*/
export function mockMultipleOf(options: MockGeneratorOptions = {}): types.MultipleOf {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[65] ??= 0;
try {
depthCounters[65]++;
return (
(
(0 * configuration.numberPrecision + 1) +
nextSeed() % (
(configuration.defaultMaximumValue * configuration.numberPrecision) - (0 * configuration.numberPrecision + 1) + 1
) / configuration.numberPrecision
)
);
}
finally {
depthCounters[65]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/maximum}
*/
export function mockMaximum(options: MockGeneratorOptions = {}): types.Maximum {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[66] ??= 0;
try {
depthCounters[66]++;
return (
(
configuration.defaultMinimumValue * configuration.numberPrecision +
nextSeed() % (
(configuration.defaultMaximumValue * configuration.numberPrecision) - configuration.defaultMinimumValue * configuration.numberPrecision + 1
) / configuration.numberPrecision
)
);
}
finally {
depthCounters[66]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/exclusiveMaximum}
*/
export function mockExclusiveMaximum(options: MockGeneratorOptions = {}): types.ExclusiveMaximum {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[67] ??= 0;
try {
depthCounters[67]++;
return (
(
configuration.defaultMinimumValue * configuration.numberPrecision +
nextSeed() % (
(configuration.defaultMaximumValue * configuration.numberPrecision) - configuration.defaultMinimumValue * configuration.numberPrecision + 1
) / configuration.numberPrecision
)
);
}
finally {
depthCounters[67]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/minimum}
*/
export function mockMinimum(options: MockGeneratorOptions = {}): types.Minimum {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[68] ??= 0;
try {
depthCounters[68]++;
return (
(
configuration.defaultMinimumValue * configuration.numberPrecision +
nextSeed() % (
(configuration.defaultMaximumValue * configuration.numberPrecision) - configuration.defaultMinimumValue * configuration.numberPrecision + 1
) / configuration.numberPrecision
)
);
}
finally {
depthCounters[68]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/exclusiveMinimum}
*/
export function mockExclusiveMinimum(options: MockGeneratorOptions = {}): types.ExclusiveMinimum {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[69] ??= 0;
try {
depthCounters[69]++;
return (
(
configuration.defaultMinimumValue * configuration.numberPrecision +
nextSeed() % (
(configuration.defaultMaximumValue * configuration.numberPrecision) - configuration.defaultMinimumValue * configuration.numberPrecision + 1
) / configuration.numberPrecision
)
);
}
finally {
depthCounters[69]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/maxLength}
*/
export function mockMaxLength(options: MockGeneratorOptions = {}): types.MaxLength {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[70] ??= 0;
try {
depthCounters[70]++;
return (mockNonNegativeInteger());
}
finally {
depthCounters[70]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/minLength}
*/
export function mockMinLength(options: MockGeneratorOptions = {}): types.MinLength {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[71] ??= 0;
try {
depthCounters[71]++;
return (mockNonNegativeIntegerDefault0());
}
finally {
depthCounters[71]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/maxItems}
*/
export function mockMaxItems(options: MockGeneratorOptions = {}): types.MaxItems {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[73] ??= 0;
try {
depthCounters[73]++;
return (mockNonNegativeInteger());
}
finally {
depthCounters[73]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/minItems}
*/
export function mockMinItems(options: MockGeneratorOptions = {}): types.MinItems {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[74] ??= 0;
try {
depthCounters[74]++;
return (mockNonNegativeIntegerDefault0());
}
finally {
depthCounters[74]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/uniqueItems}
*/
export function mockUniqueItems(options: MockGeneratorOptions = {}): types.UniqueItems {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[75] ??= 0;
try {
depthCounters[75]++;
return (Boolean(nextSeed() % 2));
}
finally {
depthCounters[75]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/maxContains}
*/
export function mockMaxContains(options: MockGeneratorOptions = {}): types.MaxContains {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[76] ??= 0;
try {
depthCounters[76]++;
return (mockNonNegativeInteger());
}
finally {
depthCounters[76]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/minContains}
*/
export function mockMinContains(options: MockGeneratorOptions = {}): types.MinContains {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[77] ??= 0;
try {
depthCounters[77]++;
return (mockNonNegativeInteger());
}
finally {
depthCounters[77]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/maxProperties}
*/
export function mockMaxProperties(options: MockGeneratorOptions = {}): types.MaxProperties {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[78] ??= 0;
try {
depthCounters[78]++;
return (mockNonNegativeInteger());
}
finally {
depthCounters[78]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/minProperties}
*/
export function mockMinProperties(options: MockGeneratorOptions = {}): types.MinProperties {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[79] ??= 0;
try {
depthCounters[79]++;
return (mockNonNegativeIntegerDefault0());
}
finally {
depthCounters[79]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/$defs/stringArray/items}
*/
export function mockStringArrayItems(options: MockGeneratorOptions = {}): types.StringArrayItems {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[82] ??= 0;
try {
depthCounters[82]++;
return (
new Array(
configuration.defaultMinimumStringLength +
nextSeed() % (
configuration.defaultMaximumStringLength - configuration.defaultMinimumStringLength + 1
)
).
fill(undefined).
map(() => configuration.stringCharacters[nextSeed() % configuration.stringCharacters.length]).
join("")
);
}
finally {
depthCounters[82]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/validation#/properties/type/anyOf/1/items}
*/
export function mockTypeItems(options: MockGeneratorOptions = {}): types.TypeItems {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[87] ??= 0;
try {
depthCounters[87]++;
return (mockSimpleTypes());
}
finally {
depthCounters[87]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/meta-data#/properties/title}
*/
export function mockTitle(options: MockGeneratorOptions = {}): types.Title {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[89] ??= 0;
try {
depthCounters[89]++;
return (
new Array(
configuration.defaultMinimumStringLength +
nextSeed() % (
configuration.defaultMaximumStringLength - configuration.defaultMinimumStringLength + 1
)
).
fill(undefined).
map(() => configuration.stringCharacters[nextSeed() % configuration.stringCharacters.length]).
join("")
);
}
finally {
depthCounters[89]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/meta-data#/properties/description}
*/
export function mockDescription(options: MockGeneratorOptions = {}): types.Description {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[90] ??= 0;
try {
depthCounters[90]++;
return (
new Array(
configuration.defaultMinimumStringLength +
nextSeed() % (
configuration.defaultMaximumStringLength - configuration.defaultMinimumStringLength + 1
)
).
fill(undefined).
map(() => configuration.stringCharacters[nextSeed() % configuration.stringCharacters.length]).
join("")
);
}
finally {
depthCounters[90]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/meta-data#/properties/deprecated}
*/
export function mockDeprecated(options: MockGeneratorOptions = {}): types.Deprecated {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[92] ??= 0;
try {
depthCounters[92]++;
return (Boolean(nextSeed() % 2));
}
finally {
depthCounters[92]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/meta-data#/properties/readOnly}
*/
export function mockReadOnly(options: MockGeneratorOptions = {}): types.ReadOnly {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[93] ??= 0;
try {
depthCounters[93]++;
return (Boolean(nextSeed() % 2));
}
finally {
depthCounters[93]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/meta-data#/properties/writeOnly}
*/
export function mockWriteOnly(options: MockGeneratorOptions = {}): types.WriteOnly {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[94] ??= 0;
try {
depthCounters[94]++;
return (Boolean(nextSeed() % 2));
}
finally {
depthCounters[94]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/format-annotation#/properties/format}
*/
export function mockFormat(options: MockGeneratorOptions = {}): types.Format {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[98] ??= 0;
try {
depthCounters[98]++;
return (
new Array(
configuration.defaultMinimumStringLength +
nextSeed() % (
configuration.defaultMaximumStringLength - configuration.defaultMinimumStringLength + 1
)
).
fill(undefined).
map(() => configuration.stringCharacters[nextSeed() % configuration.stringCharacters.length]).
join("")
);
}
finally {
depthCounters[98]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/content#/properties/contentEncoding}
*/
export function mockContentEncoding(options: MockGeneratorOptions = {}): types.ContentEncoding {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[100] ??= 0;
try {
depthCounters[100]++;
return (
new Array(
configuration.defaultMinimumStringLength +
nextSeed() % (
configuration.defaultMaximumStringLength - configuration.defaultMinimumStringLength + 1
)
).
fill(undefined).
map(() => configuration.stringCharacters[nextSeed() % configuration.stringCharacters.length]).
join("")
);
}
finally {
depthCounters[100]--;
}
}
/**
* @see {@link https://json-schema.org/draft/2020-12/meta/content#/properties/contentMediaType}
*/
export function mockContentMediaType(options: MockGeneratorOptions = {}): types.ContentMediaType {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[101] ??= 0;
try {
depthCounters[101]++;
return (
new Array(
configuration.defaultMinimumStringLength +
nextSeed() % (
configuration.defaultMaximumStringLength - configuration.defaultMinimumStringLength + 1
)
).
fill(undefined).
map(() => configuration.stringCharacters[nextSeed() % configuration.stringCharacters.length]).
join("")
);
}
finally {
depthCounters[101]--;
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
