import {
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isAnyOfSchemaModel,
  isOneOfSchemaModel,
} from "../schema/index.js";
import { product } from "../utils/index.js";

export const flipAnyOfOneOf: SchemaTransform = (arena, model, modelKey) => {
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
