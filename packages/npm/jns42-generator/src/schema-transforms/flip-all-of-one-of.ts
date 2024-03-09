import {
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isAllOfSchemaModel,
  isAnyOfSchemaModel,
  isOneOfSchemaModel,
} from "../models/index.js";
import { product } from "../utils/index.js";

/**
 * Flips oneOf and allOf types. If an allOf has a oneOf in it, this transform
 * will flip em! It will become a oneOf with a few allOfs in it.
 *
 * We can generate code for a oneOf with some allOfs in it, but for an allOf with
 * a bunch of oneOfs, we cannot generate code.
 * 
 * this

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

will become

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
 */
export const flipAllOfOneOf: SchemaTransform = (arena, modelKey) => {
  const model = arena.getItem(modelKey);

  // we need at least two to merge
  if (!isAllOfSchemaModel(model) || model.allOf.length < 2) {
    return model;
  }

  // first we resolve all models in allOf
  const allOfModelEntries = model.allOf.map((key) => [key, arena.resolveItem(key)[1]] as const);

  // then we filter in the oneOf-s
  const oneOfModelEntries = allOfModelEntries
    .filter(([key, model]) => isOneOfSchemaModel(model))
    .map((entry) => entry as [number, OneOfSchemaModel]);

  // if no oneOf-s in this allof, then we are done
  if (oneOfModelEntries.length === 0) {
    return model;
  }

  // then we filter out the oneOf-s
  const notOneOfModelEntries = allOfModelEntries.filter(
    ([key, model]) => !isOneOfSchemaModel(model),
  );

  // we will be creating a oneOf model based on the source model.
  const newModel: SchemaModel & OneOfSchemaModel = { ...model, oneOf: [], allOf: undefined };

  for (const set of product(oneOfModelEntries.map(([key, model]) => model.oneOf))) {
    const newSubModel = {
      parent: modelKey,
      allOf: [...notOneOfModelEntries.map((entry) => entry[0]), ...set],
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.oneOf.push(newSubKey);
  }

  // and return the new model!
  return newModel;
};

export const flipAnyOfOneOf: SchemaTransform = (arena, modelKey) => {
  const model = arena.getItem(modelKey);

  // we need at least two to merge
  if (!isAnyOfSchemaModel(model) || model.anyOf.length < 2) {
    return model;
  }

  // first we resolve any models in anyOf
  const anyOfModelEntries = model.anyOf.map((key) => [key, arena.resolveItem(key)[1]] as const);

  // then we filter in the oneOf-s
  const oneOfModelEntries = anyOfModelEntries
    .filter(([key, model]) => isOneOfSchemaModel(model))
    .map((entry) => entry as [number, OneOfSchemaModel]);

  // if no oneOf-s in this anyof, then we are done
  if (oneOfModelEntries.length === 0) {
    return model;
  }

  // then we filter out the oneOf-s
  const notOneOfModelEntries = anyOfModelEntries.filter(
    ([key, model]) => !isOneOfSchemaModel(model),
  );

  // we will be creating a oneOf model based on the source model.
  const newModel: SchemaModel & OneOfSchemaModel = { ...model, oneOf: [], anyOf: undefined };

  for (const set of product(oneOfModelEntries.map(([key, model]) => model.oneOf))) {
    const newSubModel = {
      parent: modelKey,
      anyOf: [...notOneOfModelEntries.map((entry) => entry[0]), ...set],
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.oneOf.push(newSubKey);
  }

  // and return the new model!
  return newModel;
};
