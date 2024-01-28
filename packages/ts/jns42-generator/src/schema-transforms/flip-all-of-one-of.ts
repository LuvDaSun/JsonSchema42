import {
  AllOfSchemaModel,
  OneOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  isAllOfSchemaModel,
  isOneOfSchemaModel,
  isSingleTypeSchemaModel,
} from "../schema/index.js";

/**
 * Flips oneOf and allOf types. If an allOf has a oneOf in it, this transform
 * will flip em! It will become a oneOf with an allOf in it.
 *
 * We can generate code for a oneOf with some allOfs in it, but for an allOf with
 * a bunch of oneOfs, we cannot generate code.
 */
export const flipAllOfOneOf: SchemaTransform = (arena, model, modelKey) => {
  // we need at least two to merge
  if (!isAllOfSchemaModel(model) || model.allOf.length < 2) {
    return model;
  }

  const newModel: SchemaModel & OneOfSchemaModel = { ...model, oneOf: [], allOf: undefined };

  const baseElementEntries = model.allOf
    .map((element) => [element, arena.resolveItem(element)] as const)
    .filter(([element, [, item]]) => isOneOfSchemaModel(item))
    .map(([element, [, item]]) => [element, item as OneOfSchemaModel] as const);
  const leafElements = baseElementEntries.flatMap(([key, item]) => item.oneOf);
  if (leafElements.length < 2) {
    return model;
  }

  const baseElementSet = new Set(baseElementEntries.map(([key, item]) => key));

  for (const leafElement of leafElements) {
    const [, leafModel] = arena.resolveItem(leafElement);
    if (!isSingleTypeSchemaModel(leafModel)) {
      return model;
    }
  }

  for (const leafElement of leafElements) {
    const newLeafElements = [...model.allOf, leafElement].filter((key) => !baseElementSet.has(key));
    const newLeafModel: AllOfSchemaModel = {
      mockable: model.mockable,
      allOf: newLeafElements,
    };
    const newLeafKey = arena.addItem(newLeafModel);
    newModel.oneOf.push(newLeafKey);
  }

  return newModel;
};
