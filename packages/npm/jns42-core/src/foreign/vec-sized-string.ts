import assert from "assert";
import { mainFfi } from "../main-ffi.js";
import { ForeignObject } from "./foreign-object.js";
import { SizedString } from "./sized-string.js";

export class VecSizedString extends ForeignObject {
  public static fromArray(array: string[]) {
    const vec = VecSizedString.new(array.length);
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
    const pointer = mainFfi.exports.vec_sized_string_new(capacity);
    return new VecSizedString(pointer);
  }

  protected drop() {
    mainFfi.exports.vec_sized_string_drop(this.pointer);
  }

  public len() {
    const result = mainFfi.exports.vec_sized_string_len(this.pointer);
    return result;
  }

  public get(index: number) {
    const resultPointer = mainFfi.exports.vec_sized_string_get(this.pointer, index);
    using resultForeign = new SizedString(resultPointer);
    resultForeign.abandon();
    const result = resultForeign.toString();
    return result;
  }

  public push(value: string) {
    using valueForeign = SizedString.fromString(value);
    valueForeign.abandon();
    mainFfi.exports.vec_sized_string_push(this.pointer, valueForeign.pointer);
  }
}
