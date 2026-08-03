import * as core from "@jns42/core";
import assert from "node:assert";
import { toTypeModel, TypeModel } from "./type.js";
import { toValidatorModel, ValidatorModel } from "./validator.js";

export interface Specification {
  locationToKeyMap: Map<string, number>;
  names: core.naming.Names;
  typeModels: Map<number, TypeModel>;
  validatorModels: Map<number, ValidatorModel>;
  isMockable: (key: number) => boolean;
}

export interface LoadSpecificationConfiguration {
  transformMaximumIterations: number;
  defaultTypeName: string;
}

export function loadSpecification(
  documentContext: core.documents.DocumentContext,
  configuration: LoadSpecificationConfiguration,
): Specification {
  const { transformMaximumIterations, defaultTypeName } = configuration;

  // load the arena

  const typesArena = documentContext.makeSchemaArena();
  const validatorsArena = typesArena.clone();

  // generate locationLookup
  const locationToKeyMap = new Map<string, number>();
  for (let key = 0; key < typesArena.count(); key++) {
    const item = typesArena.getItem(key);
    assert(item.location != null);

    locationToKeyMap.set(item.location, key);
  }

  // generate root keys
  const explicitTypeKeys = documentContext.getExplicitLocations().map((location) => {
    const key = locationToKeyMap.get(location);
    assert(key != null);
    return key;
  });

  // transform the validatorsArena
  {
    const transformers = [] as core.models.SchemaTransform[];
    let transformIterations = 0;
    while (validatorsArena.transform(transformers) > 0) {
      transformIterations++;
      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  // transform the typesArena (note that we are not transforming the validatorsArena!)
  {
    const transformers: core.models.SchemaTransform[] = [
      "guess-types",
      "explode",
      "single-type",
      "resolve-single-all-of",
      "resolve-single-any-of",
      "resolve-single-one-of",
      "flatten-all-of",
      "flatten-any-of",
      "flatten-one-of",
      "flip-all-of-one-of",
      "flip-any-of-one-of",
      "inherit-all-of",
      "inherit-any-of",
      "inherit-one-of",
      "inherit-reference",
      "resolve-all-of",
      "resolve-any-of",
      "resolve-not",
      "resolve-if-then-else",
      "resolve-single-all-of",
      "resolve-single-any-of",
      "resolve-single-one-of",
      "unalias",
    ];
    let transformIterations = 0;
    while (typesArena.transform(transformers) > 0) {
      transformIterations++;

      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  // generate names
  {
    const transformers: core.models.SchemaTransform[] = ["name"];
    let transformIterations = 0;
    while (typesArena.transform(transformers) > 0) {
      transformIterations++;

      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  const primaryTypeKeys = new Set(
    explicitTypeKeys.flatMap((key) => [...typesArena.getAllRelated(key)]),
  );

  const namesBuilder = new core.naming.NamesBuilder();
  namesBuilder.setDefaultName(defaultTypeName);

  for (const key of primaryTypeKeys) {
    const item = typesArena.getItem(key);

    if (item.name == null) {
      continue;
    }

    const filteredParts = item.name.filter((part) => /^[a-zA-Z]/.test(part));
    namesBuilder.add(key, filteredParts);
  }

  const names = namesBuilder.build();

  const typeModels = new Map<number, TypeModel>();
  for (let key = 0; key < typesArena.count(); key++) {
    const model = toTypeModel(typesArena, key);
    typeModels.set(key, model);
  }

  const validatorModels = new Map<number, ValidatorModel>();
  for (let key = 0; key < validatorsArena.count(); key++) {
    const model = toValidatorModel(validatorsArena, key);
    validatorModels.set(key, model);
  }

  return {
    locationToKeyMap,
    names,
    typeModels,
    validatorModels,
    isMockable,
  };

  function isMockable(key: number) {
    const item = typeModels.get(key);
    assert(item != null);

    // the counter keeps track of of this item is unknown or not. If the counter is 0
    // then the item has no meaningful mockable elements (often only validation).
    let mockableCounter = 0;

    // we can only mock exact items
    if (!(item.exact ?? false)) {
      return false;
    }

    switch (item.type) {
      case "unknown":
      case "never":
      case "any":
        return false;

      case "null":
        return true;

      case "boolean":
        return true;

      case "integer":
        return true;

      case "number":
        return true;

      case "string":
        // one day we might support some formats
        if (item.valueFormat != null) {
          return false;
        }

        // anything with a regex cannot be mocked
        if (item.valuePattern != null) {
          return false;
        }

        return true;

      case "array": {
        // we might support this one day
        if (item.uniqueItems != null) {
          return false;
        }

        if (item.arrayItems != null) {
          if (!isMockable(item.arrayItems)) {
            return false;
          }
        }

        if (item.contains != null) {
          return false;
        }

        return true;
      }

      case "object":
        if (item.mapProperties != null) {
          // we should not increase the mockableCounter for these kinds of
          // fields as they are not making the item more mockable
          if (!isMockable(item.mapProperties)) {
            return false;
          }
        }

        if (item.propertyNames != null) {
          if (!isMockable(item.propertyNames)) {
            return false;
          }
        }

        // anything with a regex cannot be mocked
        if (item.patternProperties != null && Object.keys(item.patternProperties).length > 0) {
          return false;
        }

        if (item.objectProperties != null && Object.keys(item.objectProperties).length > 0) {
          const required = new Set(item.required);
          if (
            !Object.entries(item.objectProperties as Record<string, number>)
              .filter(([name, key]) => required.has(name))
              .every(([name, key]) => isMockable(key))
          ) {
            return false;
          }
        }

        // if (item.dependentSchemas != null && Object.keys(item.dependentSchemas).length > 0) {
        //   return false;
        // }

        return true;

      case "union":
        if (!item.members.some((key) => isMockable(key))) {
          return false;
        }
        return true;

      case "reference":
        if (!isMockable(item.reference)) {
          return false;
        }
        return true;
    }
  }
}
