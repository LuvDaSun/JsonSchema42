# jns42-optimizer

Optimize json schema types into TypeScript types.

## `anyOf`

The weirdeset type in JsonSchema is the `anyOf` type. This type needs one of it's elements to be valid to be valid, just like the oneOf type. But more elements also may be valid, and this is kind of similar to the allOf type.

`anyOf` can be presented as a `oneOf` and a few `allOf`'s. this is how:

```yaml
4:
  type: anyOf
  elements:
    - 1
    - 2
    - 3
```

Can be optimized into

```yaml
4:
  type: oneOf
  elements:
    - 1
    - 2
    - 3
    - 5
    - 6
    - 7
    - 8
5:
  type: allOf
  elements:
    - 1
    - 2
6:
  type: allOf
  elements:
    - 1
    - 3
7:
  type: allOf
  elements:
    - 2
    - 3
8:
  type: allOf
  elements:
    - 1
    - 2
    - 3
```

This, however can lead to a lot of items in the arena, we want to optimize this at some point.

Also this method will result is a `oneOf` with many `anyOf` elements. This may be correct but this is no how the `anyOf` is used most of the time.

A better solution would be to first group the elements by type, that will be a `oneOf` type. This is so because a value can never be two types at the same time.

Then, complex types are merged as `anyOf` types of their elements. In case of an object then only if both properties are required then the merged property is required.
