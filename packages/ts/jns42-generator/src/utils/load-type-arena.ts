import { TypeArena, transforms, types } from "jns42-optimizer";
import * as schemaIntermediate from "schema-intermediate";

export function loadTypeArena(document: schemaIntermediate.SchemaDocument): TypeArena {
  const arena = new TypeArena();
  const idMap: Record<string, number> = {};

  for (const id in document.schemas) {
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
          const newItem: types.Array = {
            type: "array",
            element: 0,
          };

          const newKey = arena.addItem(newItem);
          typeKeys.push(newKey);
        }
        case "map": {
          const newItem: types.Map = {
            type: "map",
            name: 0,
            element: 0,
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

    const newKey = arena.addItem(newItem);
    idMap[id] = newKey;
  }

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
