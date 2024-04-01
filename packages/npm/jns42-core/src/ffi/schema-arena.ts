import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";
import * as wrappers from "../wrappers/index.js";
import { SchemaItem } from "./schema-item.js";

export class SchemaArenaProxy {
  constructor(private readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);
  }

  [Symbol.dispose]() {
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
}
