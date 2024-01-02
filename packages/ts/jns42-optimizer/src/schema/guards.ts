import { SchemaModel, SchemaModelType } from "./model.js";

export function isSingleType(
  model: SchemaModel,
): model is SchemaModel & { types: [SchemaModelType] } {
  return model.types != null && model.types.length === 1;
}

export function isOneOf(model: SchemaModel): model is SchemaModel & { oneOf: SchemaModelType[] } {
  return model.oneOf != null && model.allOf == null && model.anyOf == null;
}
