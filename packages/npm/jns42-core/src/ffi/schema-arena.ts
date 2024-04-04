import * as schemaIntermediate from "@jns42/schema-intermediate";
import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import * as wrappers from "../wrappers/index.js";
import { SchemaItem, SchemaType } from "./schema-item.js";
import { VecUsizeProxy } from "./vec-usize.js";
import { Wrapper } from "./wrapper.js";

export class SchemaArenaProxy extends Wrapper {
  public static fromIntermediate(document: schemaIntermediate.SchemaJson): SchemaArenaProxy {
    const arena = SchemaArenaProxy.new();
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

    const itemCount = arena.count();
    /*
    Populate all schemas in the arena's, reference dependent schemas by their arena id
    */
    for (let itemKey = 0; itemKey < itemCount; itemKey++) {
      const item = arena.getItem(itemKey);
      const { id } = item;

      assert(id != null);

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

      arena.replaceItem(itemKey, itemNew);
    }

    return arena;
  }

  protected drop() {
    mainFfi.exports.schema_arena_drop(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.schema_arena_new();
    return new SchemaArenaProxy(pointer);
  }

  public count() {
    const count = mainFfi.exports.schema_arena_count(this.pointer);
    return count;
  }

  public addItem(item: SchemaItem): number {
    const itemString = JSON.stringify(item);
    using itemWrapper = wrappers.SizedString.allocate(itemString);
    const key = mainFfi.exports.schema_arena_add_item(this.pointer, itemWrapper.pointer);
    return key;
  }

  public replaceItem(key: number, item: SchemaItem): SchemaItem {
    const itemString = JSON.stringify(item);
    using itemWrapper = wrappers.SizedString.allocate(itemString);
    const itemPreviousPointer = mainFfi.exports.schema_arena_replace_item(
      this.pointer,
      key,
      itemWrapper.pointer,
    );
    using itemPreviousWrapper = new wrappers.SizedString(itemPreviousPointer);
    const itemPreviousString = itemPreviousWrapper.read();
    assert(itemPreviousString != null);
    const itemPrevious = JSON.parse(itemPreviousString);
    return itemPrevious;
  }

  public getItem(key: number): SchemaItem {
    const itemPointer = mainFfi.exports.schema_arena_get_item(this.pointer, key);
    using itemWrapper = new wrappers.SizedString(itemPointer);
    const itemString = itemWrapper.read();
    assert(itemString != null);
    const item = JSON.parse(itemString);
    return item;
  }

  public transform(transforms: VecUsizeProxy) {
    const result = mainFfi.exports.schema_arena_transform(this.pointer, transforms.pointer);
    return result;
  }
}
