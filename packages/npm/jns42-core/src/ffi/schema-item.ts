import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";
import { SizedStringWrapper } from "./sized-string-wrapper.js";

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

  public read(): SchemaItemObject {
    const idPointer = mainFfi.exports.schema_item_id(this.pointer);
    using idWrapper = new SizedStringWrapper(idPointer);

    const titlePointer = mainFfi.exports.schema_item_title(this.pointer);
    using titleWrapper = new SizedStringWrapper(titlePointer);

    const deprecatedPointer = mainFfi.exports.schema_item_deprecated(this.pointer);

    const result = {
      id: idWrapper.read(),
      title: titleWrapper.read(),
    };
    return result;
  }
}

export interface SchemaItemObject {
  id?: string;
  title?: string;
  deprecated?: boolean;
}
