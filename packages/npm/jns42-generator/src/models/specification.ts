import * as core from "@jns42/core";
import * as schemaIntermediate from "@jns42/schema-intermediate";

export interface Specification {
  typesArena: core.SchemaArena;
  validatorsArena: core.SchemaArena;
  names: core.Names;
  [Symbol.dispose]: () => void;
}

export interface LoadSpecificationConfiguration {
  transformMaximumIterations: number;
  defaultTypeName: string;
}

export function loadSpecification(
  document: schemaIntermediate.SchemaJson,
  configuration: LoadSpecificationConfiguration,
): Specification {
  const { transformMaximumIterations, defaultTypeName } = configuration;

  // load the arena

  const typesArena = core.SchemaArena.fromIntermediate(document);
  const validatorsArena = typesArena.clone();

  // generate names

  using namesBuilder = core.NamesBuilder.new();
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
    // console.log(
    //   Object.fromEntries(
    //     [...typesArena].map(normalizeObject).map((value, key) => [key, value] as const),
    //   ),
    // );
    // debugger;

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

      // console.log(
      //   Object.fromEntries(
      //     [...typesArena].map(normalizeObject).map((value, key) => [key, value] as const),
      //   ),
      // );
      // debugger;

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
