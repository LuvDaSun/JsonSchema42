import * as schemaIntermediate from "@jns42/schema-intermediate";
import { SchemaArena, selectSchemaDependencies } from "../models/index.js";
import * as schemaTransforms from "../schema-transforms/index.js";
import { Namer } from "../utils/namer.js";
import { NodeLocation } from "../utils/node-location.js";

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

        schemaTransforms.singleType,
        schemaTransforms.explode,

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
        schemaTransforms.unalias,
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
    const nodeLocation = NodeLocation.parse(nodeId);
    const path = [...nodeLocation.path, ...nodeLocation.anchor, ...nodeLocation.pointer]
      .filter((part) => part.length > 0)
      .join("/");
    namer.registerPath(nodeId, path);
  }
  const names = namer.getNames();

  return { typesArena, validatorsArena, names };
}
