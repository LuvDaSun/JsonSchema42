import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";
import { SizedStringWrapper } from "./sized-string-wrapper.js";
import { Uint8Wrapper } from "./uint8-wrapper.js";

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
    using wrapper = new SizedStringWrapper(pointer);
    return wrapper.read();
  }

  public get title(): string | undefined {
    const pointer = mainFfi.exports.schema_item_title(this.pointer);
    using wrapper = new SizedStringWrapper(pointer);
    return wrapper.read();
  }

  public get deprecated(): boolean | undefined {
    const pointer = mainFfi.exports.schema_item_deprecated(this.pointer);
    using wrapper = new Uint8Wrapper(pointer);
    return Boolean(wrapper.read());
  }
}
