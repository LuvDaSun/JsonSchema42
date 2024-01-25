// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.12.6                         -- www.JsonSchema42.org
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
* @see {@link http://json-schema.org/draft-04/schema#/definitions/positiveInteger}
*/
export function mockPositiveInteger(options: MockGeneratorOptions = {}): types.PositiveInteger {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[2] ??= 0;
try {
depthCounters[2]++;
return (
(Math.ceil(0 / 1) + nextSeed() % (Math.floor(configuration.defaultMaximumValue / 1) - Math.ceil(0 / 1) + 1)) * 1
);
}
finally {
depthCounters[2]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/id}
*/
export function mockId(options: MockGeneratorOptions = {}): types.Id {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[6] ??= 0;
try {
depthCounters[6]++;
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
depthCounters[6]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/$schema}
*/
export function mockSchema(options: MockGeneratorOptions = {}): types.Schema {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[7] ??= 0;
try {
depthCounters[7]++;
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
depthCounters[7]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/title}
*/
export function mockTitle(options: MockGeneratorOptions = {}): types.Title {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[8] ??= 0;
try {
depthCounters[8]++;
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
depthCounters[8]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/description}
*/
export function mockDescription(options: MockGeneratorOptions = {}): types.Description {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[9] ??= 0;
try {
depthCounters[9]++;
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
depthCounters[9]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/multipleOf}
*/
export function mockMultipleOf(options: MockGeneratorOptions = {}): types.MultipleOf {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[11] ??= 0;
try {
depthCounters[11]++;
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
depthCounters[11]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/maximum}
*/
export function mockMaximum(options: MockGeneratorOptions = {}): types.Maximum {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[12] ??= 0;
try {
depthCounters[12]++;
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
depthCounters[12]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/exclusiveMaximum}
*/
export function mockExclusiveMaximum(options: MockGeneratorOptions = {}): types.ExclusiveMaximum {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[13] ??= 0;
try {
depthCounters[13]++;
return (Boolean(nextSeed() % 2));
}
finally {
depthCounters[13]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/minimum}
*/
export function mockMinimum(options: MockGeneratorOptions = {}): types.Minimum {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[14] ??= 0;
try {
depthCounters[14]++;
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
depthCounters[14]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/exclusiveMinimum}
*/
export function mockExclusiveMinimum(options: MockGeneratorOptions = {}): types.ExclusiveMinimum {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[15] ??= 0;
try {
depthCounters[15]++;
return (Boolean(nextSeed() % 2));
}
finally {
depthCounters[15]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/maxLength}
*/
export function mockMaxLength(options: MockGeneratorOptions = {}): types.MaxLength {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[16] ??= 0;
try {
depthCounters[16]++;
return (mockPositiveInteger());
}
finally {
depthCounters[16]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/maxItems}
*/
export function mockMaxItems(options: MockGeneratorOptions = {}): types.MaxItems {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[21] ??= 0;
try {
depthCounters[21]++;
return (mockPositiveInteger());
}
finally {
depthCounters[21]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/uniqueItems}
*/
export function mockUniqueItems(options: MockGeneratorOptions = {}): types.UniqueItems {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[23] ??= 0;
try {
depthCounters[23]++;
return (Boolean(nextSeed() % 2));
}
finally {
depthCounters[23]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/maxProperties}
*/
export function mockMaxProperties(options: MockGeneratorOptions = {}): types.MaxProperties {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[24] ??= 0;
try {
depthCounters[24]++;
return (mockPositiveInteger());
}
finally {
depthCounters[24]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/properties/format}
*/
export function mockFormat(options: MockGeneratorOptions = {}): types.Format {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[34] ??= 0;
try {
depthCounters[34]++;
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
depthCounters[34]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/positiveIntegerDefault0/allOf/0}
*/
export function mockPositiveIntegerDefault00(options: MockGeneratorOptions = {}): types.PositiveIntegerDefault00 {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[40] ??= 0;
try {
depthCounters[40]++;
return (mockPositiveInteger());
}
finally {
depthCounters[40]--;
}
}
/**
* @see {@link http://json-schema.org/draft-04/schema#/definitions/stringArray/items}
*/
export function mockStringArrayItems(options: MockGeneratorOptions = {}): types.StringArrayItems {
const configuration = {
...defaultMockGeneratorOptions,
...options,
};
depthCounters[42] ??= 0;
try {
depthCounters[42]++;
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
depthCounters[42]--;
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
