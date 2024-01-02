// @generated by
//     __             _____     _                 ___ ___
//  _ |  |___ ___ ___|   __|___| |_ ___ _____  __| | |_  |
// | |_| |_ -| . |   |__   |  _|   | -_|     ||. |_  |  _|
// |_____|___|___|_|_|_____|___|_|_|___|_|_|_|___| |_|___|
// v0.8.21                         -- www.JsonSchema42.org
// https://schema.jsonschema42.org/jns42-intermediate/schema.json
/**
JsonSchema42 intermediate schema
*/
export type SchemaDocument = ((
{
"$schema": Schema,
"schemas": Schemas,
}
));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node
export type Node = ((
{
"title"?: Title,
"description"?: Description,
"examples"?: Examples,
"deprecated"?: Deprecated,
"types"?: Types,
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
"options"?: Options,
"minimumInclusive"?: MinimumInclusive,
"minimumExclusive"?: MinimumExclusive,
"maximumInclusive"?: MaximumInclusive,
"maximumExclusive"?: MaximumExclusive,
"multipleOf"?: MultipleOf,
"minimumLength"?: MinimumLength,
"maximumLength"?: MaximumLength,
"valuePattern"?: ValuePattern,
"valueFormat"?: ValueFormat,
"minimumItems"?: MinimumItems,
"maximumItems"?: MaximumItems,
"uniqueItems"?: UniqueItems,
"required"?: Required,
"minimumProperties"?: MinimumProperties,
"maximumProperties"?: MaximumProperties,
}
));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node-reference
export type NodeReference = ((string));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/integer-value
export type IntegerValue = ((number));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/number-value
export type NumberValue = ((number));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/boolean-value
export type BooleanValue = ((boolean));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/string-value
export type StringValue = ((string));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/non-empty-string-value
export type NonEmptyStringValue = ((string));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/amount
export type Amount = ((number));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/$schema
export type Schema = (("https://schema.JsonSchema42.org/jns42-intermediate/schema.json"));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/schemas
export type Schemas = ((
{
[key: string]: SchemasAdditionalProperties,
}
));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/title
export type Title = (NonEmptyStringValue);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/description
export type Description = (NonEmptyStringValue);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/examples
export type Examples = (((ExamplesItems)[]));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/deprecated
export type Deprecated = (BooleanValue);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/types
/**
What types does this schema describe
*/
export type Types = (((TypesItems)[]));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/reference
export type Reference = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/oneOf
export type OneOf = (((OneOfItems)[]));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/anyOf
export type AnyOf = (((AnyOfItems)[]));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/allOf
export type AllOf = (((AllOfItems)[]));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/if
export type If = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/then
export type Then = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/else
export type Else = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/not
export type Not = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/dependentSchemas
export type DependentSchemas = ((
{
[key: string]: DependentSchemasAdditionalProperties,
}
));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/objectProperties
export type ObjectProperties = ((
{
[key: string]: ObjectPropertiesAdditionalProperties,
}
));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/mapProperties
export type MapProperties = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/patternProperties
export type PatternProperties = ((
{
[key: string]: PatternPropertiesAdditionalProperties,
}
));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/propertyNames
export type PropertyNames = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/tupleItems
export type TupleItems = (((TupleItemsItems)[]));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/arrayItems
export type ArrayItems = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/contains
export type Contains = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/options
export type Options = (((OptionsItems)[]));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumInclusive
export type MinimumInclusive = (NumberValue);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumExclusive
export type MinimumExclusive = (NumberValue);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumInclusive
export type MaximumInclusive = (NumberValue);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumExclusive
export type MaximumExclusive = (NumberValue);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/multipleOf
export type MultipleOf = (NumberValue);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumLength
export type MinimumLength = (Amount);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumLength
export type MaximumLength = (Amount);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/valuePattern
export type ValuePattern = (NonEmptyStringValue);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/valueFormat
export type ValueFormat = (NonEmptyStringValue);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumItems
export type MinimumItems = (Amount);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumItems
export type MaximumItems = (Amount);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/uniqueItems
export type UniqueItems = ((boolean));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/required
export type Required = (((RequiredItems)[]));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/minimumProperties
export type MinimumProperties = (Amount);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/maximumProperties
export type MaximumProperties = (Amount);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/properties/schemas/additionalProperties
export type SchemasAdditionalProperties = (Node);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/examples/items
export type ExamplesItems = ((any));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/types/items
export type TypesItems = (("never" |
"any" |
"null" |
"boolean" |
"integer" |
"number" |
"string" |
"array" |
"map"));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/oneOf/items
export type OneOfItems = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/anyOf/items
export type AnyOfItems = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/allOf/items
export type AllOfItems = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/dependentSchemas/additionalProperties
export type DependentSchemasAdditionalProperties = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/objectProperties/additionalProperties
export type ObjectPropertiesAdditionalProperties = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/patternProperties/additionalProperties
export type PatternPropertiesAdditionalProperties = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/tupleItems/items
export type TupleItemsItems = (NodeReference);
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/options/items
export type OptionsItems = ((any));
// https://schema.jsonschema42.org/jns42-intermediate/schema.json#/$defs/node/properties/required/items
export type RequiredItems = (StringValue);
