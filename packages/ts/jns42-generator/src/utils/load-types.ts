import assert from "assert";
import { TypeArena, types } from "jns42-optimizer";
import * as schemaIntermediate from "schema-intermediate";
import * as models from "../models/index.js";

export function loadTypes(
  document: schemaIntermediate.SchemaDocument,
): Record<string, models.Item | models.Alias> {
  const arena = new TypeArena();
  const idMap: Record<string, number> = {};

  const utilityTypes = {
    any: arena.addItem({
      type: "any",
    }),
    string: arena.addItem({
      type: "string",
    }),
  };

  for (const id in document.schemas) {
    const newItem: types.Type = {
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

      if (node.types != null) {
        for (const type of node.types) {
          switch (type) {
            case "never": {
              const newItem: types.Type = {
                type: "never",
              };

              const newKey = arena.addItem(newItem);
              typeElements.push(newKey);

              break;
            }

            case "any": {
              const newItem: types.Type = {
                type: "any",
              };

              const newKey = arena.addItem(newItem);
              typeElements.push(newKey);

              break;
            }

            case "null": {
              const newItem: types.Type = {
                type: "null",
              };

              const newKey = arena.addItem(newItem);
              typeElements.push(newKey);

              break;
            }

            case "boolean": {
              const newItem: types.Type = {
                type: "boolean",
              };

              const newKey = arena.addItem(newItem);
              typeElements.push(newKey);

              break;
            }
            case "number": {
              const newItem: types.Type = {
                type: "number",
              };

              const newKey = arena.addItem(newItem);
              typeElements.push(newKey);

              break;
            }
            case "integer": {
              const newItem: types.Type = {
                type: "integer",
              };

              const newKey = arena.addItem(newItem);
              typeElements.push(newKey);

              break;
            }
            case "string": {
              const newItem: types.Type = {
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

                const newItem: types.Type = {
                  type: "tuple",
                  tupleElements: elements,
                };

                const newKey = arena.addItem(newItem);
                compoundElements.push(newKey);
              }

              if (node.arrayItems != null && node.arrayItems.length > 0) {
                const element = idMap[node.arrayItems];

                const newItem: types.Type = {
                  type: "array",
                  arrayElement: element,
                };

                const newKey = arena.addItem(newItem);
                compoundElements.push(newKey);
              }

              if (compoundElements.length > 0) {
                const compoundItem: types.AllOf = {
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
                const properties = Object.fromEntries(
                  Object.entries(node.objectProperties ?? {}).map(([name, element]) => [
                    name,
                    idMap[element],
                  ]),
                );

                for (const required of node.required ?? []) {
                  properties[required] ??= utilityTypes.any;
                }

                const newItem: types.Type = {
                  type: "object",
                  required: node.required,
                  objectProperties: properties,
                };

                const newKey = arena.addItem(newItem);
                compoundElements.push(newKey);
              }

              if (node.mapProperties != null) {
                const name =
                  node.propertyNames == null ? utilityTypes.string : idMap[node.propertyNames];
                const element = idMap[node.mapProperties];

                const newItem: types.Type = {
                  type: "map",
                  propertyName: name,
                  mapElement: element,
                };

                const newKey = arena.addItem(newItem);
                compoundElements.push(newKey);
              }

              if (compoundElements.length > 0) {
                const compoundItem: types.AllOf = {
                  allOf: compoundElements,
                };

                const compoundKey = arena.addItem(compoundItem);
                typeElements.push(compoundKey);
              }

              break;
            }
          }
        }
      }

      if (node.reference != null) {
        const referenceKey = idMap[node.reference];

        baseElements.push(referenceKey);
      }

      if (typeElements.length > 0) {
        const typeItem: types.OneOf = {
          oneOf: typeElements,
        };
        const typeKey = arena.addItem(typeItem);

        baseElements.push(typeKey);
      }
    }

    if (node.allOf != null && node.allOf.length > 0) {
      const newItem: types.AllOf = {
        allOf: node.allOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);
      baseElements.push(newKey);
    }

    if (node.anyOf != null && node.anyOf.length > 0) {
      const newItem: types.AnyOf = {
        anyOf: node.anyOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);

      baseElements.push(newKey);
    }

    if (node.oneOf != null && node.oneOf.length > 0) {
      const newItem: types.OneOf = {
        oneOf: node.oneOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);

      baseElements.push(newKey);
    }

    const baseItem: types.AllOf = {
      id,
      allOf: baseElements,
    };

    return baseItem;
  });

  while (arena.applyTransform() > 0);

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
  entry: [key: number, item: types.Item],
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

  if (types.isOneOf(item)) {
    return [
      mapKey(key),
      {
        id: item.id,
        type: "union",
        elements: item.oneOf.map(mapKey),
      },
    ];
  }

  if (types.isType(item)) {
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
        assert(item.tupleElements != null);

        return [
          mapKey(key),
          {
            id: item.id,
            type: "tuple",
            elements: item.tupleElements.map(mapKey),
          },
        ];

      case "array":
        assert(item.arrayElement != null);

        return [
          mapKey(key),
          {
            id: item.id,
            type: "array",
            element: mapKey(item.arrayElement),
          },
        ];

      case "object": {
        assert(item.objectProperties != null);
        const required = new Set(item.required);

        return [
          mapKey(key),
          {
            id: item.id,
            type: "object",
            properties: Object.fromEntries(
              Object.entries(item.objectProperties).map(([name, element]) => [
                name,
                {
                  required: required.has(name),
                  element: mapKey(element),
                },
              ]),
            ),
          },
        ];
      }
      case "map":
        assert(item.propertyName != null && item.mapElement != null);

        return [
          mapKey(key),
          {
            id: item.id,
            type: "map",
            name: mapKey(item.propertyName),
            element: mapKey(item.mapElement),
          },
        ];
    }
  }

  throw new TypeError(`item not supported`);
}
