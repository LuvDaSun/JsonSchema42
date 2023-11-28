// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.8.9                          -- www.JsonSchema42.org
/**
Core and Validation specifications meta-schema
*/
export type Draft202012Schema = (AllOf0 &
AllOf1 &
AllOf2 &
AllOf3 &
AllOf4 &
AllOf5 &
AllOf6) &
((
{
"definitions"?: Definitions,
"dependencies"?: Dependencies,
"$recursiveAnchor"?: RecursiveAnchor,
"$recursiveRef"?: RecursiveRef,
}
) |
(boolean));
/**
@deprecated
*/
export type Definitions = ((
{
[key: string]: DefinitionsAdditionalProperties,
}
));
/**
@deprecated
*/
export type Dependencies = ((
{
[key: string]: DependenciesAdditionalProperties,
}
));
/**
@deprecated
*/
export type RecursiveAnchor = (AnchorString);
/**
@deprecated
*/
export type RecursiveRef = (UriReferenceString);
export type AllOf0 = (Core);
export type AllOf1 = (Applicator);
export type AllOf2 = (Unevaluated);
export type AllOf3 = (Validation);
export type AllOf4 = (MetaData);
export type AllOf5 = (FormatAnnotation);
export type AllOf6 = (Content);
export type DefinitionsAdditionalProperties = (Draft202012Schema);
export type DependenciesAdditionalProperties = ((AdditionalPropertiesAnyOf0) |
(AdditionalPropertiesAnyOf1) |
(AdditionalPropertiesAnyOf0 & AdditionalPropertiesAnyOf1));
export type AdditionalPropertiesAnyOf0 = (Draft202012Schema);
export type AdditionalPropertiesAnyOf1 = (StringArray);
export type AnchorString = ((string));
export type UriReferenceString = ((string));
/**
Core vocabulary meta-schema
*/
export type Core = ((
{
"$id"?: Id,
"$schema"?: PropertiesSchema,
"$ref"?: Ref,
"$anchor"?: Anchor,
"$dynamicRef"?: DynamicRef,
"$dynamicAnchor"?: DynamicAnchor,
"$vocabulary"?: Vocabulary,
"$comment"?: Comment,
"$defs"?: Defs,
}
) |
(boolean));
export type UriString = ((string));
export type Id = (UriReferenceString) &
((string));
export type PropertiesSchema = (UriString);
export type Ref = (UriReferenceString);
export type Anchor = (AnchorString);
export type DynamicRef = (UriReferenceString);
export type DynamicAnchor = (AnchorString);
export type Vocabulary = ((
{
[key: VocabularyPropertyNames]: VocabularyAdditionalProperties,
}
));
export type Comment = ((string));
export type Defs = ((
{
[key: string]: DefsAdditionalProperties,
}
));
export type VocabularyAdditionalProperties = ((boolean));
export type VocabularyPropertyNames = (UriString);
export type DefsAdditionalProperties = (Draft202012Schema);
/**
Applicator vocabulary meta-schema
*/
export type Applicator = ((
{
"prefixItems"?: PrefixItems,
"items"?: PropertiesItems,
"contains"?: Contains,
"additionalProperties"?: ApplicatorPropertiesAdditionalProperties,
"properties"?: Properties,
"patternProperties"?: PatternProperties,
"dependentSchemas"?: DependentSchemas,
"propertyNames"?: PropertiesPropertyNames,
"if"?: If,
"then"?: Then,
"else"?: Else,
"allOf"?: AllOf,
"anyOf"?: AnyOf,
"oneOf"?: OneOf,
"not"?: Not,
}
) |
(boolean));
export type SchemaArray = (((SchemaArrayItems)[]));
export type PrefixItems = (SchemaArray);
export type PropertiesItems = (Draft202012Schema);
export type Contains = (Draft202012Schema);
export type ApplicatorPropertiesAdditionalProperties = (Draft202012Schema);
export type Properties = ((
{
[key: string]: PropertiesPropertiesAdditionalProperties,
}
));
export type PatternProperties = ((
{
[key: PatternPropertiesPropertyNames]: PatternPropertiesAdditionalProperties,
}
));
export type DependentSchemas = ((
{
[key: string]: DependentSchemasAdditionalProperties,
}
));
export type PropertiesPropertyNames = (Draft202012Schema);
export type If = (Draft202012Schema);
export type Then = (Draft202012Schema);
export type Else = (Draft202012Schema);
export type AllOf = (SchemaArray);
export type AnyOf = (SchemaArray);
export type OneOf = (SchemaArray);
export type Not = (Draft202012Schema);
export type SchemaArrayItems = (Draft202012Schema);
export type PropertiesPropertiesAdditionalProperties = (Draft202012Schema);
export type PatternPropertiesAdditionalProperties = (Draft202012Schema);
export type PatternPropertiesPropertyNames = ((string));
export type DependentSchemasAdditionalProperties = (Draft202012Schema);
/**
Unevaluated applicator vocabulary meta-schema
*/
export type Unevaluated = ((
{
"unevaluatedItems"?: UnevaluatedItems,
"unevaluatedProperties"?: UnevaluatedProperties,
}
) |
(boolean));
export type UnevaluatedItems = (Draft202012Schema);
export type UnevaluatedProperties = (Draft202012Schema);
/**
Validation vocabulary meta-schema
*/
export type Validation = ((
{
"type"?: Type,
"const"?: Const,
"enum"?: Enum,
"multipleOf"?: MultipleOf,
"maximum"?: Maximum,
"exclusiveMaximum"?: ExclusiveMaximum,
"minimum"?: Minimum,
"exclusiveMinimum"?: ExclusiveMinimum,
"maxLength"?: MaxLength,
"minLength"?: MinLength,
"pattern"?: Pattern,
"maxItems"?: MaxItems,
"minItems"?: MinItems,
"uniqueItems"?: UniqueItems,
"maxContains"?: MaxContains,
"minContains"?: MinContains,
"maxProperties"?: MaxProperties,
"minProperties"?: MinProperties,
"required"?: Required,
"dependentRequired"?: DependentRequired,
}
) |
(boolean));
export type NonNegativeInteger = ((number));
export type NonNegativeIntegerDefault0 = (NonNegativeInteger);
export type SimpleTypes = (("array" |
"boolean" |
"integer" |
"null" |
"number" |
"object" |
"string"));
export type StringArray = (((StringArrayItems)[]));
export type Type = ((TypeAnyOf0) |
(TypeAnyOf1) |
(TypeAnyOf0 & TypeAnyOf1));
export type Const = ((any));
export type Enum = (((EnumItems)[]));
export type MultipleOf = ((number));
export type Maximum = ((number));
export type ExclusiveMaximum = ((number));
export type Minimum = ((number));
export type ExclusiveMinimum = ((number));
export type MaxLength = (NonNegativeInteger);
export type MinLength = (NonNegativeIntegerDefault0);
export type Pattern = ((string));
export type MaxItems = (NonNegativeInteger);
export type MinItems = (NonNegativeIntegerDefault0);
export type UniqueItems = ((boolean));
export type MaxContains = (NonNegativeInteger);
export type MinContains = (NonNegativeInteger);
export type MaxProperties = (NonNegativeInteger);
export type MinProperties = (NonNegativeIntegerDefault0);
export type Required = (StringArray);
export type DependentRequired = ((
{
[key: string]: DependentRequiredAdditionalProperties,
}
));
export type StringArrayItems = ((string));
export type TypeAnyOf0 = (SimpleTypes);
export type TypeAnyOf1 = (((AnyOf1Items)[]));
export type EnumItems = ((any));
export type DependentRequiredAdditionalProperties = (StringArray);
export type AnyOf1Items = (SimpleTypes);
/**
Meta-data vocabulary meta-schema
*/
export type MetaData = ((
{
"title"?: Title,
"description"?: Description,
"default"?: Default,
"deprecated"?: Deprecated,
"readOnly"?: ReadOnly,
"writeOnly"?: WriteOnly,
"examples"?: Examples,
}
) |
(boolean));
export type Title = ((string));
export type Description = ((string));
export type Default = ((any));
export type Deprecated = ((boolean));
export type ReadOnly = ((boolean));
export type WriteOnly = ((boolean));
export type Examples = (((ExamplesItems)[]));
export type ExamplesItems = ((any));
/**
Format vocabulary meta-schema for annotation results
*/
export type FormatAnnotation = ((
{
"format"?: Format,
}
) |
(boolean));
export type Format = ((string));
/**
Content vocabulary meta-schema
*/
export type Content = ((
{
"contentEncoding"?: ContentEncoding,
"contentMediaType"?: ContentMediaType,
"contentSchema"?: ContentSchema,
}
) |
(boolean));
export type ContentEncoding = ((string));
export type ContentMediaType = ((string));
export type ContentSchema = (Draft202012Schema);