import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";
import * as wrappers from "../wrappers/index.js";

export class SchemaItem {
  constructor(private readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);
  }

  [Symbol.dispose]() {
    mainFfi.exports.schema_item_free(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.schema_item_new();
    return new SchemaItem(pointer);
  }

  public get id(): string | undefined {
    const pointer = mainFfi.exports.schema_item_id(this.pointer);
    using wrapper = new wrappers.StringViewWrapper(pointer);
    return wrapper.read();
  }

  public get title(): string | undefined {
    const pointer = mainFfi.exports.schema_item_title(this.pointer);
    using wrapper = new wrappers.StringViewWrapper(pointer);
    return wrapper.read();
  }

  public get deprecated(): boolean | undefined {
    const pointer = mainFfi.exports.schema_item_deprecated(this.pointer);
    using wrapper = new wrappers.Box(pointer);
    const valuePointer = wrapper.read();
    if (valuePointer == null) {
      return undefined;
    } else {
      const value = mainFfi.memoryView.getInt8(valuePointer);
      return Boolean(value);
    }
  }
}
