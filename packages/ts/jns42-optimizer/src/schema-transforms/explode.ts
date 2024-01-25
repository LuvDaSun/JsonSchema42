import {
  AllOfSchemaModel,
  SchemaModel,
  SchemaTransform,
  allOfSchemaRequired,
  anyOfSchemaRequired,
  ifSchemaOptional,
  ifSchemaRequired,
  isAliasSchemaModel,
  oneOfSchemaRequired,
  referenceSchemaRequired,
  typeSchemaOptional,
} from "../schema/index.js";

/**
 * Turns the model into a single all-of with various
 * sub compound models in it.
 * This is useful for the rare case in which a schema defines different compounds on a single
 * schema node. So if a schema has an allOf *and* a oneOf. This edge case is handled buy
 * exploding the schema into a schema of allOf with all of the compounds in it.
 *
 * this
 * ```yaml
 * - reference: 10
 * - allOf
 *   - 100
 *   - 200
 * - anyOf
 *   - 300
 *   - 400
 * - oneOf
 *   - 500
 *   - 600
 * - if: 700
 *   then: 800
 *   else: 900
 * ```
 *
 * will become
 * ```yaml
 * - allOf
 *   - 1
 *   - 2
 *   - 3
 *   - 4
 * - parent: 0
 *   reference: 10
 * - allOf
 *   parent: 0
 *   allOf
 *   - 100
 *   - 200
 * - parent: 0
 *   anyOf
 *   - 300
 *   - 400
 * - parent: 0
 *   oneOf
 *   - 500
 *   - 600
 * - parent: 0
 *   if: 700
 *   then: 800
 *   else: 900
 *
 * ```
 *
 */
export const explode: SchemaTransform = (arena, model, modelKey) => {
  if (isAliasSchemaModel(model)) {
    return model;
  }

  const propertyGroups = {
    reference: referenceSchemaRequired,
    allOf: allOfSchemaRequired,
    anyOf: anyOfSchemaRequired,
    oneOf: oneOfSchemaRequired,
    if: [...ifSchemaRequired, ...ifSchemaOptional],
    // not: notSchemaRequired,
    type: typeSchemaOptional,
  };

  const schemaModels = Object.fromEntries(
    Object.entries(propertyGroups).map(([key, properties]) => [
      key,
      properties.some((property) => model[property] != null),
    ]),
  ) as Record<keyof typeof propertyGroups, boolean>;

  let count = Object.values(schemaModels).filter((value) => value).length;

  if (count <= 1) {
    // nothing to explode here
    return model;
  }

  const newModel: SchemaModel & AllOfSchemaModel = {
    ...model,
    reference: undefined,
    allOf: [],
    anyOf: undefined,
    oneOf: undefined,
    if: undefined,
    then: undefined,
    else: undefined,
    // not: undefined,

    types: undefined,
    dependentSchemas: undefined,
    objectProperties: undefined,
    mapProperties: undefined,
    patternProperties: undefined,
    propertyNames: undefined,
    tupleItems: undefined,
    arrayItems: undefined,
    contains: undefined,
    required: undefined,
    options: undefined,

    minimumInclusive: undefined,
    minimumExclusive: undefined,
    maximumInclusive: undefined,
    maximumExclusive: undefined,
    multipleOf: undefined,
    minimumLength: undefined,
    maximumLength: undefined,
    valuePattern: undefined,
    valueFormat: undefined,
    minimumItems: undefined,
    maximumItems: undefined,
    uniqueItems: undefined,
    minimumProperties: undefined,
    maximumProperties: undefined,
  };

  if (schemaModels.reference) {
    const newSubModel: SchemaModel = {
      mockable: model.mockable,
      reference: model.reference,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

  if (schemaModels.allOf) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      mockable: model.mockable,

      allOf: model.allOf,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

  if (schemaModels.anyOf) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      mockable: model.mockable,

      anyOf: model.anyOf,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

  if (schemaModels.oneOf) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      mockable: model.mockable,

      oneOf: model.oneOf,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

  if (schemaModels.if) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      mockable: model.mockable,

      if: model.if,
      then: model.then,
      else: model.else,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

  // if (schemaModels.not) {
  //   const newSubModel: SchemaModel = {
  //     parent: modelKey,
  //     mockable: model.mockable,

  //     not: model.not,
  //   };
  //   const newSubKey = arena.addItem(newSubModel);
  //   newModel.allOf.push(newSubKey);
  // }

  if (schemaModels.type) {
    const newSubModel: SchemaModel = {
      parent: modelKey,
      mockable: model.mockable,

      types: model.types,
      dependentSchemas: model.dependentSchemas,
      objectProperties: model.objectProperties,
      mapProperties: model.mapProperties,
      patternProperties: model.patternProperties,
      propertyNames: model.propertyNames,
      tupleItems: model.tupleItems,
      arrayItems: model.arrayItems,
      contains: model.contains,
      required: model.required,
      options: model.options,

      minimumInclusive: model.minimumInclusive,
      minimumExclusive: model.minimumExclusive,
      maximumInclusive: model.maximumInclusive,
      maximumExclusive: model.maximumExclusive,
      multipleOf: model.multipleOf,
      minimumLength: model.minimumLength,
      maximumLength: model.maximumLength,
      valuePattern: model.valuePattern,
      valueFormat: model.valueFormat,
      minimumItems: model.minimumItems,
      maximumItems: model.maximumItems,
      uniqueItems: model.uniqueItems,
      minimumProperties: model.minimumProperties,
      maximumProperties: model.maximumProperties,
    };
    const newSubKey = arena.addItem(newSubModel);
    newModel.allOf.push(newSubKey);
  }

  return newModel;
};
