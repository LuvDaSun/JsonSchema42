import {
  SchemaArena,
  SchemaModel,
  schemaTransforms,
  selectSchemaDependencies,
} from "jns42-optimizer";
import * as schemaIntermediate from "schema-intermediate";
import * as models from "../models/index.js";

export function transformSchema(
  document: schemaIntermediate.SchemaDocument,
  maximumIterations: number,
): Record<string, models.Item | models.Alias> {
  const arena = new SchemaArena();
  /*
  the schemas in the arena get a new id
  */
  const idMap: Record<string, number> = {};
  const parents: Record<string, string> = {};

  for (const id in document.schemas) {
    const schema = document.schemas[id];
    const newItem: SchemaModel = {
      id,
    };

    const newKey = arena.addItem(newItem);
    idMap[id] = newKey;

    if (schema.allOf != null) {
      for (const child of schema.allOf) {
        parents[child] = id;
      }
    }

    if (schema.anyOf != null) {
      for (const child of schema.anyOf) {
        parents[child] = id;
      }
    }

    if (schema.oneOf != null) {
      for (const child of schema.oneOf) {
        parents[child] = id;
      }
    }

    if (schema.if != null) {
      parents[schema.if] = id;
    }
    if (schema.then != null) {
      parents[schema.then] = id;
    }
    if (schema.else != null) {
      parents[schema.else] = id;
    }

    if (schema.not != null) {
      parents[schema.not] = id;
    }
  }

  /*
  Populate all schemas in the arena's, reference dependent schemas by their arena id
  */
  arena.applyTransform((arena, item) => {
    const { id } = item;

    if (id == null) {
      return item;
    }

    const schema = document.schemas[id];

    const model: SchemaModel = {
      id,
      parent: parents[id] == null ? undefined : idMap[parents[id]],
    };

    model.title = schema.title;
    model.description = schema.description;
    model.examples = schema.examples;
    model.deprecated = schema.deprecated;

    model.types = schema.types;
    model.required = schema.required;
    model.options = schema.options;

    model.uniqueItems = schema.uniqueItems;

    model.minimumInclusive = schema.minimumInclusive;
    model.minimumExclusive = schema.minimumExclusive;
    model.maximumInclusive = schema.maximumInclusive;
    model.maximumExclusive = schema.maximumExclusive;
    model.minimumLength = schema.minimumLength;
    model.maximumLength = schema.maximumLength;
    model.minimumItems = schema.minimumItems;
    model.maximumItems = schema.maximumItems;
    model.minimumProperties = schema.minimumProperties;
    model.maximumProperties = schema.maximumProperties;
    model.multipleOf = schema.multipleOf;

    model.valuePattern = schema.valuePattern == null ? undefined : [schema.valuePattern];
    model.valueFormat = schema.valueFormat == null ? undefined : [schema.valueFormat];

    model.reference = schema.reference == null ? undefined : idMap[schema.reference];
    model.if = schema.if == null ? undefined : idMap[schema.if];
    model.then = schema.then == null ? undefined : idMap[schema.then];
    model.else = schema.else == null ? undefined : idMap[schema.else];
    model.not = schema.not == null ? undefined : idMap[schema.not];
    model.mapProperties = schema.mapProperties == null ? undefined : idMap[schema.mapProperties];
    model.propertyNames = schema.propertyNames == null ? undefined : idMap[schema.propertyNames];
    model.arrayItems = schema.arrayItems == null ? undefined : idMap[schema.arrayItems];
    model.contains = schema.contains == null ? undefined : idMap[schema.contains];

    model.oneOf = schema.oneOf?.map((id) => idMap[id]);
    model.anyOf = schema.anyOf?.map((id) => idMap[id]);
    model.allOf = schema.allOf?.map((id) => idMap[id]);
    model.tupleItems = schema.tupleItems?.map((id) => idMap[id]);

    model.dependentSchemas =
      schema.dependentSchemas == null
        ? undefined
        : Object.fromEntries(
            Object.entries(schema.dependentSchemas).map(([name, id]) => [name, idMap[id]]),
          );
    model.objectProperties =
      schema.objectProperties == null
        ? undefined
        : Object.fromEntries(
            Object.entries(schema.objectProperties).map(([name, id]) => [name, idMap[id]]),
          );
    model.patternProperties =
      schema.patternProperties == null
        ? undefined
        : Object.fromEntries(
            Object.entries(schema.patternProperties).map(([name, id]) => [name, idMap[id]]),
          );

    return model;
  });

  /*
  set parent schemas
  */

  let iterations = 0;
  while (arena.applyTransform(schemaTransforms.all) > 0) {
    iterations++;
    if (iterations < maximumIterations) {
      continue;
    }
    throw new Error("maximum number of iterations reached");
  }

  const usedKeys = new Set<number>();
  for (const [key, item] of arena) {
    if (item.id != null) {
      usedKeys.add(key);
    }

    for (const key of selectSchemaDependencies(item)) {
      usedKeys.add(key);
    }
  }

  const result: Record<string, models.Item | models.Alias> = {
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

  for (const [key, model] of arena) {
    if (!usedKeys.has(key)) {
      continue;
    }

    for (const [newKey, newItem] of convertEntry([key, model])) {
      result[newKey] = newItem;
    }
  }

  return result;

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
