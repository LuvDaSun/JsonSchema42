// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.8.21                         -- www.JsonSchema42.org
// https://json-schema.org/draft/2020-12/schema
/**
Core and Validation specifications meta-schema
*/
export type Schema = (AllOf0 &
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
// https://json-schema.org/draft/2020-12/schema#/properties/definitions
/**
@deprecated
*/
export type Definitions = ((
{
[key: string]: DefinitionsAdditionalProperties,
}
));
// https://json-schema.org/draft/2020-12/schema#/properties/dependencies
/**
@deprecated
*/
export type Dependencies = ((
{
[key: string]: DependenciesAdditionalProperties,
}
));
// https://json-schema.org/draft/2020-12/schema#/properties/$recursiveAnchor
/**
@deprecated
*/
export type RecursiveAnchor = (AnchorString);
// https://json-schema.org/draft/2020-12/schema#/properties/$recursiveRef
/**
@deprecated
*/
export type RecursiveRef = (UriReferenceString);
// https://json-schema.org/draft/2020-12/schema#/allOf/0
export type AllOf0 = (Core);
// https://json-schema.org/draft/2020-12/schema#/allOf/1
export type AllOf1 = (Applicator);
// https://json-schema.org/draft/2020-12/schema#/allOf/2
export type AllOf2 = (Unevaluated);
// https://json-schema.org/draft/2020-12/schema#/allOf/3
export type AllOf3 = (Validation);
// https://json-schema.org/draft/2020-12/schema#/allOf/4
export type AllOf4 = (MetaData);
// https://json-schema.org/draft/2020-12/schema#/allOf/5
export type AllOf5 = (FormatAnnotation);
// https://json-schema.org/draft/2020-12/schema#/allOf/6
export type AllOf6 = (Content);
// https://json-schema.org/draft/2020-12/schema#/properties/definitions/additionalProperties
export type DefinitionsAdditionalProperties = (Schema);
// https://json-schema.org/draft/2020-12/schema#/properties/dependencies/additionalProperties
export type DependenciesAdditionalProperties = ((Dependencies0) |
(Dependencies1) |
(Dependencies0 & Dependencies1));
// https://json-schema.org/draft/2020-12/schema#/properties/dependencies/additionalProperties/anyOf/0
export type Dependencies0 = (Schema);
// https://json-schema.org/draft/2020-12/schema#/properties/dependencies/additionalProperties/anyOf/1
export type Dependencies1 = (StringArray);
// https://json-schema.org/draft/2020-12/meta/core#/$defs/anchorString
export type AnchorString = ((string));
// https://json-schema.org/draft/2020-12/meta/core#/$defs/uriReferenceString
export type UriReferenceString = ((string));
// https://json-schema.org/draft/2020-12/meta/core
/**
Core vocabulary meta-schema
*/
export type Core = ((
{
"$id"?: Id,
"$schema"?: CoreSchema,
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
// https://json-schema.org/draft/2020-12/meta/core#/$defs/uriString
export type UriString = ((string));
// https://json-schema.org/draft/2020-12/meta/core#/properties/$id
export type Id = (UriReferenceString) &
((string));
// https://json-schema.org/draft/2020-12/meta/core#/properties/$schema
export type CoreSchema = (UriString);
// https://json-schema.org/draft/2020-12/meta/core#/properties/$ref
export type Ref = (UriReferenceString);
// https://json-schema.org/draft/2020-12/meta/core#/properties/$anchor
export type Anchor = (AnchorString);
// https://json-schema.org/draft/2020-12/meta/core#/properties/$dynamicRef
export type DynamicRef = (UriReferenceString);
// https://json-schema.org/draft/2020-12/meta/core#/properties/$dynamicAnchor
export type DynamicAnchor = (AnchorString);
// https://json-schema.org/draft/2020-12/meta/core#/properties/$vocabulary
export type Vocabulary = ((
{
[key: VocabularyPropertyNames]: VocabularyAdditionalProperties,
}
));
// https://json-schema.org/draft/2020-12/meta/core#/properties/$comment
export type Comment = ((string));
// https://json-schema.org/draft/2020-12/meta/core#/properties/$defs
export type Defs = ((
{
[key: string]: DefsAdditionalProperties,
}
));
// https://json-schema.org/draft/2020-12/meta/core#/properties/$vocabulary/additionalProperties
export type VocabularyAdditionalProperties = ((boolean));
// https://json-schema.org/draft/2020-12/meta/core#/properties/$vocabulary/propertyNames
export type VocabularyPropertyNames = (UriString);
// https://json-schema.org/draft/2020-12/meta/core#/properties/$defs/additionalProperties
export type DefsAdditionalProperties = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator
/**
Applicator vocabulary meta-schema
*/
export type Applicator = ((
{
"prefixItems"?: PrefixItems,
"items"?: ApplicatorItems,
"contains"?: Contains,
"additionalProperties"?: ApplicatorAdditionalProperties,
"properties"?: Properties,
"patternProperties"?: PatternProperties,
"dependentSchemas"?: DependentSchemas,
"propertyNames"?: ApplicatorPropertyNames,
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
// https://json-schema.org/draft/2020-12/meta/applicator#/$defs/schemaArray
export type SchemaArray = (((SchemaArrayItems)[]));
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/prefixItems
export type PrefixItems = (SchemaArray);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/items
export type ApplicatorItems = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/contains
export type Contains = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/additionalProperties
export type ApplicatorAdditionalProperties = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/properties
export type Properties = ((
{
[key: string]: PropertiesAdditionalProperties,
}
));
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/patternProperties
export type PatternProperties = ((
{
[key: PatternPropertiesPropertyNames]: PatternPropertiesAdditionalProperties,
}
));
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/dependentSchemas
export type DependentSchemas = ((
{
[key: string]: DependentSchemasAdditionalProperties,
}
));
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/propertyNames
export type ApplicatorPropertyNames = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/if
export type If = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/then
export type Then = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/else
export type Else = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/allOf
export type AllOf = (SchemaArray);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/anyOf
export type AnyOf = (SchemaArray);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/oneOf
export type OneOf = (SchemaArray);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/not
export type Not = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/$defs/schemaArray/items
export type SchemaArrayItems = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/properties/additionalProperties
export type PropertiesAdditionalProperties = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/patternProperties/additionalProperties
export type PatternPropertiesAdditionalProperties = (Schema);
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/patternProperties/propertyNames
export type PatternPropertiesPropertyNames = ((string));
// https://json-schema.org/draft/2020-12/meta/applicator#/properties/dependentSchemas/additionalProperties
export type DependentSchemasAdditionalProperties = (Schema);
// https://json-schema.org/draft/2020-12/meta/unevaluated
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
// https://json-schema.org/draft/2020-12/meta/unevaluated#/properties/unevaluatedItems
export type UnevaluatedItems = (Schema);
// https://json-schema.org/draft/2020-12/meta/unevaluated#/properties/unevaluatedProperties
export type UnevaluatedProperties = (Schema);
// https://json-schema.org/draft/2020-12/meta/validation
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
// https://json-schema.org/draft/2020-12/meta/validation#/$defs/nonNegativeInteger
export type NonNegativeInteger = ((number));
// https://json-schema.org/draft/2020-12/meta/validation#/$defs/nonNegativeIntegerDefault0
export type NonNegativeIntegerDefault0 = (NonNegativeInteger);
// https://json-schema.org/draft/2020-12/meta/validation#/$defs/simpleTypes
export type SimpleTypes = (("array" |
"boolean" |
"integer" |
"null" |
"number" |
"object" |
"string"));
// https://json-schema.org/draft/2020-12/meta/validation#/$defs/stringArray
export type StringArray = (((StringArrayItems)[]));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/type
export type Type = ((Type0) |
(Type1) |
(Type0 & Type1));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/const
export type Const = ((any));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/enum
export type Enum = (((EnumItems)[]));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/multipleOf
export type MultipleOf = ((number));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/maximum
export type Maximum = ((number));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/exclusiveMaximum
export type ExclusiveMaximum = ((number));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/minimum
export type Minimum = ((number));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/exclusiveMinimum
export type ExclusiveMinimum = ((number));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/maxLength
export type MaxLength = (NonNegativeInteger);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/minLength
export type MinLength = (NonNegativeIntegerDefault0);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/pattern
export type Pattern = ((string));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/maxItems
export type MaxItems = (NonNegativeInteger);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/minItems
export type MinItems = (NonNegativeIntegerDefault0);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/uniqueItems
export type UniqueItems = ((boolean));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/maxContains
export type MaxContains = (NonNegativeInteger);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/minContains
export type MinContains = (NonNegativeInteger);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/maxProperties
export type MaxProperties = (NonNegativeInteger);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/minProperties
export type MinProperties = (NonNegativeIntegerDefault0);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/required
export type Required = (StringArray);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/dependentRequired
export type DependentRequired = ((
{
[key: string]: DependentRequiredAdditionalProperties,
}
));
// https://json-schema.org/draft/2020-12/meta/validation#/$defs/stringArray/items
export type StringArrayItems = ((string));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/type/anyOf/0
export type Type0 = (SimpleTypes);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/type/anyOf/1
export type Type1 = (((TypeItems)[]));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/enum/items
export type EnumItems = ((any));
// https://json-schema.org/draft/2020-12/meta/validation#/properties/dependentRequired/additionalProperties
export type DependentRequiredAdditionalProperties = (StringArray);
// https://json-schema.org/draft/2020-12/meta/validation#/properties/type/anyOf/1/items
export type TypeItems = (SimpleTypes);
// https://json-schema.org/draft/2020-12/meta/meta-data
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
// https://json-schema.org/draft/2020-12/meta/meta-data#/properties/title
export type Title = ((string));
// https://json-schema.org/draft/2020-12/meta/meta-data#/properties/description
export type Description = ((string));
// https://json-schema.org/draft/2020-12/meta/meta-data#/properties/default
export type Default = ((any));
// https://json-schema.org/draft/2020-12/meta/meta-data#/properties/deprecated
export type Deprecated = ((boolean));
// https://json-schema.org/draft/2020-12/meta/meta-data#/properties/readOnly
export type ReadOnly = ((boolean));
// https://json-schema.org/draft/2020-12/meta/meta-data#/properties/writeOnly
export type WriteOnly = ((boolean));
// https://json-schema.org/draft/2020-12/meta/meta-data#/properties/examples
export type Examples = (((ExamplesItems)[]));
// https://json-schema.org/draft/2020-12/meta/meta-data#/properties/examples/items
export type ExamplesItems = ((any));
// https://json-schema.org/draft/2020-12/meta/format-annotation
/**
Format vocabulary meta-schema for annotation results
*/
export type FormatAnnotation = ((
{
"format"?: Format,
}
) |
(boolean));
// https://json-schema.org/draft/2020-12/meta/format-annotation#/properties/format
export type Format = ((string));
// https://json-schema.org/draft/2020-12/meta/content
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
// https://json-schema.org/draft/2020-12/meta/content#/properties/contentEncoding
export type ContentEncoding = ((string));
// https://json-schema.org/draft/2020-12/meta/content#/properties/contentMediaType
export type ContentMediaType = ((string));
// https://json-schema.org/draft/2020-12/meta/content#/properties/contentSchema
export type ContentSchema = (Schema);
