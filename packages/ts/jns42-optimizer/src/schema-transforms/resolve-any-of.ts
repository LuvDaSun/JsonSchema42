import assert from "assert";
import {
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isAnyOfSchemaModel,
  isSingleTypeSchemaModel,
} from "../schema/index.js";
import { intersectionMerge, mergeKeysArray, mergeKeysRecord } from "../utils/index.js";

export const resolveAnyOf: SchemaTransform = (arena, model, modelKey) => {
  if (!isAnyOfSchemaModel(model) || model.anyOf.length < 2) {
    return model;
  }

  const { id } = model;

  const newModel: SchemaModel & OneOfSchemaModel = { ...model, oneOf: [], anyOf: undefined };

  // first we group elements by their type
  const groupedElements: { [type: string]: number[] } = {};
  for (const subKey of model.anyOf) {
    const [, subModel] = arena.resolveItem(subKey);

    if (!isSingleTypeSchemaModel(subModel)) {
      // we can only work with single types
      return model;
    }

    groupedElements[subModel.types[0]] ??= [];
    groupedElements[subModel.types[0]].push(subKey);
  }

  // we make a oneOf with every type as it's element
  for (const [type, subKeys] of Object.entries(groupedElements)) {
    if (subKeys.length < 2) {
      for (const subKey of subKeys) {
        newModel.oneOf.push(subKey);
      }
      continue;
    }

    let newSubModel!: SchemaModel;
    for (const subKey of subKeys) {
      const [, subModel] = arena.resolveItem(subKey);

      // this will never happen because of the isSingleType guard earlier
      assert(isSingleTypeSchemaModel(subModel));

      // first pass
      if (newSubModel == null) {
        newSubModel = { ...subModel };
        continue;
      }

      newSubModel.options = intersectionMerge(newSubModel.options, subModel.options);
      newSubModel.required = intersectionMerge(newSubModel.required, subModel.required);
      newSubModel.propertyNames = mergeKey(newSubModel.propertyNames, subModel.propertyNames);
      newSubModel.contains = mergeKey(newSubModel.contains, subModel.contains);
      newSubModel.tupleItems = mergeKeysArray(
        newSubModel.tupleItems,
        subModel.tupleItems,
        mergeKey,
      );
      newSubModel.arrayItems = mergeKey(newSubModel.arrayItems, subModel.arrayItems);
      newSubModel.objectProperties = mergeKeysRecord(
        newSubModel.objectProperties,
        subModel.objectProperties,
        mergeKey,
      );
      newSubModel.mapProperties = mergeKey(newSubModel.mapProperties, subModel.mapProperties);
    }

    const newSubKey = arena.addItem(newSubModel);
    newModel.oneOf.push(newSubKey);
  }

  return newModel;

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
