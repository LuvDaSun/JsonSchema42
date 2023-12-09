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

    const typeKeys = new Array<number>();

    for (const type of node.types) {
      switch (type) {
        case "never": {
          const newItem: types.Never = {
            type: "never",
          };

          const newKey = arena.addItem(newItem);
          typeKeys.push(newKey);
        }

        case "any": {
          const newItem: types.Any = {
            type: "any",
          };

          const newKey = arena.addItem(newItem);
          typeKeys.push(newKey);
        }

        case "null": {
          const newItem: types.Null = {
            type: "null",
          };

          const newKey = arena.addItem(newItem);
          typeKeys.push(newKey);
        }

        case "boolean": {
          const newItem: types.Boolean = {
            type: "boolean",
          };

          const newKey = arena.addItem(newItem);
          typeKeys.push(newKey);
        }
        case "number": {
          const newItem: types.Number = {
            type: "number",
          };

          const newKey = arena.addItem(newItem);
          typeKeys.push(newKey);
        }
        case "integer": {
          const newItem: types.Integer = {
            type: "integer",
          };

          const newKey = arena.addItem(newItem);
          typeKeys.push(newKey);
        }
        case "string": {
          const newItem: types.String = {
            type: "string",
          };

          const newKey = arena.addItem(newItem);
          typeKeys.push(newKey);
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

          const newItem: types.AllOf = {
            type: "allOf",
            elements: compoundElements,
          };

          const newKey = arena.addItem(newItem);
          typeKeys.push(newKey);
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

          const newItem: types.AllOf = {
            type: "allOf",
            elements: compoundElements,
          };

          const newKey = arena.addItem(newItem);
          typeKeys.push(newKey);
        }
      }
    }

    const newItem: types.OneOf = {
      id,
      type: "oneOf",
      elements: typeKeys,
    };

    return newItem;
  });

  debugger;

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

  return arena;
}
