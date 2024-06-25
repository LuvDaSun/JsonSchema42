import * as core from "@jns42/core";

export interface Specification {
  typesArena: core.SchemaArenaContainer;
  validatorsArena: core.SchemaArenaContainer;
  names: core.NamesContainer;
}

export interface LoadSpecificationConfiguration {
  transformMaximumIterations: number;
  defaultTypeName: string;
}

export function loadSpecification(
  documentContext: core.DocumentContextContainer,
  rootLocations: Set<string>,
  configuration: LoadSpecificationConfiguration,
): Specification {
  const { transformMaximumIterations, defaultTypeName } = configuration;

  // load the arena

  const typesArena = core.SchemaArenaContainer.fromDocumentContext(documentContext);
  const validatorsArena = typesArena.clone();

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

  const rootKeys = [];
  for (let key = 0; key < typesArena.count(); key++) {
    const item = typesArena.getItem(key);
    if (item.location == null) {
      continue;
    }
    if (!rootLocations.has(item.location)) {
      continue;
    }

    rootKeys.push(key);
  }

  const primaryTypeKeys = new Set(rootKeys.flatMap((key) => [...typesArena.getAllRelated(key)]));

  const namesBuilder = new core.NamesBuilderContainer();
  namesBuilder.setDefaultName(defaultTypeName);

  for (let key = 0; key < typesArena.count(); key++) {
    if (!primaryTypeKeys.has(key)) {
      continue;
    }

    const parts = typesArena.getNameParts(key);
    const filteredParts = parts.filter((part) => /^[a-zA-Z]/.test(part));

    namesBuilder.add(key, filteredParts);
  }

  const names = namesBuilder.build();

  return {
    typesArena,
    validatorsArena,
    names,
  };
}
