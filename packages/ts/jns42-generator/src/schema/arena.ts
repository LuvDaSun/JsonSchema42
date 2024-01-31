import * as schemaIntermediate from "@jns42/schema-intermediate";
import assert from "assert";
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

  public renderItems() {
    const keys = [...this].filter(([key, item]) => item.id != null).map(([key]) => key);
    return keys.map((key) => this.renderItem(key));
  }

  public renderItem(key: number): any {
    const item = this.getItem(key);
    const rendered: any = {};

    const formatId = (id: string) => {
      return new URL(id).hash;
    };

    const mapItemKey = (key: number) => {
      const item = this.getItem(key);
      if (item.id) {
        return formatId(item.id);
      }

      return this.renderItem(key);
    };

    rendered.mockable = item.mockable;
    rendered.id = item.id == null ? undefined : formatId(item.id);
    rendered.title = item.title;
    rendered.description = item.description;
    rendered.examples = item.examples;
    rendered.deprecated = item.deprecated;

    rendered.types = item.types;

    rendered.required = item.required;
    rendered.options = item.options;

    rendered.minimumInclusive = item.minimumInclusive;
    rendered.minimumExclusive = item.minimumExclusive;
    rendered.maximumInclusive = item.maximumInclusive;
    rendered.maximumExclusive = item.maximumExclusive;
    rendered.multipleOf = item.multipleOf;
    rendered.minimumLength = item.minimumLength;
    rendered.maximumLength = item.maximumLength;
    rendered.valuePattern = item.valuePattern;
    rendered.valueFormat = item.valueFormat;
    rendered.minimumItems = item.minimumItems;
    rendered.maximumItems = item.maximumItems;
    rendered.uniqueItems = item.uniqueItems;
    rendered.minimumProperties = item.minimumProperties;
    rendered.maximumProperties = item.maximumProperties;

    rendered.alias = item.alias == null ? undefined : mapItemKey(item.alias);
    rendered.parent = item.parent == null ? undefined : mapItemKey(item.parent);
    rendered.reference = item.reference == null ? undefined : mapItemKey(item.reference);
    rendered.if = item.if == null ? undefined : mapItemKey(item.if);
    rendered.then = item.then == null ? undefined : mapItemKey(item.then);
    rendered.else = item.else == null ? undefined : mapItemKey(item.else);
    rendered.not = item.not == null ? undefined : mapItemKey(item.not);
    rendered.mapProperties =
      item.mapProperties == null ? undefined : mapItemKey(item.mapProperties);
    rendered.propertyNames =
      item.propertyNames == null ? undefined : mapItemKey(item.propertyNames);
    rendered.arrayItems = item.arrayItems == null ? undefined : mapItemKey(item.arrayItems);
    rendered.contains = item.contains == null ? undefined : mapItemKey(item.contains);

    rendered.oneOf = item.oneOf == null ? undefined : item.oneOf.map(mapItemKey);
    rendered.anyOf = item.anyOf == null ? undefined : item.anyOf.map(mapItemKey);
    rendered.allOf = item.allOf == null ? undefined : item.allOf.map(mapItemKey);
    rendered.tupleItems = item.tupleItems == null ? undefined : item.tupleItems.map(mapItemKey);

    rendered.dependentSchemas =
      item.dependentSchemas == null
        ? undefined
        : Object.fromEntries(
            Object.entries(item.dependentSchemas).map(([name, key]) => [name, mapItemKey(key)]),
          );
    rendered.objectProperties =
      item.objectProperties == null
        ? undefined
        : Object.fromEntries(
            Object.entries(item.objectProperties).map(([name, key]) => [name, mapItemKey(key)]),
          );
    rendered.patternProperties =
      item.patternProperties == null
        ? undefined
        : Object.fromEntries(
            Object.entries(item.patternProperties).map(([name, key]) => [name, mapItemKey(key)]),
          );

    return rendered;
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
