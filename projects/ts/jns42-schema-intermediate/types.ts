// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.8.6                          -- www.JsonSchema42.org
/**
JsonSchema42 intermediate schema
*/
export type SchemaJson = (
{
"$schema": Schema,
"schemas": Schemas,
}
);
export type Node = (
{
"context"?: Context,
"metadata": Metadata,
"types": Types,
"assertions": Assertions,
"applicators": Applicators,
}
);
/**
some meta information about this schema
*/
export type MetadataSection = (
{
"title"?: Title,
"description"?: Description,
"examples"?: Examples,
"deprecated": Deprecated,
}
);
/**
What types does this schema describe
*/
export type TypesSection = ((TypesSectionItems)[]);
/**
Assertions, per type it is possible that an assertion for a different type is present here, that validator may be used when this schema is used as an applicator
*/
export type AssertionsSection = (
{
"boolean"?: Boolean,
"integer"?: Integer,
"number"?: Number,
"string"?: String,
"array"?: Array,
"map"?: Map,
}
);
/**
Applicators apply other schemas to this one
*/
export type ApplicatorsSection = (
{
"reference"?: Reference,
"oneOf"?: OneOf,
"anyOf"?: AnyOf,
"allOf"?: AllOf,
"if"?: If,
"then"?: Then,
"else"?: Else,
"not"?: Not,
"dependentSchemas"?: DependentSchemas,
"objectProperties"?: ObjectProperties,
"mapProperties"?: MapProperties,
"patternProperties"?: PatternProperties,
"propertyNames"?: PropertyNames,
"tupleItems"?: TupleItems,
"arrayItems"?: ArrayItems,
"contains"?: Contains,
}
);
export type BooleanAssertion = (
{
"options"?: BooleanAssertionOptions,
}
);
export type IntegerAssertion = (
{
"options"?: IntegerAssertionOptions,
"minimumInclusive"?: IntegerAssertionMinimumInclusive,
"minimumExclusive"?: IntegerAssertionMinimumExclusive,
"maximumInclusive"?: IntegerAssertionMaximumInclusive,
"maximumExclusive"?: IntegerAssertionMaximumExclusive,
"multipleOf"?: IntegerAssertionMultipleOf,
}
);
export type NumberAssertion = (
{
"options"?: NumberAssertionOptions,
"minimumInclusive"?: NumberAssertionMinimumInclusive,
"minimumExclusive"?: NumberAssertionMinimumExclusive,
"maximumInclusive"?: NumberAssertionMaximumInclusive,
"maximumExclusive"?: NumberAssertionMaximumExclusive,
"multipleOf"?: NumberAssertionMultipleOf,
}
);
export type StringAssertion = (
{
"options"?: StringAssertionOptions,
"minimumLength"?: MinimumLength,
"maximumLength"?: MaximumLength,
"valuePattern"?: ValuePattern,
"valueFormat"?: ValueFormat,
}
);
export type ArrayAssertion = (
{
"minimumItems"?: MinimumItems,
"maximumItems"?: MaximumItems,
"uniqueItems"?: UniqueItems,
}
);
export type MapAssertion = (
{
"required"?: Required,
"minimumProperties"?: MinimumProperties,
"maximumProperties"?: MaximumProperties,
}
);
export type NodeReference = (string);
export type IntegerValue = (number);
export type NumberValue = (number);
export type BooleanValue = (boolean);
export type StringValue = (string);
export type NonEmptyStringValue = (string);
export type Amount = (number);
export type Schema = ("https://schema.JsonSchema42.org/jns42-intermediate/schema.json");
export type Schemas = (
{
[key: string]: SchemasAdditionalProperties,
}
);
export type Context = (NodeReference);
export type Metadata = (MetadataSection);
export type Types = (TypesSection);
export type Assertions = (AssertionsSection);
export type Applicators = (ApplicatorsSection);
export type Title = (NonEmptyStringValue);
export type Description = (NonEmptyStringValue);
export type Examples = ((ExamplesItems)[]);
export type Deprecated = (BooleanValue);
export type TypesSectionItems = ("never" |
"any" |
"null" |
"boolean" |
"integer" |
"number" |
"string" |
"array" |
"map");
export type Boolean = (BooleanAssertion);
export type Integer = (IntegerAssertion);
export type Number = (NumberAssertion);
export type String = (StringAssertion);
export type Array = (ArrayAssertion);
export type Map = (MapAssertion);
export type Reference = (NodeReference);
export type OneOf = ((OneOfItems)[]);
export type AnyOf = ((AnyOfItems)[]);
export type AllOf = ((AllOfItems)[]);
export type If = (NodeReference);
export type Then = (NodeReference);
export type Else = (NodeReference);
export type Not = (NodeReference);
export type DependentSchemas = (
{
[key: string]: DependentSchemasAdditionalProperties,
}
);
export type ObjectProperties = (
{
[key: string]: ObjectPropertiesAdditionalProperties,
}
);
export type MapProperties = (NodeReference);
export type PatternProperties = (
{
[key: string]: PatternPropertiesAdditionalProperties,
}
);
export type PropertyNames = (NodeReference);
export type TupleItems = ((TupleItemsItems)[]);
export type ArrayItems = (NodeReference);
export type Contains = (NodeReference);
export type BooleanAssertionOptions = ((BooleanAssertionOptionsItems)[]);
export type IntegerAssertionOptions = ((IntegerAssertionOptionsItems)[]);
export type IntegerAssertionMinimumInclusive = (IntegerValue);
export type IntegerAssertionMinimumExclusive = (IntegerValue);
export type IntegerAssertionMaximumInclusive = (IntegerValue);
export type IntegerAssertionMaximumExclusive = (IntegerValue);
export type IntegerAssertionMultipleOf = (IntegerValue);
export type NumberAssertionOptions = ((NumberAssertionOptionsItems)[]);
export type NumberAssertionMinimumInclusive = (NumberValue);
export type NumberAssertionMinimumExclusive = (NumberValue);
export type NumberAssertionMaximumInclusive = (NumberValue);
export type NumberAssertionMaximumExclusive = (NumberValue);
export type NumberAssertionMultipleOf = (NumberValue);
export type StringAssertionOptions = ((StringAssertionOptionsItems)[]);
export type MinimumLength = (Amount);
export type MaximumLength = (Amount);
export type ValuePattern = (NonEmptyStringValue);
export type ValueFormat = (NonEmptyStringValue);
export type MinimumItems = (Amount);
export type MaximumItems = (Amount);
export type UniqueItems = (boolean);
export type Required = ((RequiredItems)[]);
export type MinimumProperties = (Amount);
export type MaximumProperties = (Amount);
export type SchemasAdditionalProperties = (Node);
export type ExamplesItems = (any);
export type OneOfItems = (NodeReference);
export type AnyOfItems = (NodeReference);
export type AllOfItems = (NodeReference);
export type DependentSchemasAdditionalProperties = (NodeReference);
export type ObjectPropertiesAdditionalProperties = (NodeReference);
export type PatternPropertiesAdditionalProperties = (NodeReference);
export type TupleItemsItems = (NodeReference);
export type BooleanAssertionOptionsItems = (BooleanValue);
export type IntegerAssertionOptionsItems = (IntegerValue);
export type NumberAssertionOptionsItems = (NumberValue);
export type StringAssertionOptionsItems = (StringValue);
export type RequiredItems = (StringValue);
