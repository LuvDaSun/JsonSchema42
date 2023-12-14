import { TypeArena, transforms, types } from "jns42-optimizer";
import * as schemaIntermediate from "schema-intermediate";
import * as models from "../models/index.js";

export function loadTypes(
  document: schemaIntermediate.SchemaDocument,
): Record<string, models.Item | models.Alias> {
  const arena = arenaFromIntermediate(document);
  const typesEntries = Array.from(typesFromTypeArena(arena));
  const types = Object.fromEntries(typesEntries);
  return types;
}

function arenaFromIntermediate(document: schemaIntermediate.SchemaDocument) {
  const arena = new TypeArena();
  const idMap: Record<string, number> = {};

  const stringKey = arena.addItem({
    id: null,
    type: "string",
  });
  const anyKey = arena.addItem({
    id: null,
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
              id: null,
              type: "never",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }

          case "any": {
            const newItem: types.Any = {
              id: null,
              type: "any",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }

          case "null": {
            const newItem: types.Null = {
              id: null,
              type: "null",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }

          case "boolean": {
            const newItem: types.Boolean = {
              id: null,
              type: "boolean",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }
          case "number": {
            const newItem: types.Number = {
              id: null,
              type: "number",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }
          case "integer": {
            const newItem: types.Integer = {
              id: null,
              type: "integer",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);

            break;
          }
          case "string": {
            const newItem: types.String = {
              id: null,
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
                id: null,
                type: "tuple",
                elements,
              };

              const newKey = arena.addItem(newItem);
              compoundElements.push(newKey);
            }

            if (node.arrayItems != null && node.arrayItems.length > 0) {
              const element = idMap[node.arrayItems];

              const newItem: types.Array = {
                id: null,
                type: "array",
                element,
              };

              const newKey = arena.addItem(newItem);
              compoundElements.push(newKey);
            }

            if (compoundElements.length > 0) {
              const compoundItem: types.AllOf = {
                id: null,
                type: "allOf",
                elements: compoundElements,
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
                id: null,
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
                id: null,
                type: "map",
                name,
                element,
              };

              const newKey = arena.addItem(newItem);
              compoundElements.push(newKey);
            }

            if (compoundElements.length > 0) {
              const compoundItem: types.AllOf = {
                id: null,
                type: "allOf",
                elements: compoundElements,
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
          id: null,
          type: "oneOf",
          elements: typeElements,
        };
        const typeKey = arena.addItem(typeItem);

        baseElements.push(typeKey);
      }
    }

    if (node.allOf != null && node.allOf.length > 0) {
      const newItem: types.AllOf = {
        id: null,
        type: "allOf",
        elements: node.allOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);
      baseElements.push(newKey);
    }

    if (node.anyOf != null && node.anyOf.length > 0) {
      const newItem: types.AnyOf = {
        id: null,
        type: "anyOf",
        elements: node.anyOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);

      baseElements.push(newKey);
    }

    if (node.oneOf != null && node.oneOf.length > 0) {
      const newItem: types.OneOf = {
        id: null,
        type: "oneOf",
        elements: node.oneOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);

      baseElements.push(newKey);
    }

    const baseItem: types.AllOf = {
      id,
      type: "allOf",
      elements: baseElements,
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

  return arena;
}

function* typesFromTypeArena(arena: TypeArena): Iterable<[string, models.Item | models.Alias]> {
  const usedKeys = new Set(findUsedKeys(arena));

  const mapKey = (key: number) => String(key);

  for (const key of usedKeys) {
    const item = arena.getItem(key);

    switch (item.type) {
      case "unknown":
        // TODO should error in the future
        yield [
          String(key),
          {
            id: item.id,
            type: "unknown",
          },
        ];
        break;

      case "never":
        // TODO should error in the future
        yield [
          String(key),
          {
            id: item.id,
            type: "never",
          },
        ];
        break;

      case "any":
        yield [
          String(key),
          {
            id: item.id,
            type: "any",
          },
        ];
        break;

      case "null":
        yield [
          String(key),
          {
            id: item.id,
            type: "null",
          },
        ];
        break;

      case "boolean":
        yield [
          String(key),
          {
            id: item.id,
            type: "boolean",
          },
        ];
        break;

      case "integer":
        yield [
          String(key),
          {
            id: item.id,
            type: "integer",
          },
        ];
        break;

      case "number":
        yield [
          String(key),
          {
            id: item.id,
            type: "number",
          },
        ];
        break;

      case "string":
        yield [
          String(key),
          {
            id: item.id,
            type: "string",
          },
        ];
        break;

      case "tuple":
        yield [
          String(key),
          {
            id: item.id,
            type: "tuple",
            elements: item.elements.map(mapKey),
          },
        ];
        break;

      case "array":
        yield [
          String(key),
          {
            id: item.id,
            type: "array",
            element: mapKey(item.element),
          },
        ];
        break;

      case "object":
        yield [
          String(key),
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
        break;

      case "map":
        yield [
          String(key),
          {
            id: item.id,
            type: "map",
            name: mapKey(item.name),
            element: mapKey(item.element),
          },
        ];
        break;

      case "oneOf":
        yield [
          String(key),
          {
            id: item.id,
            type: "union",
            elements: item.elements.map(mapKey),
          },
        ];
        break;

      case "alias":
        yield [
          String(key),
          {
            id: item.id,
            type: "alias",
            target: mapKey(item.target),
          },
        ];
        break;

      default:
        throw new TypeError(`${item.type} not supported`);
    }
  }
}

function* findUsedKeys(arena: TypeArena) {
  for (const [key, item] of arena) {
    if (item.id != null) {
      yield key;
    }

    switch (item.type) {
      case "oneOf":
      case "anyOf":
      case "allOf":
        for (const element of item.elements) {
          yield element;
        }
        break;

      case "alias":
        yield item.target;
        break;

      case "tuple":
        for (const element of item.elements) {
          yield element;
        }
        break;
      case "array":
        yield item.element;
        break;
      case "object":
        for (const { element } of Object.values(item.properties)) {
          yield element;
        }
        break;
      case "map":
        yield item.name;
        yield item.element;
        break;
    }
  }
}
