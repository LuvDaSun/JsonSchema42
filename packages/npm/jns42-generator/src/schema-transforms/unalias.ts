import { SchemaTransform } from "../models/index.js";
import { deepEqual } from "../utils/index.js";

export const unalias: SchemaTransform = (arena, model, modelKey) => {
  let newModel = model;

  if (model.reference != null) {
    newModel = { ...newModel, reference: arena.resolveItem(model.reference)[0] };
  }

  if (model.if != null) {
    newModel = { ...newModel, if: arena.resolveItem(model.if)[0] };
  }

  if (model.then != null) {
    newModel = { ...newModel, then: arena.resolveItem(model.then)[0] };
  }

  if (model.else != null) {
    newModel = { ...newModel, else: arena.resolveItem(model.else)[0] };
  }

  if (model.not != null) {
    newModel = { ...newModel, not: arena.resolveItem(model.not)[0] };
  }

  if (model.mapProperties != null) {
    newModel = { ...newModel, mapProperties: arena.resolveItem(model.mapProperties)[0] };
  }

  if (model.propertyNames != null) {
    newModel = { ...newModel, propertyNames: arena.resolveItem(model.propertyNames)[0] };
  }

  if (model.arrayItems != null) {
    newModel = { ...newModel, arrayItems: arena.resolveItem(model.arrayItems)[0] };
  }

  if (model.contains != null) {
    newModel = { ...newModel, contains: arena.resolveItem(model.contains)[0] };
  }

  if (model.allOf != null) {
    newModel = { ...newModel, allOf: model.allOf.map((key) => arena.resolveItem(key)[0]) };
  }

  if (model.anyOf != null) {
    newModel = { ...newModel, anyOf: model.anyOf.map((key) => arena.resolveItem(key)[0]) };
  }

  if (model.oneOf != null) {
    newModel = { ...newModel, oneOf: model.oneOf.map((key) => arena.resolveItem(key)[0]) };
  }

  if (model.tupleItems != null) {
    newModel = {
      ...newModel,
      tupleItems: model.tupleItems.map((key) => arena.resolveItem(key)[0]),
    };
  }

  if (model.dependentSchemas != null) {
    newModel = {
      ...newModel,
      dependentSchemas: Object.fromEntries(
        Object.entries(model.dependentSchemas).map(([name, key]) => [
          name,
          arena.resolveItem(key)[0],
        ]),
      ),
    };
  }

  if (model.objectProperties != null) {
    newModel = {
      ...newModel,
      objectProperties: Object.fromEntries(
        Object.entries(model.objectProperties).map(([name, key]) => [
          name,
          arena.resolveItem(key)[0],
        ]),
      ),
    };
  }

  if (model.patternProperties != null) {
    newModel = {
      ...newModel,
      patternProperties: Object.fromEntries(
        Object.entries(model.patternProperties).map(([name, key]) => [
          name,
          arena.resolveItem(key)[0],
        ]),
      ),
    };
  }

  if (deepEqual(model, newModel)) {
    return model;
  }

  return newModel;
};
