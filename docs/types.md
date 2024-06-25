# Types

We generate types from the schema. There are two type of types, primary and secondary types.

- If a type is a primary type then all types that are referenced by that type are also primary types.
- The type that is generated from the root of the schema is a primary type.
- Definitions that are defined in a schema are also considered referenced types.

Primary types are types that are likely to be used, secondary types are probably never used. Those secondary types are only there because they have a location. So in theory they could be referenced. That's why we don't want to throw them away, but then again we don't want them to clutter our library. That is why we categorize them as primary and secondary!

Types may turn secondary after a transformation. Here is an example:

```yaml
1:
  type: string
2:
  type: string
3:
  allOf:
    - 1
    - 2
```

3 is the root schema, which is always primary, 1 and 2 are primary because they are referenced by a primary type.

Transforms into

```yaml
1:
  type: string
2:
  type: string
3:
  type: string
```

3 is still the root schema, so primary. But 1 and 2 are not referenced by it anymore, so secondary.
