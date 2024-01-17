import {
  SchemaArena,
  SchemaModel,
  schemaTransforms,
  selectSchemaDependencies,
} from "jns42-optimizer";
import * as schemaIntermediate from "schema-intermediate";
import * as models from "../models/index.js";
import { Namer } from "../utils/namer.js";

export interface Specification {
  document: schemaIntermediate.SchemaDocument;
  typesArena: SchemaArena;
  validatorsArena: SchemaArena;
  names: Record<string, string>;
  typeModels: Record<string, models.Item | models.Alias>;
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
    while (
      validatorsArena.applyTransform(
        // order matters!
        schemaTransforms.explode,
        schemaTransforms.singleType,

        schemaTransforms.flatten,
        schemaTransforms.unique,
        schemaTransforms.alias,

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

  // transform the typesArena
  {
    let transformIterations = 0;
    while (
      typesArena.applyTransform(
        // order matters!
        schemaTransforms.explode,
        schemaTransforms.singleType,

        schemaTransforms.flatten,
        schemaTransforms.unique,
        schemaTransforms.alias,

        schemaTransforms.flipAllOfOneOf,
        schemaTransforms.flipAnyOfOneOf,

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

  // generate typeModels

  const typeModels: Record<string, models.Item | models.Alias> = {
    unknown: {
      type: "unknown",
    },
    any: {
      type: "any",
    },
    string: {
      type: "string",
    },
  };

  for (const [key, model] of typesArena) {
    if (!usedKeys.has(key)) {
      continue;
    }

    for (const [newKey, newItem] of convertEntry([key, model])) {
      typeModels[newKey] = newItem;
    }
  }

  return { document, typeModels, typesArena, validatorsArena, names };

  function* convertEntry(
    entry: [key: number, model: SchemaModel],
  ): Iterable<[string, models.Item | models.Alias]> {
    const [key, model] = entry;
    const metaModel = {
      id: model.id,
      title: model.title,
      description: model.description,
      examples: model.examples,
      deprecated: model.deprecated,
    };

    const mapKey = (key: number) => String(key);

    if (model.alias != null) {
      yield [
        mapKey(key),
        {
          ...metaModel,
          type: "alias",
          target: mapKey(model.alias),
        },
      ];
      return;
    }

    if (model.oneOf != null && model.oneOf.length > 0) {
      yield [
        mapKey(key),
        {
          ...metaModel,
          type: "union",
          elements: model.oneOf.map((key) => mapKey(key)),
        },
      ];
      return;
    }

    if (model.types != null && model.types.length === 1) {
      const type = model.types[0];
      switch (type) {
        case "never":
          // TODO should error in the future
          yield [
            mapKey(key),
            {
              ...metaModel,
              type: "never",
            },
          ];
          return;

        case "any":
          yield [
            mapKey(key),
            {
              ...metaModel,
              type: "any",
            },
          ];
          return;

        case "null":
          yield [
            mapKey(key),
            {
              ...metaModel,
              type: "null",
            },
          ];
          return;

        case "boolean":
          yield [
            mapKey(key),
            {
              ...metaModel,
              type: "boolean",
              options: model.options,
            },
          ];
          return;

        case "integer":
          yield [
            mapKey(key),
            {
              ...metaModel,
              type: "integer",
              options: model.options,

              minimumInclusive: model.minimumInclusive,
              minimumExclusive: model.minimumExclusive,
              maximumInclusive: model.maximumInclusive,
              maximumExclusive: model.maximumExclusive,
              multipleOf: model.multipleOf,
            },
          ];
          return;

        case "number":
          yield [
            mapKey(key),
            {
              ...metaModel,
              type: "number",
              options: model.options,

              minimumInclusive: model.minimumInclusive,
              minimumExclusive: model.minimumExclusive,
              maximumInclusive: model.maximumInclusive,
              maximumExclusive: model.maximumExclusive,
              multipleOf: model.multipleOf,
            },
          ];
          return;

        case "string":
          yield [
            mapKey(key),
            {
              ...metaModel,
              type: "string",
              options: model.options,

              minimumLength: model.minimumLength,
              maximumLength: model.maximumLength,
              // valuePattern: model.valuePattern,
              // valueFormat: model.valueFormat,
            },
          ];
          return;

        case "array": {
          if (model.tupleItems != null) {
            yield [
              mapKey(key),
              {
                ...metaModel,
                type: "tuple",
                elements: model.tupleItems.map((key) => mapKey(key)),

                // uniqueItems: model.uniqueItems,
              },
            ];
            return;
          }

          if (model.arrayItems != null) {
            yield [
              mapKey(key),
              {
                ...metaModel,
                type: "array",
                element: mapKey(model.arrayItems),

                // uniqueItems: model.uniqueItems,
                minimumItems: model.minimumItems,
                maximumItems: model.maximumItems,
              },
            ];
            return;
          }

          yield [
            mapKey(key),
            {
              ...metaModel,
              type: "array",
              element: "any",

              // uniqueItems: model.uniqueItems,
              minimumItems: model.minimumItems,
              maximumItems: model.maximumItems,
            },
          ];
          return;
        }

        case "map": {
          if (model.objectProperties != null) {
            const required = new Set(model.required);
            const { objectProperties } = model;
            const propertyNames = [
              ...new Set([...Object.keys(model.objectProperties), ...required]),
            ];

            yield [
              mapKey(key),
              {
                ...metaModel,
                type: "object",
                properties: Object.fromEntries(
                  propertyNames.map((propertyName) => [
                    propertyName,
                    {
                      required: required.has(propertyName),
                      element:
                        objectProperties[propertyName] == null
                          ? "any"
                          : mapKey(objectProperties[propertyName]),

                      minimumProperties: model.minimumProperties,
                      maximumProperties: model.maximumProperties,
                    },
                  ]),
                ),
              },
            ];
            return;
          }

          if (model.mapProperties != null) {
            yield [
              mapKey(key),
              {
                ...metaModel,
                type: "map",
                name: model.propertyNames == null ? "string" : mapKey(model.propertyNames),
                element: mapKey(model.mapProperties),

                minimumProperties: model.minimumProperties,
                maximumProperties: model.maximumProperties,
              },
            ];
            return;
          }

          yield [
            mapKey(key),
            {
              ...metaModel,
              type: "map",
              name: model.propertyNames == null ? "string" : mapKey(model.propertyNames),
              element: "any",

              minimumProperties: model.minimumProperties,
              maximumProperties: model.maximumProperties,
            },
          ];
          return;
        }
      }
    }

    yield [
      mapKey(key),
      {
        ...metaModel,
        type: "unknown",
      },
    ];
  }
}
