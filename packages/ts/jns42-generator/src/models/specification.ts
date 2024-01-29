import * as schemaIntermediate from "@jns42/schema-intermediate";
import * as schemaTransforms from "../schema-transforms/index.js";
import { SchemaArena, selectSchemaDependencies } from "../schema/index.js";
import { Namer } from "../utils/namer.js";

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
  const validatorsArena = typesArena.clone();

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
    let transformIterations = 0;
    while (
      typesArena.applyTransform(
        // order matters!
        schemaTransforms.mockable,

        schemaTransforms.explode,
        schemaTransforms.singleType,

        schemaTransforms.flipAllOfOneOf,
        schemaTransforms.flipAnyOfOneOf,

        schemaTransforms.flatten,
        schemaTransforms.unique,
        schemaTransforms.alias,

        schemaTransforms.resolveIfThenElse,
        schemaTransforms.resolveAllOf,
        schemaTransforms.resolveAnyOf,
        schemaTransforms.resolveOneOf,
        schemaTransforms.resolveParent,

        schemaTransforms.flushParent,
      ) > 0
    ) {
      transformIterations++;
      if (transformIterations < transformMaximumIterations) {
        continue;
      }
      throw new Error("maximum number of iterations reached");
    }
  }

  // figure out which keys are actually in use
  const usedKeys = new Set<number>();
  for (const [key, item] of typesArena) {
    if (item.id != null) {
      usedKeys.add(key);
    }

    for (const key of selectSchemaDependencies(item)) {
      usedKeys.add(key);
    }
  }

  // generate names

  const namer = new Namer(defaultTypeName, nameMaximumIterations);
  for (const nodeId in document.schemas) {
    const nodeUrl = new URL(nodeId);
    const path = nodeUrl.pathname + nodeUrl.hash.replace(/^#/g, "");
    namer.registerPath(nodeId, path);
  }
  const names = namer.getNames();

  return { typesArena, validatorsArena, names };
}
