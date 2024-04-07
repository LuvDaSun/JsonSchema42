import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { CString } from "./c-string.js";
import { ForeignObject } from "./foreign-object.js";

export class VecCString extends ForeignObject {
  public static fromArray(array: string[]) {
    const vec = VecCString.new(array.length);
    for (const item of array) {
      vec.push(item);
    }
    assert.equal(vec.len(), array.length);
    return vec;
  }

  public toArray(): string[] | undefined {
    const { pointer } = this;
    if (pointer === 0) {
      return undefined;
    } else {
      const len = this.len();
      const result = new Array(len);
      for (let index = 0; index < len; index++) {
        const value = this.get(index);
        result[index] = value;
      }
      return result;
    }
  }

  public static new(capacity: number) {
    const pointer = mainFfi.exports.vec_c_string_new(capacity);
    return new VecCString(pointer);
  }

  protected drop() {
    mainFfi.exports.vec_c_string_drop(this.pointer);
  }

  public len() {
    const result = mainFfi.exports.vec_c_string_len(this.pointer);
    return result;
  }

  public get(index: number) {
    const resultPointer = mainFfi.exports.vec_c_string_get(this.pointer, index);
    using resultForeign = new CString(resultPointer);
    resultForeign.abandon();
    const result = resultForeign.toString();
    return result;
  }

  public push(value: string) {
    using valueForeign = CString.fromString(value);
    valueForeign.abandon();
    mainFfi.exports.vec_c_string_push(this.pointer, valueForeign.pointer);
  }
}
