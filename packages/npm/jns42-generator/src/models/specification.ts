import * as core from "@jns42/core";
import { toTypeModel, TypeModel } from "./type.js";
import { toValidatorModel, ValidatorModel } from "./validator.js";

export interface Specification {
  typeModels: Map<number, TypeModel>;
  validatorModels: Map<number, ValidatorModel>;
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

  // generate root keys

  const explicitLocations = new Set(documentContext.getExplicitLocations());
  const explicitTypeKeys = [];
  for (let key = 0; key < typesArena.count(); key++) {
    const item = typesArena.getItem(key);
    if (item.location == null) {
      continue;
    }
    if (!explicitLocations.has(item.location)) {
      continue;
    }

    explicitTypeKeys.push(key);
  }

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
    const item = typesArena.getItem(key);
    const model = toTypeModel(item);
    typeModels.set(key, model);
  }

  const validatorModels = new Map<number, ValidatorModel>();
  for (let key = 0; key < validatorsArena.count(); key++) {
    const item = validatorsArena.getItem(key);
    const model = toValidatorModel(item);
    validatorModels.set(key, model);
  }

  return {
    typeModels,
    validatorModels,
    typesArena,
    validatorsArena,
    names,
  };
}
