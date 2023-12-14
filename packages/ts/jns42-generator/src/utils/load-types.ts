import { TypeArena, transforms, types } from "jns42-optimizer";
import * as schemaIntermediate from "schema-intermediate";
import * as models from "../models/index.js";

export function loadTypes(
  document: schemaIntermediate.SchemaDocument,
): Record<string, models.Item | models.Alias> {
  const arena = new TypeArena();
  const idMap: Record<string, number> = {};

  const stringKey = arena.addItem({
    type: "string",
  });
  const anyKey = arena.addItem({
    type: "any",
  });

  for (const id in document.schemas) {
    const newItem: types.Unknown = {
      id,
      type: "unknown",
    };

    const newKey = arena.addItem(newItem);
    idMap[id] = newKey;
  }

  arena.applyTransform((arena, item) => {
    const { id } = item;

    if (id == null) {
      return item;
    }

    const node = document.schemas[id];

    const baseElements = new Array<number>();

    {
      const typeElements = new Array<number>();

      for (const type of node.types) {
        switch (type) {
          case "never": {
            const newItem: types.Never = {
              type: "never",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }

          case "any": {
            const newItem: types.Any = {
              type: "any",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }

          case "null": {
            const newItem: types.Null = {
              type: "null",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }

          case "boolean": {
            const newItem: types.Boolean = {
              type: "boolean",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }
          case "number": {
            const newItem: types.Number = {
              type: "number",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }
          case "integer": {
            const newItem: types.Integer = {
              type: "integer",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }
          case "string": {
            const newItem: types.String = {
              type: "string",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }
          case "array": {
            const compoundElements = new Array<number>();

            if (node.tupleItems != null) {
              const elements = node.tupleItems.map((tupleItem) => idMap[tupleItem]);

              const newItem: types.Tuple = {
                type: "tuple",
                elements,
              };

              const newKey = arena.addItem(newItem);
              compoundElements.push(newKey);
            }

            if (node.arrayItems != null && node.arrayItems.length > 0) {
              const element = idMap[node.arrayItems];

              const newItem: types.Array = {
                type: "array",
                element,
              };

              const newKey = arena.addItem(newItem);
              compoundElements.push(newKey);
            }

            if (compoundElements.length > 0) {
              const compoundItem: types.AllOf = {
                type: "allOf",
                allOf: compoundElements,
              };

              const compoundKey = arena.addItem(compoundItem);
              typeElements.push(compoundKey);
            }

            break;
          }
          case "map": {
            const compoundElements = new Array<number>();

            if (
              node.objectProperties != null ||
              (node.required != null && node.required.length > 0)
            ) {
              const requiredProperties = new Set(node.required);
              const propertyNames = new Set([
                ...Object.keys(node.objectProperties ?? {}),
                ...requiredProperties,
              ]);
              const propertyEntries = [...propertyNames].map((propertyName) => [
                propertyName,
                {
                  required: requiredProperties.has(propertyName),
                  element:
                    node.objectProperties?.[propertyName] == null
                      ? anyKey
                      : idMap[node.objectProperties[propertyName]],
                },
              ]);
              const properties = Object.fromEntries(propertyEntries);

              const newItem: types.Object = {
                type: "object",
                properties,
              };

              const newKey = arena.addItem(newItem);
              compoundElements.push(newKey);
            }

            if (node.mapProperties != null) {
              const name = node.propertyNames == null ? stringKey : idMap[node.propertyNames];
              const element = idMap[node.mapProperties];

              const newItem: types.Map = {
                type: "map",
                name,
                element,
              };

              const newKey = arena.addItem(newItem);
              compoundElements.push(newKey);
            }

            if (compoundElements.length > 0) {
              const compoundItem: types.AllOf = {
                type: "allOf",
                allOf: compoundElements,
              };

              const compoundKey = arena.addItem(compoundItem);
              typeElements.push(compoundKey);
            }

            break;
          }
        }
      }

      if (node.reference != null) {
        const referenceKey = idMap[node.reference];

        baseElements.push(referenceKey);
      }

      if (typeElements.length > 0) {
        const typeItem: types.OneOf = {
          type: "oneOf",
          oneOf: typeElements,
        };
        const typeKey = arena.addItem(typeItem);

        baseElements.push(typeKey);
      }
    }

    if (node.allOf != null && node.allOf.length > 0) {
      const newItem: types.AllOf = {
        type: "allOf",
        allOf: node.allOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);
      baseElements.push(newKey);
    }

    if (node.anyOf != null && node.anyOf.length > 0) {
      const newItem: types.AnyOf = {
        type: "anyOf",
        anyOf: node.anyOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);

      baseElements.push(newKey);
    }

    if (node.oneOf != null && node.oneOf.length > 0) {
      const newItem: types.OneOf = {
        type: "oneOf",
        oneOf: node.oneOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);

      baseElements.push(newKey);
    }

    const baseItem: types.AllOf = {
      id,
      type: "allOf",
      allOf: baseElements,
    };

    return baseItem;
  });

  while (
    arena.applyTransform(
      transforms.flatten,
      transforms.alias,
      transforms.unknown,
      transforms.allOf,
      transforms.anyOf,
      transforms.oneOf,
      transforms.allOfOneOf,
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
  for (const [key, item] of arena) {
    if (!usedKeys.has(key)) {
      continue;
    }

    const [newKey, newItem] = convertTypeEntry([key, item]);
    result[newKey] = newItem;
  }

  return result;
}

function convertTypeEntry(
  entry: [key: number, item: types.ArenaTypeItem],
): [string, models.Item | models.Alias] {
  const [key, item] = entry;

  const mapKey = (key: number) => String(key);

  if (types.isAlias(item)) {
    return [
      mapKey(key),
      {
        id: item.id,
        type: "alias",
        target: mapKey(item.alias),
      },
    ];
  }

  switch (item.type) {
    case "unknown":
      // TODO should error in the future
      return [
        mapKey(key),
        {
          id: item.id,
          type: "unknown",
        },
      ];

    case "never":
      // TODO should error in the future
      return [
        mapKey(key),
        {
          id: item.id,
          type: "never",
        },
      ];

    case "any":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "any",
        },
      ];

    case "null":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "null",
        },
      ];

    case "boolean":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "boolean",
        },
      ];

    case "integer":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "integer",
        },
      ];

    case "number":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "number",
        },
      ];

    case "string":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "string",
        },
      ];

    case "tuple":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "tuple",
          elements: item.elements.map(mapKey),
        },
      ];

    case "array":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "array",
          element: mapKey(item.element),
        },
      ];

    case "object":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "object",
          properties: Object.fromEntries(
            Object.entries(item.properties).map(([name, { required, element }]) => [
              name,
              { required, element: mapKey(element) },
            ]),
          ),
        },
      ];

    case "map":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "map",
          name: mapKey(item.name),
          element: mapKey(item.element),
        },
      ];

    case "oneOf":
      return [
        mapKey(key),
        {
          id: item.id,
          type: "union",
          elements: item.oneOf.map(mapKey),
        },
      ];

    default:
      throw new TypeError(`${item.type} not supported`);
  }
}
