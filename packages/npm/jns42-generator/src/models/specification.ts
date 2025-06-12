import * as core from "@jns42/core";
import assert from "node:assert";
import { toTypeModel, TypeModel } from "./type.js";
import { toValidatorModel, ValidatorModel } from "./validator.js";

export interface Specification {
  typeModels: Map<number, TypeModel>;
  validatorModels: Map<number, ValidatorModel>;
  locationToKeyMap: Map<string, number>;
  names: core.NamesContainer;

  /** @deprecated */
  typesArena: core.SchemaArenaContainer;
  /** @deprecated */
  validatorsArena: core.SchemaArenaContainer;
}

export interface LoadSpecificationConfiguration {
  transformMaximumIterations: number;
  defaultTypeName: string;
}

export function loadSpecification(
  documentContext: core.DocumentContextContainer,
  configuration: LoadSpecificationConfiguration,
): Specification {
  const { transformMaximumIterations, defaultTypeName } = configuration;

  // load the arena

  const typesArena = core.SchemaArenaContainer.fromDocumentContext(documentContext);
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
    const transformers = [] as Transformer[];
    let transformIterations = 0;
    while (validatorsArena.transform(transformers) > 0) {
      transformIterations++;
      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  // transform the typesArena
  {
    const transformers = [
      core.SchemaTransform.Explode,
      core.SchemaTransform.SingleType,
      core.SchemaTransform.ResolveSingleAllOf,
      core.SchemaTransform.ResolveSingleAnyOf,
      core.SchemaTransform.ResolveSingleOneOf,
      core.SchemaTransform.FlattenAllOf,
      core.SchemaTransform.FlattenAnyOf,
      core.SchemaTransform.FlattenOneOf,
      core.SchemaTransform.FlipAllOfOneOf,
      core.SchemaTransform.FlipAnyOfOneOf,
      core.SchemaTransform.InheritAllOf,
      core.SchemaTransform.InheritAnyOf,
      core.SchemaTransform.InheritOneOf,
      core.SchemaTransform.InheritReference,
      core.SchemaTransform.ResolveAllOf,
      core.SchemaTransform.ResolveAnyOf,
      core.SchemaTransform.ResolveNot,
      core.SchemaTransform.ResolveIfThenElse,
      core.SchemaTransform.ResolveSingleAllOf,
      core.SchemaTransform.ResolveSingleAnyOf,
      core.SchemaTransform.ResolveSingleOneOf,
      core.SchemaTransform.Unalias,
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
    const transformers = [core.SchemaTransform.Name];
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

  const namesBuilder = new core.NamesBuilderContainer();
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
    typeModels,
    validatorModels,
    locationToKeyMap,
    typesArena,
    validatorsArena,
    names,
  };
}
