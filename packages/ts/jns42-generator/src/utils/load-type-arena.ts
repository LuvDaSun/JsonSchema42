import { TypeArena, transforms, types } from "jns42-optimizer";
import * as schemaIntermediate from "schema-intermediate";

export function loadTypeArena(document: schemaIntermediate.SchemaDocument): TypeArena {
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
          }

          case "any": {
            const newItem: types.Any = {
              type: "any",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);
          }

          case "null": {
            const newItem: types.Null = {
              type: "null",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);
          }

          case "boolean": {
            const newItem: types.Boolean = {
              type: "boolean",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);
          }
          case "number": {
            const newItem: types.Number = {
              type: "number",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);
          }
          case "integer": {
            const newItem: types.Integer = {
              type: "integer",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);
          }
          case "string": {
            const newItem: types.String = {
              type: "string",
            };

            const newKey = arena.addItem(newItem);
            typeElements.push(newKey);
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
                elements: compoundElements,
              };

              const compoundKey = arena.addItem(compoundItem);
              typeElements.push(compoundKey);
            }
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
                elements: compoundElements,
              };

              const compoundKey = arena.addItem(compoundItem);
              typeElements.push(compoundKey);
            }
          }
        }
      }

      if (typeElements.length > 0) {
        const typeItem: types.OneOf = {
          type: "oneOf",
          elements: typeElements,
        };
        const typeKey = arena.addItem(typeItem);

        baseElements.push(typeKey);
      }
    }

    if (node.allOf != null && node.allOf.length > 0) {
      const newItem: types.AllOf = {
        type: "allOf",
        elements: node.allOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);
      baseElements.push(newKey);
    }

    if (node.anyOf != null && node.anyOf.length > 0) {
      const newItem: types.AnyOf = {
        type: "anyOf",
        elements: node.anyOf.map((element) => idMap[element]),
      };
      const newKey = arena.addItem(newItem);

      baseElements.push(newKey);
    }

    if (node.oneOf != null && node.oneOf.length > 0) {
      const newItem: types.OneOf = {
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
    ) > 0
  );

  const keep = new Set<number>();
  for (const [key, item] of arena) {
    if (item.id != null) {
      keep.add(key);
    }

    switch (item.type) {
      case "oneOf":
      case "anyOf":
      case "allOf":
        for (const element of item.elements) {
          keep.add(element);
        }
        break;

      case "alias":
        keep.add(item.target);
        break;

      case "tuple":
        for (const element of item.elements) {
          keep.add(element);
        }
        break;
      case "array":
        keep.add(item.element);
        break;
      case "object":
        for (const { element } of Object.values(item.properties)) {
          keep.add(element);
        }
        break;
      case "map":
        keep.add(item.name);
        keep.add(item.element);
        break;
    }
  }

  let unknownCount = 0;
  for (const [key, item] of arena) {
    if (!keep.has(key)) {
      continue;
    }

    if (item.type === "unknown") {
      unknownCount++;
    }
  }

  return arena;
}
