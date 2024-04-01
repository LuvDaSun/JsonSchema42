import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";

export class SchemaItem {
  private static finalizationRegistry = new FinalizationRegistry<Pointer>((pointer) => {
    mainFfi.exports.schema_item_free(pointer);
  });
  private token = Symbol();

  constructor(private readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);

    SchemaItem.finalizationRegistry.register(this, pointer, this.token);
  }

  [Symbol.dispose]() {
    SchemaItem.finalizationRegistry.unregister(this.token);

    mainFfi.exports.schema_item_free(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.schema_item_new();
    return new SchemaItem(pointer);
  }
}

export interface SchemaItemObject {
  id?: string;
  title?: string;
  deprecated: boolean;
}
