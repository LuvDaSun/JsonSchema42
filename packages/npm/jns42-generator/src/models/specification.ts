import * as core from "@jns42/core";
import * as schemaIntermediate from "@jns42/schema-intermediate";
import assert from "assert";
import * as schemaTransforms from "../schema-transforms/index.js";
import { NodeLocation } from "../utils/index.js";
import { SchemaArena } from "./arena.js";
import { selectSchemaDependencies } from "./selectors.js";

export interface Specification {
  typesArena: SchemaArena;
  validatorsArena: SchemaArena;
  typesArena2: core.SchemaArena;
  validatorsArena2: core.SchemaArena;
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
  const typesArena = SchemaArena.fromIntermediate(document);
  const validatorsArena = new SchemaArena(typesArena);

  const typesArena2 = core.SchemaArena.fromIntermediate(document);
  const validatorsArena2 = typesArena2.clone();

  // generate names

  using namesBuilder = core.NamesBuilder.new();
  namesBuilder.setDefaultName(defaultTypeName);

  for (const [itemKey, item] of [...typesArena].map((item, key) => [key, item] as const)) {
    const { id: nodeId } = item;

    assert(nodeId != null);

    const nodeLocation = NodeLocation.parse(nodeId);
    const path = [...nodeLocation.path, ...nodeLocation.anchor, ...nodeLocation.pointer].filter(
      (part) => /^[a-zA-Z]/.test(part),
    );

    namesBuilder.add(itemKey, path);
  }

  const names = namesBuilder.build();

  // transform the validatorsArena
  {
    using transformers = core.VecUsize.fromArray([]);
    let transformIterations = 0;
    while (validatorsArena2.transform(transformers) > 0) {
      transformIterations++;
      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  {
    let transformIterations = 0;
    while (validatorsArena.applyTransform() > 0) {
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
    //     [...typesArena2].map(normalizeObject).map((value, key) => [key, value] as const),
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
      core.SchemaTransform.resolveAllOf,
      // core.SchemaTransform.resolveAnyOf,
      core.SchemaTransform.resolveNot,
      core.SchemaTransform.resolveIfThenElse,
      core.SchemaTransform.resolveSingleAllOf,
      core.SchemaTransform.resolveSingleAnyOf,
      core.SchemaTransform.resolveSingleOneOf,
    ]);
    let transformIterations = 0;
    while (typesArena2.transform(transformers) > 0) {
      transformIterations++;

      // console.log(
      //   Object.fromEntries(
      //     [...typesArena2].map(normalizeObject).map((value, key) => [key, value] as const),
      //   ),
      // );
      // debugger;

      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  {
    // console.log(
    //   Object.fromEntries(
    //     [...typesArena].map(normalizeObject).map((value, key) => [key, value] as const),
    //   ),
    // );
    // debugger;

    let transformIterations = 0;
    while (
      typesArena.applyTransform(
        schemaTransforms.singleType,
        schemaTransforms.explode,

        schemaTransforms.resolveSingleAllOf,
        schemaTransforms.resolveSingleAnyOf,
        schemaTransforms.resolveSingleOneOf,

        schemaTransforms.flattenAllOf,
        schemaTransforms.flattenAnyOf,
        schemaTransforms.flattenOneOf,

        schemaTransforms.uniqueAllOf,
        schemaTransforms.uniqueAnyOf,
        schemaTransforms.uniqueOneOf,

        schemaTransforms.flipAllOfOneOf,
        schemaTransforms.flipAnyOfOneOf,

        schemaTransforms.inheritAllOf,
        schemaTransforms.inheritAnyOf,
        schemaTransforms.inheritOneOf,
        schemaTransforms.inheritReference,

        schemaTransforms.resolveAllOf,
        schemaTransforms.resolveAnyOf,
        schemaTransforms.resolveNot,
        schemaTransforms.resolveIfThenElse,

        schemaTransforms.unalias,
      ) > 0
    ) {
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

  // figure out which keys are actually in use
  const usedKeys = new Set<number>();
  for (const [key, item] of [...typesArena].map((item, key) => [key, item] as const)) {
    if (item.id != null) {
      usedKeys.add(key);
    }

    for (const key of selectSchemaDependencies(item)) {
      usedKeys.add(key);
    }
  }

  return {
    typesArena,
    validatorsArena,
    typesArena2,
    validatorsArena2,
    names,
    [Symbol.dispose]() {
      typesArena2[Symbol.dispose]();
      validatorsArena2[Symbol.dispose]();
      names[Symbol.dispose]();
    },
  };
}
