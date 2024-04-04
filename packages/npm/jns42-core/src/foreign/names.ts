import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "./foreign-object.js";
import { SizedString } from "./sized-string.js";

export class Names extends ForeignObject {
  protected drop() {
    mainFfi.exports.names_drop(this.pointer);
  }

  public toCamelCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_camel_case(this.pointer, key);
    using resultWrapper = new SizedString(resultPointer);
    const result = resultWrapper.toString();
    assert(result != null);
    return result;
  }

  public toPascalCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_pascal_case(this.pointer, key);
    using resultWrapper = new SizedString(resultPointer);
    const result = resultWrapper.toString();
    assert(result != null);
    return result;
  }

  public toSnakeCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_snake_case(this.pointer, key);
    using resultWrapper = new SizedString(resultPointer);
    const result = resultWrapper.toString();
    assert(result != null);
    return result;
  }

  public toScreamingSnakeCase(key: number) {
    const resultPointer = mainFfi.exports.names_to_screaming_snake_case(this.pointer, key);
    using resultWrapper = new SizedString(resultPointer);
    const result = resultWrapper.toString();
    assert(result != null);
    return result;
  }
}