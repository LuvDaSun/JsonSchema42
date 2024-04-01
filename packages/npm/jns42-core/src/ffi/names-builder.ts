import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";
import * as wrappers from "../wrappers/index.js";
import { Names } from "./names.js";

export class NamesBuilder {
  constructor(private readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);
  }

  [Symbol.dispose]() {
    mainFfi.exports.names_builder_free(this.pointer);
  }

  public static new() {
    const pointer = mainFfi.exports.names_builder_new();
    return new NamesBuilder(pointer);
  }

  public add(key: number, value: string) {
    using valueWrapper = wrappers.SizedStringWrapper.allocate(value);
    mainFfi.exports.names_builder_add(this.pointer, key, valueWrapper.pointer);
    return this;
  }

  public setDefaultName(value: string) {
    using valueWrapper = wrappers.SizedStringWrapper.allocate(value);
    mainFfi.exports.names_builder_set_default_name(this.pointer, valueWrapper.pointer);
    return this;
  }

  public build() {
    const pointer = mainFfi.exports.names_builder_build(this.pointer);
    return new Names(pointer);
  }
}
