import { mainFfi } from "../main-ffi.js";
import * as wrappers from "../wrappers/index.js";
import { NamesProxy } from "./names.js";
import { Wrapper } from "./wrapper.js";

export class NamesBuilderProxy extends Wrapper {
  protected drop() {
    mainFfi.exports.names_builder_drop(this.pointer);
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
