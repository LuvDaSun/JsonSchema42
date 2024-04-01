import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { NULL_POINTER, Pointer } from "../utils/index.js";
import * as wrappers from "../wrappers/index.js";

export class Names {
  constructor(private readonly pointer: Pointer) {
    assert(pointer !== NULL_POINTER);
  }

  [Symbol.dispose]() {
    mainFfi.exports.names_free(this.pointer);
  }

  public toCamelCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_camel_case(this.pointer, key);
    using resultWrapper = new wrappers.SizedStringWrapper(resultPointer);
    const result = resultWrapper.read();
    return result;
  }

  public toPascalCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_pascal_case(this.pointer, key);
    using resultWrapper = new wrappers.SizedStringWrapper(resultPointer);
    const result = resultWrapper.read();
    return result;
  }

  public toSnakeCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_snake_case(this.pointer, key);
    using resultWrapper = new wrappers.SizedStringWrapper(resultPointer);
    const result = resultWrapper.read();
    return result;
  }

  public toScreamingSnakeCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_screaming_snake_case(this.pointer, key);
    using resultWrapper = new wrappers.SizedStringWrapper(resultPointer);
    const result = resultWrapper.read();
    return result;
  }
}
