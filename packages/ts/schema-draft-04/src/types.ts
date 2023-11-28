// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.8.12                         -- www.JsonSchema42.org
/**
Core schema meta-schema
*/
export type Draft04Schema = ((
{
"id"?: Id,
"$schema"?: PropertiesSchema,
"title"?: Title,
"description"?: Description,
"default"?: Default,
"multipleOf"?: MultipleOf,
"maximum"?: Maximum,
"exclusiveMaximum"?: ExclusiveMaximum,
"minimum"?: Minimum,
"exclusiveMinimum"?: ExclusiveMinimum,
"maxLength"?: MaxLength,
"minLength"?: MinLength,
"pattern"?: Pattern,
"additionalItems"?: AdditionalItems,
"items"?: PropertiesItems,
"maxItems"?: MaxItems,
"minItems"?: MinItems,
"uniqueItems"?: UniqueItems,
"maxProperties"?: MaxProperties,
"minProperties"?: MinProperties,
"required"?: Required,
"additionalProperties"?: SchemaPropertiesAdditionalProperties,
"definitions"?: Definitions,
"properties"?: Properties,
"patternProperties"?: PatternProperties,
"dependencies"?: Dependencies,
"enum"?: Enum,
"type"?: Type,
"format"?: Format,
"allOf"?: AllOf,
"anyOf"?: AnyOf,
"oneOf"?: OneOf,
"not"?: Not,
}
));
export type SchemaArray = (((SchemaArrayItems)[]));
export type PositiveInteger = ((number));
export type PositiveIntegerDefault0 = (AllOf0 &
AllOf1);
export type SimpleTypes = (("array" |
"boolean" |
"integer" |
"null" |
"number" |
"object" |
"string"));
export type StringArray = (((StringArrayItems)[]));
export type Id = ((string));
export type PropertiesSchema = ((string));
export type Title = ((string));
export type Description = ((string));
export type Default = unknown;
export type MultipleOf = ((number));
export type Maximum = ((number));
export type ExclusiveMaximum = ((boolean));
export type Minimum = ((number));
export type ExclusiveMinimum = ((boolean));
export type MaxLength = (PositiveInteger);
export type MinLength = (PositiveIntegerDefault0);
export type Pattern = ((string));
export type AdditionalItems = ((AdditionalItemsAnyOf0) |
(AdditionalItemsAnyOf1) |
(AdditionalItemsAnyOf0 & AdditionalItemsAnyOf1));
export type PropertiesItems = ((ItemsAnyOf0) |
(ItemsAnyOf1) |
(ItemsAnyOf0 & ItemsAnyOf1));
export type MaxItems = (PositiveInteger);
export type MinItems = (PositiveIntegerDefault0);
export type UniqueItems = ((boolean));
export type MaxProperties = (PositiveInteger);
export type MinProperties = (PositiveIntegerDefault0);
export type Required = (StringArray);
export type SchemaPropertiesAdditionalProperties = ((PropertiesAdditionalPropertiesAnyOf0) |
(PropertiesAdditionalPropertiesAnyOf1) |
(PropertiesAdditionalPropertiesAnyOf0 & PropertiesAdditionalPropertiesAnyOf1));
export type Definitions = ((
{
[key: string]: DefinitionsAdditionalProperties,
}
));
export type Properties = ((
{
[key: string]: PropertiesPropertiesAdditionalProperties,
}
));
export type PatternProperties = ((
{
[key: string]: PatternPropertiesAdditionalProperties,
}
));
export type Dependencies = ((
{
[key: string]: DependenciesAdditionalProperties,
}
));
export type Enum = ((Array<unknown>));
export type Type = ((TypeAnyOf0) |
(TypeAnyOf1) |
(TypeAnyOf0 & TypeAnyOf1));
export type Format = ((string));
export type AllOf = (SchemaArray);
export type AnyOf = (SchemaArray);
export type OneOf = (SchemaArray);
export type Not = (Draft04Schema);
export type SchemaArrayItems = (Draft04Schema);
export type AllOf0 = (PositiveInteger);
export type AllOf1 = unknown;
export type StringArrayItems = ((string));
export type AdditionalItemsAnyOf0 = ((boolean));
export type AdditionalItemsAnyOf1 = (Draft04Schema);
export type ItemsAnyOf0 = (Draft04Schema);
export type ItemsAnyOf1 = (SchemaArray);
export type PropertiesAdditionalPropertiesAnyOf0 = ((boolean));
export type PropertiesAdditionalPropertiesAnyOf1 = (Draft04Schema);
export type DefinitionsAdditionalProperties = (Draft04Schema);
export type PropertiesPropertiesAdditionalProperties = (Draft04Schema);
export type PatternPropertiesAdditionalProperties = (Draft04Schema);
export type DependenciesAdditionalProperties = ((DependenciesAdditionalPropertiesAnyOf0) |
(DependenciesAdditionalPropertiesAnyOf1) |
(DependenciesAdditionalPropertiesAnyOf0 & DependenciesAdditionalPropertiesAnyOf1));
export type TypeAnyOf0 = (SimpleTypes);
export type TypeAnyOf1 = (((AnyOf1Items)[]));
export type DependenciesAdditionalPropertiesAnyOf0 = (Draft04Schema);
export type DependenciesAdditionalPropertiesAnyOf1 = (StringArray);
export type AnyOf1Items = (SimpleTypes);
