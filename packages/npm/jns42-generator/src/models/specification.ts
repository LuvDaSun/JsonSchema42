import * as core from "@jns42/core";

export interface Specification {
  typesArena: core.SchemaArenaContainer;
  validatorsArena: core.SchemaArenaContainer;
  names: core.NamesContainer;
  [Symbol.dispose]: () => void;
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

  // generate names

  const namesBuilder = new core.NamesBuilderContainer();
  namesBuilder.setDefaultName(defaultTypeName);

  const count = typesArena.count();
  for (let key = 0; key < count; key++) {
    const parts = typesArena.getNameParts(key);
    const path = parts.filter((part) => /^[a-zA-Z]/.test(part));

    namesBuilder.add(key, path);
  }

  const names = namesBuilder.build();

  // transform the validatorsArena
  {
    using transformers = core.VecUsize.fromArray([]);
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
    using transformers = core.VecUsize.fromArray([
      core.SchemaTransform.explode,
      core.SchemaTransform.singleType,
      core.SchemaTransform.resolveSingleAllOf,
      core.SchemaTransform.resolveSingleAnyOf,
      core.SchemaTransform.resolveSingleOneOf,
      core.SchemaTransform.flattenAllOf,
      core.SchemaTransform.flattenAnyOf,
      core.SchemaTransform.flattenOneOf,
      core.SchemaTransform.flipAllOfOneOf,
      core.SchemaTransform.flipAnyOfOneOf,
      core.SchemaTransform.inheritAllOf,
      core.SchemaTransform.inheritAnyOf,
      core.SchemaTransform.inheritOneOf,
      core.SchemaTransform.inheritReference,
      core.SchemaTransform.resolveAllOf,
      core.SchemaTransform.resolveAnyOf,
      core.SchemaTransform.resolveNot,
      core.SchemaTransform.resolveIfThenElse,
      core.SchemaTransform.resolveSingleAllOf,
      core.SchemaTransform.resolveSingleAnyOf,
      core.SchemaTransform.resolveSingleOneOf,
      core.SchemaTransform.unalias,
    ]);
    let transformIterations = 0;
    while (typesArena.transform(transformers) > 0) {
      transformIterations++;

      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  return {
    typesArena,
    validatorsArena,
    names,
    [Symbol.dispose]() {
      typesArena[Symbol.dispose]();
      validatorsArena[Symbol.dispose]();
      names[Symbol.dispose]();
    },
  };
}
