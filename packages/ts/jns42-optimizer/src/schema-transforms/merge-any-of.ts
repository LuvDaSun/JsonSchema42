import assert from "assert";
import {
  SchemaModel,
  SchemaTransform,
  isAnyOfSchemaModel,
  isSingleTypeSchemaModel,
} from "../schema/index.js";
import { intersectionMerge, mergeKeysArray, mergeKeysRecord } from "../utils/index.js";

export const mergeAnyOf: SchemaTransform = (arena, model, modelKey) => {
  if (!isAnyOfSchemaModel(model) || model.anyOf.length < 2) {
    return model;
  }

  const { id } = model;

  const oneOfElements = new Array<number>();

  const groupedElements: { [type: string]: number[] } = {};
  for (const elementKey of model.anyOf) {
    const [, elementModel] = arena.resolveItem(elementKey);

    if (!isSingleTypeSchemaModel(elementModel)) {
      return model;
    }

    groupedElements[elementModel.types[0]] ??= [];
    groupedElements[elementModel.types[0]].push(elementKey);
  }

  for (const [type, subKeys] of Object.entries(groupedElements)) {
    if (subKeys.length < 2) {
      for (const subKey of subKeys) {
        oneOfElements.push(subKey);
      }
      continue;
    }

    let newModel!: SchemaModel;
    for (const subKey of subKeys) {
      const [, subModel] = arena.resolveItem(subKey);

      // this will never happen because of the isSingleType guard earlier
      assert(isSingleTypeSchemaModel(subModel));

      // first pass
      if (newModel == null) {
        newModel = { ...subModel };
        continue;
      }

      newModel.options = intersectionMerge(newModel.options, subModel.options);
      newModel.required = intersectionMerge(newModel.required, subModel.required);
      newModel.propertyNames = mergeKey(newModel.propertyNames, subModel.propertyNames);
      newModel.contains = mergeKey(newModel.contains, subModel.contains);
      newModel.tupleItems = mergeKeysArray(newModel.tupleItems, subModel.tupleItems, mergeKey);
      newModel.arrayItems = mergeKey(newModel.arrayItems, subModel.arrayItems);
      newModel.objectProperties = mergeKeysRecord(
        newModel.objectProperties,
        subModel.objectProperties,
        mergeKey,
      );
      newModel.mapProperties = mergeKey(newModel.mapProperties, subModel.mapProperties);
    }

    const newKey = arena.addItem(newModel);
    oneOfElements.push(newKey);
  }

  return {
    id,
    oneOf: oneOfElements,
  };

  function mergeKey(key: number | undefined, otherKey: number | undefined): number | undefined {
    if (key === otherKey) {
      return key;
    }

    if (key == null) {
      return otherKey;
    }
    if (otherKey == null) {
      return key;
    }

    const newModel = {
      anyOf: [key, otherKey],
    };
    const newKey = arena.addItem(newModel);
    return newKey;
  }
};
