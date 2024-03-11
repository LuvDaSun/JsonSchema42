import * as schemaIntermediate from "@jns42/schema-intermediate";
import { Arena, ArenaTransform } from "../utils/arena.js";
import { SchemaItem, SchemaType } from "./item.js";

export type SchemaTransform = ArenaTransform<SchemaItem, SchemaArena>;

export class SchemaArena extends Arena<SchemaItem> {
  public isMockable(key: number) {
    const item = this.getItem(key);

    // we can only mock exact items
    if (!(item.exact ?? false)) {
      return false;
    }

    // we might support this one day
    if (item.uniqueItems != null) {
      return false;
    }

    // one day we might support some formats
    if (item.valueFormat != null) {
      return false;
    }

    // anything with a regex cannot be mocked
    if (item.valuePattern != null) {
      return false;
    }

    if (item.types != null) {
      // we cannot mock never types
      if (item.types.every((type) => type === "never")) {
        return false;
      }
    }

    if (item.reference != null) {
      if (!this.isMockable(item.reference)) {
        return false;
      }
    }

    if (item.if != null) {
      return false;
    }
    if (item.then != null) {
      return false;
    }
    if (item.else != null) {
      return false;
    }
    if (item.not != null) {
      return false;
    }

    if (item.mapProperties != null) {
      if (!this.isMockable(item.mapProperties)) {
        return false;
      }
    }

    if (item.arrayItems != null) {
      if (!this.isMockable(item.arrayItems)) {
        return false;
      }
    }

    if (item.propertyNames != null) {
      if (!this.isMockable(item.propertyNames)) {
        return false;
      }
    }

    if (item.contains != null) {
      return false;
    }

    if (item.oneOf != null && item.oneOf.length > 0) {
      if (!item.oneOf.some((key) => this.isMockable(key))) {
        return false;
      }
    }

    if (item.anyOf != null && item.anyOf.length > 0) {
      return false;
    }

    if (item.allOf != null && item.allOf.length > 0) {
      return false;
    }

    if (item.objectProperties != null && Object.keys(item.objectProperties).length > 0) {
      const required = new Set(item.required);
      if (
        !Object.entries(item.objectProperties)
          .filter(([name, key]) => required.has(name))
          .every(([name, key]) => this.isMockable(key))
      ) {
        return false;
      }
    }

    // anything with a regex cannot be mocked
    if (item.patternProperties != null && Object.keys(item.patternProperties).length > 0) {
      return false;
    }
    if (item.dependentSchemas != null && Object.keys(item.dependentSchemas).length > 0) {
      return false;
    }

    return true;
  }

  public resolveKey(key: number): number {
    let item = this.getItem(key);
    while (true) {
      if (item.reference == null) {
        break;
      }

      if (item.oneOf != null && item.oneOf.length > 1) {
        break;
      }

      if (item.anyOf != null && item.anyOf.length > 1) {
        break;
      }

      if (item.allOf != null && item.allOf.length > 1) {
        break;
      }

      if (item.types != null && item.types.length > 0) {
        break;
      }

      if (item.if != null) {
        break;
      }

      if (item.then != null) {
        break;
      }

      if (item.else != null) {
        break;
      }

      if (item.not != null) {
        break;
      }

      if (item.mapProperties != null) {
        break;
      }

      if (item.arrayItems != null) {
        break;
      }

      if (item.propertyNames != null) {
        break;
      }

      if (item.contains != null) {
        break;
      }

      if (item.tupleItems != null && item.tupleItems.length > 0) {
        break;
      }

      if (item.objectProperties != null && Object.keys(item.objectProperties).length > 0) {
        break;
      }

      if (item.patternProperties != null && Object.keys(item.patternProperties).length > 0) {
        break;
      }

      if (item.dependentSchemas != null && Object.keys(item.dependentSchemas).length > 0) {
        break;
      }

      if (item.options != null && item.options.length > 0) {
        break;
      }

      if (item.required != null && item.required.length > 0) {
        break;
      }

      if (item.minimumInclusive != null) {
        break;
      }

      if (item.minimumExclusive != null) {
        break;
      }

      if (item.maximumInclusive != null) {
        break;
      }

      if (item.maximumExclusive != null) {
        break;
      }

      if (item.multipleOf != null) {
        break;
      }

      if (item.minimumLength != null) {
        break;
      }

      if (item.maximumLength != null) {
        break;
      }

      if (item.valuePattern != null && item.valuePattern.length > 0) {
        break;
      }

      if (item.valueFormat != null && item.valueFormat.length > 0) {
        break;
      }

      if (item.minimumItems != null) {
        break;
      }

      if (item.maximumItems != null) {
        break;
      }

      if (item.uniqueItems != null) {
        break;
      }

      if (item.minimumProperties != null) {
        break;
      }

      if (item.maximumProperties != null) {
        break;
      }

      key = item.reference;
      item = this.getItem(key);
    }
    return key;
  }

  public static fromIntermediate(document: schemaIntermediate.SchemaDocument): SchemaArena {
    const arena = new SchemaArena();
    /*
    the schemas in the arena get a new id
    */
    const idMap: Record<string, number> = {};
    const implicitTypes: Record<string, SchemaType[]> = {};

    for (const id in document.schemas) {
      const schema = document.schemas[id];
      const newItem: SchemaItem = {
        id,
      };

      const newKey = arena.addItem(newItem);
      idMap[id] = newKey;

      if (schema.options != null) {
        const types = new Set<SchemaType>();
        for (const option of schema.options) {
          switch (typeof option) {
            case "string":
              types.add("string");
              break;
            case "number":
              types.add("number");
              break;
            case "bigint":
              types.add("integer");
              break;
            case "boolean":
              types.add("boolean");
              break;
          }
        }
        implicitTypes[id] ??= [];
        implicitTypes[id].push(...types);
      }

      if (schema.propertyNames != null) {
        implicitTypes[schema.propertyNames] ??= [];
        implicitTypes[schema.propertyNames].push("string");
      }
    }

    /*
    Populate all schemas in the arena's, reference dependent schemas by their arena id
    */
    arena.applyTransform((arena, key) => {
      const item = arena.getItem(key);
      const { id } = item;

      if (id == null) {
        return;
      }

      const schema = document.schemas[id];

      const itemNew: SchemaItem = {
        id,
      };

      // initially all items are exact
      itemNew.exact = true;

      itemNew.title = schema.title;
      itemNew.description = schema.description;
      itemNew.examples = schema.examples;
      itemNew.deprecated = schema.deprecated;

      itemNew.required = schema.required;
      itemNew.options = schema.options;

      itemNew.uniqueItems = schema.uniqueItems;

      itemNew.minimumInclusive = schema.minimumInclusive;
      itemNew.minimumExclusive = schema.minimumExclusive;
      itemNew.maximumInclusive = schema.maximumInclusive;
      itemNew.maximumExclusive = schema.maximumExclusive;
      itemNew.minimumLength = schema.minimumLength;
      itemNew.maximumLength = schema.maximumLength;
      itemNew.minimumItems = schema.minimumItems;
      itemNew.maximumItems = schema.maximumItems;
      itemNew.minimumProperties = schema.minimumProperties;
      itemNew.maximumProperties = schema.maximumProperties;
      itemNew.multipleOf = schema.multipleOf;

      itemNew.valuePattern = schema.valuePattern == null ? undefined : [schema.valuePattern];
      itemNew.valueFormat = schema.valueFormat == null ? undefined : [schema.valueFormat];

      itemNew.reference = schema.reference == null ? undefined : idMap[schema.reference];
      itemNew.if = schema.if == null ? undefined : idMap[schema.if];
      itemNew.then = schema.then == null ? undefined : idMap[schema.then];
      itemNew.else = schema.else == null ? undefined : idMap[schema.else];
      itemNew.not = schema.not == null ? undefined : idMap[schema.not];
      itemNew.mapProperties =
        schema.mapProperties == null ? undefined : idMap[schema.mapProperties];
      itemNew.propertyNames =
        schema.propertyNames == null ? undefined : idMap[schema.propertyNames];
      itemNew.arrayItems = schema.arrayItems == null ? undefined : idMap[schema.arrayItems];
      itemNew.contains = schema.contains == null ? undefined : idMap[schema.contains];

      itemNew.oneOf = schema.oneOf?.map((id) => idMap[id]);
      itemNew.anyOf = schema.anyOf?.map((id) => idMap[id]);
      itemNew.allOf = schema.allOf?.map((id) => idMap[id]);

      itemNew.tupleItems = schema.tupleItems?.map((id) => idMap[id]);

      itemNew.dependentSchemas =
        schema.dependentSchemas == null
          ? undefined
          : Object.fromEntries(
              Object.entries(schema.dependentSchemas).map(([name, id]) => [name, idMap[id]]),
            );
      itemNew.objectProperties =
        schema.objectProperties == null
          ? undefined
          : Object.fromEntries(
              Object.entries(schema.objectProperties).map(([name, id]) => [name, idMap[id]]),
            );
      itemNew.patternProperties =
        schema.patternProperties == null
          ? undefined
          : Object.fromEntries(
              Object.entries(schema.patternProperties).map(([name, id]) => [name, idMap[id]]),
            );

      itemNew.types = schema.types ?? implicitTypes[id];

      arena.setItem(key, itemNew);
    });

    return arena;
  }
}
