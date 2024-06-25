import * as core from "@jns42/core";
import assert from "assert";

export type Names = Record<number, { primary: boolean; name: core.Sentence }>;

export interface Specification {
  typesArena: core.SchemaArenaContainer;
  validatorsArena: core.SchemaArenaContainer;
  names: Names;
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

  const primaryNamesBuilder = new core.NamesBuilderContainer();
  primaryNamesBuilder.setDefaultName(defaultTypeName);

  const secondaryNamesBuilder = new core.NamesBuilderContainer();
  secondaryNamesBuilder.setDefaultName(defaultTypeName);

  for (let key = 0; key < typesArena.count(); key++) {
    const parts = typesArena.getNameParts(key);
    const filteredParts = parts.filter((part) => /^[a-zA-Z]/.test(part));

    if (primaryTypeKeys.has(key)) {
      primaryNamesBuilder.add(key, filteredParts);
    } else {
      secondaryNamesBuilder.add(key, filteredParts);
    }
  }

  const primaryNames = primaryNamesBuilder.build();
  const secondaryNames = secondaryNamesBuilder.build();

  const names: Names = {};
  for (let key = 0; key < typesArena.count(); key++) {
    if (primaryTypeKeys.has(key)) {
      const name = primaryNames.getName(key);
      assert(name != null);
      names[key] = { primary: true, name };
    } else {
      const name = secondaryNames.getName(key);
      assert(name != null);
      names[key] = { primary: false, name };
    }
  }

  return {
    typesArena,
    validatorsArena,
    names,
  };
}
