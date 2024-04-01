import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export class SchemaItemProxy {
  constructor(private readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);
  }

  [Symbol.dispose]() {
    mainFfi.exports.schema_item_drop(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.schema_item_new();
    return new SchemaItemProxy(pointer);
  }
}
