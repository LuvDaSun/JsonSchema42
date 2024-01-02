import { SchemaAlias, SchemaArena, SchemaModel, schemaTransforms, types } from "jns42-optimizer";
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

  for (const id in document.schemas) {
    const newItem: SchemaModel = {
      id,
    };

    const newKey = arena.addItem(newItem);
    idMap[id] = newKey;
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

    model.oneOf = model.oneOf?.map((id) => idMap[id]);
    model.anyOf = model.anyOf?.map((id) => idMap[id]);
    model.allOf = model.allOf?.map((id) => idMap[id]);
    model.tupleItems = model.tupleItems?.map((id) => idMap[id]);

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

  while (
    arena.applyTransform(
      schemaTransforms.singleType,
      //
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
  entry: [key: number, model: SchemaModel | SchemaAlias],
): [string, models.Item | models.Alias] {
  const [key, model] = entry;

  const mapKey = (key: number) => String(key);

  if ("alias" in model) {
    return [
      mapKey(key),
      {
        id: model.id,
        type: "alias",
        target: mapKey(model.alias),
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
            id: model.id,
            type: "never",
          },
        ];

      case "any":
        return [
          mapKey(key),
          {
            id: model.id,
            type: "any",
          },
        ];

      case "null":
        return [
          mapKey(key),
          {
            id: model.id,
            type: "null",
          },
        ];

      case "boolean":
        return [
          mapKey(key),
          {
            id: model.id,
            type: "boolean",
          },
        ];

      case "integer":
        return [
          mapKey(key),
          {
            id: model.id,
            type: "integer",
          },
        ];

      case "number":
        return [
          mapKey(key),
          {
            id: model.id,
            type: "number",
          },
        ];

      case "string":
        return [
          mapKey(key),
          {
            id: model.id,
            type: "string",
          },
        ];

      case "array": {
        if (model.tupleItems != null) {
          return [
            mapKey(key),
            {
              id: model.id,
              type: "tuple",
              elements: model.tupleItems.map(mapKey),
            },
          ];
        }

        if (model.arrayItems != null) {
          return [
            mapKey(key),
            {
              id: model.id,
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
              id: model.id,
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
              id: model.id,
              type: "map",
              name: "string",
              element: mapKey(model.mapProperties),
            },
          ];
        }
      }
    }
  }

  if (model.oneOf != null) {
    return [
      mapKey(key),
      {
        id: model.id,
        type: "union",
        elements: model.oneOf.map(mapKey),
      },
    ];
  }

  return [
    mapKey(key),
    {
      type: "unknown",
    },
  ];
}
