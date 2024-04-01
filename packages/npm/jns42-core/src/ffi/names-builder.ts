import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";
import * as wrappers from "../wrappers/index.js";
import { NamesProxy } from "./names.js";

export class NamesBuilderProxy {
  constructor(private readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);
  }

  [Symbol.dispose]() {
    mainFfi.exports.names_builder_free(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.names_builder_new();
    return new NamesBuilderProxy(pointer);
  }

  public add(key: number, value: string) {
    using valueWrapper = wrappers.SizedString.allocate(value);
    mainFfi.exports.names_builder_add(this.pointer, key, valueWrapper.pointer);
    return this;
  }

  public setDefaultName(value: string) {
    using valueWrapper = wrappers.SizedString.allocate(value);
    mainFfi.exports.names_builder_set_default_name(this.pointer, valueWrapper.pointer);
    return this;
  }

  public build() {
    const pointer = mainFfi.exports.names_builder_build(this.pointer);
    return new NamesProxy(pointer);
  }
}
