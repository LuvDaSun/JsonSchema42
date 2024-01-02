import { SchemaArena, SchemaModel, schemaTransforms, types } from "jns42-optimizer";
import * as schemaIntermediate from "schema-intermediate";
import * as models from "../models/index.js";

export function transformSchema(
  document: schemaIntermediate.SchemaDocument,
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

    model.minimumInclusive = schema.minimumInclusive;
    model.minimumExclusive = schema.minimumExclusive;
    model.maximumInclusive = schema.maximumInclusive;
    model.maximumExclusive = schema.maximumExclusive;
    model.multipleOf = schema.multipleOf;
    model.minimumLength = schema.minimumLength;
    model.maximumLength = schema.maximumLength;
    model.valuePattern = schema.valuePattern;
    model.valueFormat = schema.valueFormat;
    model.minimumItems = schema.minimumItems;
    model.maximumItems = schema.maximumItems;
    model.uniqueItems = schema.uniqueItems;
    model.minimumProperties = schema.minimumProperties;
    model.maximumProperties = schema.maximumProperties;

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

  while (
    arena.applyTransform(
      schemaTransforms.singleType,
      schemaTransforms.singleMergeType,
      schemaTransforms.flatten,
      schemaTransforms.alias,
      schemaTransforms.mergeAllOf,
    ) > 0
  );

  const usedKeys = new Set<number>();
  for (const [key, item] of arena) {
    if (item.id != null) {
      usedKeys.add(key);
    }

    for (const key of types.dependencies(item)) {
      usedKeys.add(key);
    }
  }

  const result: Record<string, models.Item | models.Alias> = {};
  for (const [key, model] of arena) {
    if (!usedKeys.has(key)) {
      continue;
    }

    const [newKey, newItem] = convertEntry([key, model]);
    result[newKey] = newItem;
  }

  return result;
}

function convertEntry(
  entry: [key: number, model: SchemaModel],
): [string, models.Item | models.Alias] {
  const [key, model] = entry;
  const { id } = model;

  const mapKey = (key: number) => String(key);

  if (model.alias != null) {
    return [
      mapKey(key),
      {
        id,
        type: "alias",
        target: mapKey(model.alias),
      },
    ];
  }

  if (model.oneOf != null && model.oneOf.length > 0) {
    return [
      mapKey(key),
      {
        id,
        type: "union",
        elements: model.oneOf.map(mapKey),
      },
    ];
  }

  if (model.types != null && model.types.length === 1) {
    const type = model.types[0];
    switch (type) {
      case "never":
        // TODO should error in the future
        return [
          mapKey(key),
          {
            id,
            type: "never",
          },
        ];

      case "any":
        return [
          mapKey(key),
          {
            id,
            type: "any",
          },
        ];

      case "null":
        return [
          mapKey(key),
          {
            id,
            type: "null",
          },
        ];

      case "boolean":
        return [
          mapKey(key),
          {
            id,
            type: "boolean",
          },
        ];

      case "integer":
        return [
          mapKey(key),
          {
            id,
            type: "integer",
          },
        ];

      case "number":
        return [
          mapKey(key),
          {
            id,
            type: "number",
          },
        ];

      case "string":
        return [
          mapKey(key),
          {
            id,
            type: "string",
          },
        ];

      case "array": {
        if (model.tupleItems != null) {
          return [
            mapKey(key),
            {
              id,
              type: "tuple",
              elements: model.tupleItems.map(mapKey),
            },
          ];
        }

        if (model.arrayItems != null) {
          return [
            mapKey(key),
            {
              id,
              type: "array",
              element: mapKey(model.arrayItems),
            },
          ];
        }

        throw new TypeError("no type for array elements");
      }

      case "map": {
        if (model.objectProperties != null) {
          const required = new Set(model.required);
          const { objectProperties } = model;
          const propertyNames = [...new Set([...Object.keys(model.objectProperties), ...required])];

          return [
            mapKey(key),
            {
              id,
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
                  },
                ]),
              ),
            },
          ];
        }

        if (model.mapProperties != null) {
          return [
            mapKey(key),
            {
              id,
              type: "map",
              name: "string",
              element: mapKey(model.mapProperties),
            },
          ];
        }
      }
    }
  }

  return [
    mapKey(key),
    {
      id,
      type: "unknown",
    },
  ];
}
