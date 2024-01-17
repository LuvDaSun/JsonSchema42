import assert from "assert";
import * as schemaIntermediate from "schema-intermediate";
import { Arena, ArenaTransform } from "../utils/arena.js";
import { SchemaModel, SchemaType, isAliasSchemaModel } from "./model.js";

export type SchemaTransform = ArenaTransform<SchemaModel, SchemaArena>;

export class SchemaArena extends Arena<SchemaModel> {
  public resolveItem(key: number): [number, SchemaModel] {
    let resolvedKey = key;
    let resolvedItem = this.getItem(resolvedKey);
    while (isAliasSchemaModel(resolvedItem)) {
      resolvedKey = resolvedItem.alias;
      resolvedItem = this.getItem(resolvedKey);
    }
    return [resolvedKey, resolvedItem];
  }

  public clone(): SchemaArena {
    const arena = new SchemaArena();
    for (const [key, item] of this) {
      const newKey = arena.addItem(item);
      assert.equal(newKey, key);
    }
    return arena;
  }

  public static fromIntermediate(document: schemaIntermediate.SchemaDocument): SchemaArena {
    const arena = new SchemaArena();
    /*
    the schemas in the arena get a new id
    */
    const idMap: Record<string, number> = {};
    const parents: Record<string, string> = {};
    const implicitTypes: Record<string, SchemaType> = {};

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

      if (schema.propertyNames != null) {
        implicitTypes[schema.propertyNames] = "string";
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

      model.types =
        schema.types == null
          ? implicitTypes[id] == null
            ? undefined
            : [implicitTypes[id]]
          : schema.types;

      return model;
    });

    return arena;
  }
}
