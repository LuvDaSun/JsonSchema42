# jns42-generator, TypeScript edition

Generate types from a JsonSchema document.

## debugging

So we assume that allOf oneOf can be the same as oneOf allOf. Here are some examples:

so

```yaml
- allOf:
    - 1
    - 2
    - 3
- type: object
- oneOf:
    - 100
    - 200
- oneOf:
    - 300
    - 400
```

equals

```yaml
- oneOf:
    - 2
    - 3
    - 4
    - 5
- type: object
- allOf:
    - 1
    - 100
    - 300
- allOf:
    - 1
    - 100
    - 400
- allOf:
    - 1
    - 200
    - 300
- allOf:
    - 1
    - 200
    - 400
```

We could change the applyTransform method of the arena so it is able to update many items. Transformers would be generators what emit items with their keys as tuples. If nothing is generated, then that means there is no change.

If we put all the items in a dictionary (so not really an arena anymore) we could make this pattern interesting. We could also make the transform generate new immutable data structures. That might be nice for the rust version.

We should watch out with immutable structures for the transformer, we do always want to read the latest version of an item. This should be considered when implementing something like this.
