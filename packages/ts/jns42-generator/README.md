# jns42-generator, TypeScript edition

Generate types from a JsonSchema document.

## Mapping

Mapping between the intermediate model and TypeScript types.

### Compounds

Compounds are combinations of types. They may appear on any schema.

#### Type

If a schema has compound types then the containing type is merged with the compound types via intersection (`&`). It is possible that there are many

Example:

```typescript
type ContainingType = unknown;
type CompoundType1 = Type1 | Type2;
type CompoundType2 = Type3 & Type4;
type Type = ContainingType & CompoundType1 & CompoundType2;
```

These are the compound types:

- reference
- oneOf
- anyOf
- allOf
- ifThenElse
- not

The `reference` compound refers to a schema that is then merge via intersection. Example:

```typescript
type Type = ContainingType & ReferenceType;
```

The `oneOf` compound is a one to one match with TypeScript's union merge. Example:

```typescript
type Type = OneOf1 | OneOf2;
```

In a `anyOf` compound, one or more types should be valid. We can achieve this by figuring out all possible combinations (https://stackoverflow.com/questions/64414816/can-you-return-n-choose-k-combinations-in-javascript-using-array-flatmap/64414875#64414875) and then merging those combinations via an intersection and then merging the result via a union.

Example

```typescript
type Type =
  | AnyOf1
  | AnyOf2
  | AnyOf3
  | (AnyOf1 & AnyOf2)
  | (AnyOf1 & AnyOf3)
  | (AnyOf2 & AnyOf3)
  | (AnyOf1 & AnyOf2 & AnyOf3);
```

The `allOf` compound is the same as a TypeScript intersection merge. Example:

```typescript
type Type = AllOf1 & AllOf2;
```

The `ifThenElse` compound is represented in TypeScript as an intersection join between `if` and `then` and then a union join with the `else` type. Example

```typescript
type Type = ThenType | ElseType;
```

If the `if` schema is valid then we want to validate the `then` schema. If the `if` schema is not valid, then we want the `else` schema.

The `not` compound will only affect validation.

#### Validation

Validation is always done on the containing type, but, in addition any compound needs to be valid as well.

Validating the `reference` compound means simply validating the schema it points to.

When we want to validate `oneOf` then we need to walk through every type and see if it is valid. If one type is valid, then we continue and expect all other types top be invalid. In a `oneOf` exactly one type must be valid, not 0, not 2, not 10.

In case we validate `anyOf` we simply walk all types and if one is valid, the compound is valid. There might be more valid types, but we need at least one to be valid.

Validating `ifThenElse` can be done by first validating the against the `if` schema, if that is valid, we validate the `then` schema and that is the result of the compound validation. If the `if` schema is not valid, then we validate the `else` schema and then that is the result of the validation.

When validating the `not` schema we simply invert the result if the validation of the `not` schema.

### Map

The intermediate document's type `map` (object in JsonSchema) may be mapped to a TypeScript interface. It is possible that the interface has an index signature.

#### Type

Properties that influence what the interface looks like are:

- `required`
- `patternProperties`
- `mapProperties`
- `objectProperties`

Interfaces can be created with an index signature example:

```typescript
interface ExampleWithIndex {
  [key: ExampleKey]:
    | ExampleMapProperty
    | ExamplePatternProperty
    | ExampleOtherPatternProperty;
}
```

This is the case if `mapProperties` or `patternProperties` is set. If both are set, or multiple `patternProperties` are specified, then the types they represent are joined via union (`|`).

Interfaces may also be created without the index signature. Example:

```typescript
interface ExampleNoIndex {
  id: ExampleId;
  name?: ExampleName;
}
```

In this case the `required` property will be used to make a property optional.

And then there is a case where an interface will have an index signature and normal properties. This happens if `mapProperties` or `patternProperties` is set and `objectProperties` is also set.

Example:

```typescript
interface ExampleBoth {
  [key: ExampleKey]:
    | ExampleId
    | ExampleName
    | ExampleMapProperty
    | ExamplePatternProperty
    | ExampleOtherPatternProperty;
  id: ExampleId;
  name?: ExampleName;
}
```

Something special is happening here, all normal properties are added to the union of the index type. This is necessary to make the interface work in TypeScript, see https://www.typescriptlang.org/docs/handbook/2/objects.html#index-signatures.

#### Validation

Validation of `map` types is influences by the following properties:

- `required`
- `minimumProperties`
- `maximumProperties`
- `objectProperties`
- `patternProperties`
- `propertyNames`
- `mapProperties`

The properties defined in `required` must not be `undefined` for the validation to succeed. Properties are counted and if they are less than `minimumProperties` or more than `maximumProperties` validation fails.

If a property name is in the key of the `objectProperties` map then the property value is validated by the schema that is the value of the `objectProperties` map.

If a property name is not in the key of `objectProperties` then the property name is matched against the regular expressions in the keys of `patternProperties`, if there is a match the property value is matched with the schema in the corresponding property value.

If property name is not in `objectProperties` and does not match a key of `patternProperties` then the property name is validated via the schema provided by `propertyNames`. All property names need to be valid for the validation to succeed. Also the values of these properties are all validated via the schema in `mapProperties`.

### Array

The `array` type may be rendered in TypeScript as a tuple or an array/.

#### Types

_TODO_

#### Validation

_TODO_
