import {
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isAnyOfSchemaModel,
} from "../schema/index.js";
import { choose } from "../utils/index.js";

/*
this is the correct implementation of anyof, it may yield an incredible amount of code.
*/
export const resolveAnyOfChoose: SchemaTransform = (arena, model, modelKey) => {
  if (!isAnyOfSchemaModel(model) || model.anyOf.length < 2) {
    return model;
  }

  const newModel: SchemaModel & OneOfSchemaModel = {
    ...model,
    oneOf: [],
    anyOf: undefined,
  };

  for (let count = 0; count < model.anyOf.length; count++) {
    for (const elements of choose(model.anyOf, count + 1)) {
      const newSubModel = {
        allOf: elements,
      };
      const newSubKey = arena.addItem(newSubModel);
      newModel.oneOf.push(newSubKey);
    }
  }

  return newModel;
};
