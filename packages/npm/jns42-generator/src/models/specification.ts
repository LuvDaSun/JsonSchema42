import * as core from "@jns42/core";
import * as schemaIntermediate from "@jns42/schema-intermediate";
import * as schemaTransforms from "../schema-transforms/index.js";
import { NodeLocation } from "../utils/node-location.js";
import { SchemaArena } from "./arena.js";
import { selectSchemaDependencies } from "./selectors.js";

export interface Specification {
  typesArena: SchemaArena;
  validatorsArena: SchemaArena;
  names: Record<string, string>;
}

export interface LoadSpecificationConfiguration {
  transformMaximumIterations: number;
  nameMaximumIterations: number;
  defaultTypeName: string;
}

export function loadSpecification(
  document: schemaIntermediate.SchemaDocument,
  configuration: LoadSpecificationConfiguration,
): Specification {
  const { transformMaximumIterations, nameMaximumIterations, defaultTypeName } = configuration;

  // load the arena
  const typesArena = SchemaArena.fromIntermediate(document);
  const validatorsArena = new SchemaArena(typesArena);

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

  // generate names
  const isIdentifierRe = /^[a-zA-Z]/u;
  const nonIdentifierRe = /[^a-zA-Z0-9]/gu;

  const namesInput: Record<string, string[]> = {};
  for (const nodeId in document.schemas) {
    const nodeLocation = NodeLocation.parse(nodeId);
    const path = [...nodeLocation.path, ...nodeLocation.anchor, ...nodeLocation.pointer]
      .map((part) => core.toSnakeCase(part))
      .flatMap((part) => part.split(nonIdentifierRe))
      .map((part) => part.trim())
      .filter((part) => isIdentifierRe.test(part))
      .filter((part) => part.length > 0);
    namesInput[nodeId] = path;
  }
  const names = Object.fromEntries(
    (
      core.optimizeNames(Object.entries(namesInput), nameMaximumIterations) as Array<
        [string, string[]]
      >
    ).map(([key, parts]) => [key, core.toSnakeCase(parts.join(" "))] as const),
  );

  return { typesArena, validatorsArena, names };
}
