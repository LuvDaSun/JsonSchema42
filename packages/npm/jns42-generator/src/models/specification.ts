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
  arenaProxy: core.SchemaArena;
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

  const arenaProxy = core.SchemaArena.fromIntermediate(document);

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

    for (const sentence of path) {
      namesBuilder.add(itemKey, sentence);
    }
  }

  const names = namesBuilder.build();

  // transform the validatorsArena
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
    arenaProxy,
    names,
    [Symbol.dispose]() {
      arenaProxy[Symbol.dispose]();
      names[Symbol.dispose]();
    },
  };
}
